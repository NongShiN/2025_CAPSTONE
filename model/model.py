from openai import OpenAI
import argparse
import datetime
import json
import os
import logging
from util.config import load_prompt
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

# === Configuration ===
client = OpenAI(api_key=OPENAI_API_KEY)
retriever_model = SentenceTransformer("all-MiniLM-L6-v2")
#retriever_model = SentenceTransformer("all-mpnet-base-v2")

# === Logging Configuration ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

# === Constants ===
CBT_TECHNIQUES = [
    "Guided Discovery", "Efficiency Evaluation", "Pie Chart Technique",
    "Alternative Perspective", "Decatastrophizing", "Scaling Questions",
    "Socratic Questioning", "Pros and Cons Analysis", "Thought Experiment",
    "Evidence-Based Questioning", "Reality Testing", "Continuum Technique",
    "Changing Rules to Wishes", "Behavior Experiment", "Activity Scheduling",
    "Problem-Solving Skills Training", "Self-Assertiveness Training",
    "Role-playing and Simulation", "Practice of Assertive Conversation Skills",
    "Systematic Exposure", "Safety Behaviors Elimination"
]

# === Argument Parsing ===
def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--static_prompt_name', type=str, default='static_prompt.txt')
    parser.add_argument('--cd_prompt_name', type=str, default='detect_cognitive_distortion.txt')
    parser.add_argument('--insight_prompt_name', type=str, default='extract_insight.txt')
    parser.add_argument('--model', type=str, default='gpt-4o-mini')
    parser.add_argument('--temperature', type=float, default=0.7)
    parser.add_argument('--basic_memory_path', type=str, required=True)
    parser.add_argument('--cd_memory_path', type=str, required=True)
    parser.add_argument('--cbt_log_path', type=str, default='cbt_log.json')
    parser.add_argument('--top_k', type=int, default=5)
    parser.add_argument('--cbt_stage_path', type=str, default='cbt_stages.json')
    return parser.parse_args()


# === Utilities ===
def normalize(value, max_value):
    return value / max_value if max_value else 0

def call_llm(prompt, model="gpt-4o-mini", temperature=0.7):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature
    )
    content = response.choices[0].message.content.strip()
    
    # Optional: remove 'Counselor:' if it appears at the start
    if content.lower().startswith("counselor:"):
        content = content[len("counselor:"):].strip()

    return content

def load_memory(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()
        if not content:
            logging.warning("Memory file '%s' is empty. Initializing with empty list.", file_path)
            return []
        return json.loads(content)

def save_memory(memory, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(memory, f, indent=2, ensure_ascii=False, default=str)

def update_cbt_usage_log(log_path, technique, current_stage):
    log = {}
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            log = json.load(f)
    log[technique] = int(current_stage.strip().split(" ")[-1])
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=2, ensure_ascii=False)
    return log

# === Memory Extraction ===
def extract_memory_from_utterance(client_utterance, f_llm, model, temperature, cd_prompt_template, insight_prompt_template):
    insight_prompt = insight_prompt_template.replace("{client_utterance}", client_utterance)
    insight = f_llm(insight_prompt, model=model, temperature=temperature)
    basic_entry = {
        "utterance": client_utterance,
        "insight": insight,
        "timestamp": datetime.datetime.now().isoformat()
    }

    cd_prompt = cd_prompt_template.replace("[latest dialogue]", client_utterance)
    cd_response = f_llm(cd_prompt, model=model, temperature=temperature)
    try:
        cd_data = json.loads(cd_response)
        if cd_data:
            cd_entry = {
                "utterance": cd_data["utterance"],
                "type": cd_data["type"],
                "severity": cd_data["score"],
                "timestamp": datetime.datetime.now().isoformat()
            }
        else:
            cd_entry = None
    except Exception:
        cd_entry = None

    return basic_entry, cd_entry

# === CD Priority ===
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

# === Memory Retrieval ===
def retrieve_relevant_memories(args, cd_to_treat, basic_memory, cd_memory):
    basic_texts = [f"Utterance: {entry['utterance']}\nInsight: {entry['insight']}" for entry in basic_memory]
    doc_embeddings = retriever_model.encode(basic_texts, convert_to_tensor=True)
    query_embedding = retriever_model.encode(cd_to_treat, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(query_embedding, doc_embeddings)[0]
    top_indices = cos_scores.topk(args.top_k).indices
    top_basic = [basic_texts[i] for i in top_indices]
    matching_cd = [entry["utterance"] for entry in cd_memory if entry["type"] == cd_to_treat]
    return top_basic + matching_cd

# === Prompt Generation ===
def generate_static_prompt(task, esc_guide, u, template):
    return template.replace("{task}", task).replace("{esc_guide}", esc_guide).replace("{U}", u)

def generate_dynamic_prompt(cd_type, technique, stage, example):
    return f"""
CBT Technique to Use: {technique}
Stage: {stage}
Example Phrase: {example}
"""

def assemble_final_prompt(static_prompt, dynamic_prompt=""):
    return static_prompt + ("\n" + dynamic_prompt if dynamic_prompt else "")

# === Main Composition ===
def compose_prompt(args, counselor_utterance, client_utterance, task, esc,
                   basic_memory, cd_memory, f_llm, model, temperature,
                   static_template):

    u = f"Counselor: {counselor_utterance}\nClient: {client_utterance}"
    static = generate_static_prompt(task, esc, u, static_template)
    if not cd_memory:
        return assemble_final_prompt(static)

    cd_to_treat = calculate_cd_priority(cd_memory)
    retrieved_memories = retrieve_relevant_memories(args, cd_to_treat, basic_memory, cd_memory)
    retrieved_context = "\n".join([f"- {x}" for x in retrieved_memories])

    technique_prompt_template = load_prompt("decide_cbt_technique.txt")
    technique_prompt = technique_prompt_template.replace("{distortion_to_treat}", cd_to_treat).replace("{memory}", retrieved_context)
    cbt_technique = f_llm(technique_prompt, model=model, temperature=temperature)

    cbt_info = load_cbt_technique_info(args.cbt_stage_path)
    technique_data = cbt_info.get(cbt_technique.strip(), {})
    progress_description = "\n".join([f"{s['stage']}: {s['description']}" for s in technique_data.get("stages", [])])
    example_dialogue = technique_data.get("example", "")

    stage_prompt_template = load_prompt("decide_cbt_stage.txt")
    cbt_log = update_cbt_usage_log(args.cbt_log_path, cbt_technique, "0")  # default stage 0
    stage_prompt = stage_prompt_template.replace("[CBT technique]", cbt_technique)
    stage_prompt = stage_prompt.replace("[CBT Technique]", cbt_technique)
    stage_prompt = stage_prompt.replace("[CBT progress]", progress_description)
    stage_prompt = stage_prompt.replace("[CBT Usage Log]", json.dumps(cbt_log))
    stage_prompt = stage_prompt.replace("[CBT dialogue]", example_dialogue)

    stage_response = f_llm(stage_prompt, model=model, temperature=temperature)
    if ":" in stage_response:
        stage, example = map(str.strip, stage_response.split(":", 1))
    else:
        stage, example = "Stage 1", stage_response.strip()

    update_cbt_usage_log(args.cbt_log_path, cbt_technique, stage)
    dynamic = generate_dynamic_prompt(cd_to_treat, cbt_technique, stage, example)
    return assemble_final_prompt(static, dynamic)

def load_cbt_technique_info(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"CBT technique info file not found: {path}")
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

# === Main Execution ===
if __name__ == "__main__":
    args = parse_args()
    logging.info("Starting CoCoA counselor agent...")

    basic_memory = load_memory(args.basic_memory_path)
    cd_memory = load_memory(args.cd_memory_path)
    logging.info("Loaded memories. Basic: %d entries, CD: %d entries", len(basic_memory), len(cd_memory))

    static_prompt_template = load_prompt(args.static_prompt_name)
    cd_prompt_template = load_prompt(args.cd_prompt_name)
    insight_prompt_template = load_prompt(args.insight_prompt_name)
    logging.info("Loaded prompt templates.")

    client_utterance = "I keep failing at everything I try."
    counselor_utterance = "I hear you're struggling a lot lately."
    logging.info("Processing client utterance: %s", client_utterance)

    basic_entry, cd_entry = extract_memory_from_utterance(
        client_utterance,
        call_llm,
        args.model,
        args.temperature,
        cd_prompt_template,
        insight_prompt_template
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
        task="Help the client reframe their thoughts with a clear, empathetic and therapeutic message. Respond in plain text without role labels.",
        esc="Use empathy, reflection, and cognitive restructuring techniques.",
        basic_memory=basic_memory,
        cd_memory=cd_memory,
        f_llm=call_llm,
        model=args.model,
        temperature=args.temperature,
        static_template=static_prompt_template
    )
    logging.info("Composed final prompt for LLM input.")

    response = call_llm(full_prompt, model=args.model, temperature=args.temperature)

    print(f"Previous conversation:\nCounselor: {counselor_utterance}\nClient: {client_utterance}")
    print("\n======================================================================\n")
    print(f"Counselor Response:\n{response}")
