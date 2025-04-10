from openai import OpenAI
import argparse
import datetime
import json
import os
import logging
from util.util import load_prompt, normalize, load_cbt_technique_info, clean_json_response
from util.memory_management import load_memory, save_memory
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv

cur_dir = os.path.dirname(os.path.abspath(__file__))

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

client = OpenAI(api_key=OPENAI_API_KEY)
retriever_model = SentenceTransformer("all-MiniLM-L6-v2")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--final_prompt_name', type=str, default='final_prompt.txt')
    parser.add_argument('--cd_prompt_name', type=str, default='detect_cognitive_distortion.txt')
    parser.add_argument('--insight_prompt_name', type=str, default='extract_insight.txt')
    parser.add_argument('--model', type=str, default='gpt-4o-mini')
    parser.add_argument('--temperature', type=float, default=0.7)
    parser.add_argument('--basic_memory_path', type=str, required=True)
    parser.add_argument('--cd_memory_path', type=str, required=True)
    parser.add_argument('--cbt_log_name', type=str, default='cbt_log.json')
    parser.add_argument('--top_k', type=int, default=5)
    parser.add_argument('--cbt_info_name', type=str, default='cbt_info.json')
    return parser.parse_args()

def call_llm(prompt, model="gpt-4o-mini", temperature=0.7):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature
    )
    content = response.choices[0].message.content.strip()
    if content.lower().startswith("counselor:"):
        content = content[len("counselor:"):].strip()
    return content

def update_cbt_usage_log(log_path, technique, current_stage):
    log = {}
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            try:
                content = f.read().strip()
                if content:
                    log = json.loads(content)
            except json.JSONDecodeError as e:
                logging.warning("CBT log file is invalid JSON. Reinitializing. Error: %s", e)

    log[technique] = int(current_stage)
    
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=2, ensure_ascii=False)

    return log

def calculate_cd_priority(cd_memory, alpha_recency=1.0, alpha_frequency=1.0, alpha_severity=1.0):
    now = datetime.datetime.now()
    scores = {}
    all_types = set(cd["type"] for cd in cd_memory)

    for cd_type in all_types:
        cds = [cd for cd in cd_memory if cd["type"] == cd_type]
        latest_time = max(datetime.datetime.fromisoformat(cd["timestamp"]) for cd in cds)
        recency = (now - latest_time).total_seconds()
        recency_score = max(0, 1 - recency / 3600)

        frequency = len(cds)
        avg_severity = sum(cd["severity"] for cd in cds) / frequency

        recency_norm = normalize(recency_score, 1)
        frequency_norm = normalize(frequency, max(len(cd_memory), 1))
        severity_norm = normalize(avg_severity, 5)

        score = (
            alpha_recency * recency_norm +
            alpha_frequency * frequency_norm +
            alpha_severity * severity_norm
        )
        scores[cd_type] = score

    return max(scores, key=scores.get) if scores else None

def extract_memory_from_utterance(client_utterance, f_llm, model, temperature, cd_prompt_template, insight_prompt_template, timestamp):
    insight_prompt = insight_prompt_template.replace("[Client utterance]", client_utterance)
    insight = f_llm(insight_prompt, model=model, temperature=temperature)

    basic_entry = {
        "utterance": client_utterance,
        "insight": insight,
        "timestamp": timestamp
    }

    cd_prompt = cd_prompt_template.replace("[Latest dialogue]", client_utterance)
    cd_response = f_llm(cd_prompt, model=model, temperature=temperature)
    logging.info("CD raw response: %s", cd_response)

    cd_entry = None
    if cd_response.strip():
        try:
            cleaned = clean_json_response(cd_response)
            cd_data = json.loads(cleaned)
            score = int(cd_data["score"]) if isinstance(cd_data["score"], (str, float)) else cd_data["score"]
            cd_entry = {
                "utterance": cd_data["utterance"],
                "type": cd_data["type"],
                "severity": score,
                "timestamp": timestamp
            }
        except Exception as e:
            logging.warning("Failed to parse CD response: %s", e)
            cd_entry = None

    return basic_entry, cd_entry

def retrieve_relevant_memories(args, cd_to_treat, basic_memory, cd_memory):
    basic_texts = [f"Utterance: {entry['utterance']}\nInsight: {entry['insight']}" for entry in basic_memory]
    if not basic_texts:
        return []
    doc_embeddings = retriever_model.encode(basic_texts, convert_to_tensor=True)
    query_embedding = retriever_model.encode(cd_to_treat, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(query_embedding, doc_embeddings)[0]
    k = min(args.top_k, len(basic_texts))
    top_indices = cos_scores.topk(k).indices
    top_basic = [basic_texts[i] for i in top_indices]
    matching_cd = [entry["utterance"] for entry in cd_memory if entry["type"] == cd_to_treat]
    return top_basic + matching_cd

def compose_prompt(args, counselor_utterance, client_utterance,
                   basic_memory, cd_memory, f_llm, model, temperature):
    latest_dialogue = f"Counselor: {counselor_utterance}\nClient: {client_utterance}"

    if not cd_memory:
        cbt_technique = "None"
        progress_description = "None"
        stage = "None"
        example = "None"
    else:
        cd_to_treat = calculate_cd_priority(cd_memory)
        retrieved_memories = retrieve_relevant_memories(args, cd_to_treat, basic_memory, cd_memory)
        retrieved_context = "\n".join([f"- {x}" for x in retrieved_memories])

        technique_prompt_template = load_prompt("decide_cbt_technique.txt")
        technique_prompt = technique_prompt_template.replace("[Distortion to treat]", cd_to_treat).replace("[Memory]", retrieved_context)
        cbt_technique = f_llm(technique_prompt, model=model, temperature=temperature)

        cbt_info = load_cbt_technique_info(args.cbt_info_name)
        technique_data = cbt_info[cbt_technique]
        progress_description = "\n".join([f"{s['stage']}: {s['description']}" for s in technique_data.get("stages", [])])
        example = technique_data.get("example", "")

        stage_prompt_template = load_prompt("decide_cbt_stage.txt")
        cbt_log = update_cbt_usage_log(args.cbt_log_name, cbt_technique, "0")
        stage_prompt = stage_prompt_template.replace("[CBT technique]", cbt_technique)
        stage_prompt = stage_prompt.replace("[CBT Technique]", cbt_technique)
        stage_prompt = stage_prompt.replace("[CBT progress]", progress_description)
        stage_prompt = stage_prompt.replace("[CBT Usage Log]", json.dumps(cbt_log))
        stage_prompt = stage_prompt.replace("[CBT dialogue]", example)
        stage = f_llm(stage_prompt, model=model, temperature=temperature)
        update_cbt_usage_log(args.cbt_log_name, cbt_technique, stage)

    final_template = load_prompt(args.final_prompt_name)
    final_prompt = final_template.replace("[Latest dialogue]", latest_dialogue)
    final_prompt = final_prompt.replace("[CBT technique]", cbt_technique)
    final_prompt = final_prompt.replace("[CBT documentation]", progress_description)
    final_prompt = final_prompt.replace("[CBT stage]", stage)
    final_prompt = final_prompt.replace("[CBT stage example]", example)

    return final_prompt

if __name__ == "__main__":
    args = parse_args()
    logging.info("Starting counselor agent...")

    basic_memory = load_memory(args.basic_memory_path)
    cd_memory = load_memory(args.cd_memory_path)
    logging.info("Loaded memories. Basic: %d entries, CD: %d entries", len(basic_memory), len(cd_memory))

    final_prompt_template = load_prompt(args.final_prompt_name)
    cd_prompt_template = load_prompt(args.cd_prompt_name)
    insight_prompt_template = load_prompt(args.insight_prompt_name)
    logging.info("Loaded prompt templates.")

    counselor_utterance = "I hear you're struggling a lot lately."
    client_utterance = "I keep failing at everything I try."
    logging.info("Processing client utterance: %s", client_utterance)

    timestamp = datetime.datetime.now().isoformat()
    basic_entry, cd_entry = extract_memory_from_utterance(
        client_utterance,
        call_llm,
        args.model,
        args.temperature,
        cd_prompt_template,
        insight_prompt_template,
        timestamp
    )
    basic_memory.append(basic_entry)
    if cd_entry:
        cd_memory.append(cd_entry)
        logging.info("Detected cognitive distortion: %s (Severity: %s)", cd_entry['type'], cd_entry['severity'])
    else:
        logging.info("No cognitive distortion detected.")

    save_memory(basic_memory, args.basic_memory_path)
    save_memory(cd_memory, args.cd_memory_path)
    logging.info("Saved updated memory files.")

    full_prompt = compose_prompt(
        args,
        counselor_utterance,
        client_utterance,
        basic_memory=basic_memory,
        cd_memory=cd_memory,
        f_llm=call_llm,
        model=args.model,
        temperature=args.temperature
    )
    logging.info("Composed final prompt for LLM input.")

    response = call_llm(full_prompt, model=args.model, temperature=args.temperature)

    print(f"Previous conversation:\nCounselor: {counselor_utterance}\nClient: {client_utterance}")
    print("\n======================================================================\n")
    print(f"Counselor Response:\n{response}")
