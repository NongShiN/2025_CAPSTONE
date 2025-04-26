import json
import os
import sys
from .utils.memory_management import load_memory, save_memory
from .utils.util import load_prompt, load_cbt_technique_info, call_llm, clean_json_response, normalize
from .utils.args import parse_args
import datetime
from sentence_transformers import util as st_util
import logging



logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

class SupervisorCBT:
    def __init__(self, args, llm, retriever, model="gpt-4o-mini", temperature=0.7):
        self.llm = llm
        self.model = model
        self.temperature = temperature
        self.cd_memory = load_memory(args.cd_memory_path)
        self.basic_memory = load_memory(args.basic_memory_path)
        self.retriever = retriever
        self.insight_prompt_template = load_prompt(args.insight_prompt_name)
        self.cd_prompt_template = load_prompt(args.cd_prompt_name)
        
    def update_cbt_usage_log(self, cbt_usage_log_path, technique, current_stage):
        abs_path = os.path.join(os.path.dirname(__file__), "..", cbt_usage_log_path)
        abs_path = os.path.abspath(abs_path)
        
        log = {}
        if os.path.exists(abs_path):
            with open(abs_path, 'r', encoding='utf-8') as f:
                try:
                    content = f.read().strip()
                    if content:
                        log = json.loads(content)
                except json.JSONDecodeError as e:
                    logging.warning("CBT log file is invalid JSON. Reinitializing. Error: %s", e)

        log[technique] = int(current_stage)

        with open(abs_path, 'w', encoding='utf-8') as f:
            json.dump(log, f, indent=2, ensure_ascii=False)

        return log

    def calculate_cd_priority(self, cd_memory, alpha_recency=1.0, alpha_frequency=1.0, alpha_severity=1.0):
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
    
    def extract_info_from_utterance(self, client_utterance, f_llm, cd_prompt_template, insight_prompt_template, timestamp):
        insight_prompt = insight_prompt_template.replace("[Client utterance]", client_utterance)
        insight = f_llm(insight_prompt, llm=self.llm, model=self.model, temperature=self.temperature)

        basic_info = {
            "utterance": client_utterance,
            "insight": insight,
            "timestamp": timestamp
        }

        cd_prompt = cd_prompt_template.replace("[Latest dialogue]", client_utterance)
        cd_response = f_llm(cd_prompt, llm=self.llm, model=self.model, temperature=self.temperature)
        logging.info("CD raw response: %s", cd_response)

        cd_info = None
        if cd_response.strip():
            try:
                cleaned = clean_json_response(cd_response)
                cd_data = json.loads(cleaned)
                score = int(cd_data["score"]) if isinstance(cd_data["score"], (str, float)) else cd_data["score"]
                cd_info = {
                    "utterance": cd_data["utterance"],
                    "type": cd_data["type"],
                    "severity": score,
                    "timestamp": timestamp
                }
            except Exception as e:
                logging.warning("Failed to parse CD response: %s", e)
                cd_info = None

        return basic_info, cd_info

    def update_baisc_and_cd_memory(self, args, basic_info, cd_info):
        self.basic_memory.append(basic_info)
        if cd_info:
            self.cd_memory.append(cd_info)
            logging.info("Detected cognitive distortion: %s (Severity: %s)", cd_info['type'], cd_info['severity'])
        else:
            logging.info("No cognitive distortion detected.")
        
        save_memory(self.basic_memory, args.basic_memory_path)
        save_memory(self.cd_memory, args.cd_memory_path)
    
    def retrieve_relevant_memories(self, args, cd_to_treat, basic_memory, cd_memory):
        basic_texts = [f"Utterance: {entry['utterance']}\nInsight: {entry['insight']}" for entry in basic_memory]
        if not basic_texts:
            return []

        doc_embeddings = self.retriever.encode(basic_texts, convert_to_tensor=True)
        query_embedding = self.retriever.encode(cd_to_treat, convert_to_tensor=True)
        cos_scores = st_util.pytorch_cos_sim(query_embedding, doc_embeddings)[0]
        k = min(args.top_k, len(basic_texts))
        top_indices = cos_scores.topk(k).indices
        top_basic = [basic_texts[i] for i in top_indices]
        matching_cd = [entry["utterance"] for entry in cd_memory if entry["type"] == cd_to_treat]
        return top_basic + matching_cd
    
    def compose_dynamic_prompt(self, args, counselor_utterance, client_utterance, f_llm):
        latest_dialogue = f"Counselor: {counselor_utterance}\nClient: {client_utterance}"

        if not self.cd_memory:
            cbt_technique = "None"
            progress_description = "None"
            stage = "None"
            example = "None"
        else:
            cd_to_treat = self.calculate_cd_priority(self.cd_memory)
            retrieved_memories = self.retrieve_relevant_memories(args, cd_to_treat, self.basic_memory, self.cd_memory)
            retrieved_context = "\n".join([f"- {x}" for x in retrieved_memories])

            technique_prompt_template = load_prompt("prompts/cbt/decide_cbt_technique.txt")
            technique_prompt = technique_prompt_template.replace("[Distortion to treat]", cd_to_treat).replace("[Memory]", retrieved_context)
            cbt_technique = f_llm(technique_prompt, llm=self.llm, model=self.model, temperature=self.temperature)

            cbt_info = load_cbt_technique_info(args.cbt_info_path)
            technique_data = cbt_info[cbt_technique]
            progress_description = "\n".join([f"{s['stage']}: {s['description']}" for s in technique_data.get("stages", [])])
            example = technique_data.get("example", "")

            stage_prompt_template = load_prompt("prompts/cbt/decide_cbt_stage.txt")
            cbt_log = self.update_cbt_usage_log(args.cbt_log_path, cbt_technique, "0")
            stage_prompt = stage_prompt_template.replace("[CBT technique]", cbt_technique)
            stage_prompt = stage_prompt.replace("[CBT Technique]", cbt_technique)
            stage_prompt = stage_prompt.replace("[CBT progress]", progress_description)
            stage_prompt = stage_prompt.replace("[CBT Usage Log]", json.dumps(cbt_log))
            stage_prompt = stage_prompt.replace("[CBT dialogue]", example)
            stage = f_llm(stage_prompt, llm=self.llm, model=self.model, temperature=self.temperature)
            self.update_cbt_usage_log(args.cbt_log_path, cbt_technique, stage)

        guidance_template = load_prompt(args.dynamic_prompt_name)
        guidance = guidance_template.replace("[Latest dialogue]", latest_dialogue)
        guidance = guidance.replace("[CBT technique]", cbt_technique)
        guidance = guidance.replace("[CBT documentation]", progress_description)
        guidance = guidance.replace("[CBT stage]", stage)
        guidance = guidance.replace("[CBT stage example]", example)
        
        return guidance
        
if __name__ == "__main__":
    from openai import OpenAI
    from sentence_transformers import SentenceTransformer
    import dotenv
    dotenv.load_dotenv()
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")
    
    logging.info("Starting CBT supervisor agent...")
    
    args = parse_args()

    llm = OpenAI(api_key=OPENAI_API_KEY)
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    
    cbt_supervisor = SupervisorCBT(args, llm, retriever, model="gpt-4o-mini", temperature=0.7)
    logging.info("Loaded memories. Basic: %d entries, CD: %d entries", len(cbt_supervisor.basic_memory), len(cbt_supervisor.cd_memory))
    logging.info("Loaded prompt templates.")

    counselor_utterance = "I hear you're struggling a lot lately."
    client_utterance = "I keep failing at everything I try."
    timestamp = datetime.datetime.now().isoformat()

    basic_info, cd_info = cbt_supervisor.extract_info_from_utterance(
        client_utterance,
        call_llm,
        cbt_supervisor.cd_prompt_template,
        cbt_supervisor.insight_prompt_template,
        timestamp
    )
    
    cbt_supervisor.update_baisc_and_cd_memory(args, basic_info, cd_info)
    logging.info("Saved updated memory files.")

    dynamic_prompt = cbt_supervisor.compose_dynamic_prompt(
        args,
        counselor_utterance,
        client_utterance,
        f_llm=call_llm,
    )
    logging.info("Composed final prompt for LLM input.")

    print(f"Previous conversation:\nCounselor: {counselor_utterance}\nClient: {client_utterance}")
    print("\n======================================================================\n")
    print(f"Counselor dynamic prompt:\n{dynamic_prompt}")
