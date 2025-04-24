import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from agents.supervisor_empathic import SupervisorEmpathic
from agents.supervisor_cbt import SupervisorCBT
from agents.supervisor_act import SupervisorACT
from agents.supervisor_dbt import SupervisorDBT
from agents.supervisor_ifs import SupervisorIFS
from agents.supervisor_ipt import SupervisorIPT
from utils.util import call_llm, load_prompt, load_dialogue_history, str_to_json_data
from utils.args import parse_args
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

class CounselorAgent:
    def __init__(self, args, llm, retriever):
        self.llm = llm
        self.args = args
        self.model = args.model
        self.temperature = args.temperature
        self.retriever = retriever
        self.static_prompt = load_prompt("prompts/static_prompt.txt")
        self.dialogue_history = str_to_json_data(load_dialogue_history("memory/dialogue_history.json"))["dialogue_history"] # 형태 바뀔 수 있음. 수정 필요
    
    def update_dialogue_history(self, speaker, utterance, timestamp):
        self.dialogue_history.append({
            "speaker": speaker,
            "utterance": utterance,
            "timestamp": timestamp
        })
    
    def select_supervisor(self, dialogue_history):
        supervisor_selecting_prompt_templat = load_prompt("prompts/select_supervisor.txt")
        supervisor_selecting_prompt = supervisor_selecting_prompt_templat.replace("[Dialogue history]", dialogue_history)
        selected_supervisor = call_llm(supervisor_selecting_prompt, llm=self.llm, model=self.model, temperature=0)
        return selected_supervisor

    def request_for_guidance(self, args, counselor_utterance, client_utterance, timestamp):
        self.update_dialogue_history(speaker="Client", utterance=client_utterance, timestamp=timestamp)
        
        selected_supervisor = self.select_supervisor(str(self.dialogue_history))
        # selected_role = "IPT"
        
        if selected_supervisor == "None":
            # 특별한 상담 및 치료 기법 적용이 필요 없음
            dynamic_prompt = ""
        elif selected_supervisor == "CBT":
            supervisor = SupervisorCBT(self.args, self.llm, self.retriever, model=self.model, temperature=self.temperature)
            
            basic_info, cd_info = supervisor.extract_info_from_utterance(
                client_utterance,
                call_llm,
                supervisor.cd_prompt_template,
                supervisor.insight_prompt_template,
                timestamp
            )
            
            supervisor.update_baisc_and_cd_memory(args, basic_info, cd_info)
            
            dynamic_prompt = supervisor.compose_dynamic_prompt(self.args,
                                                               counselor_utterance,
                                                               client_utterance,
                                                               f_llm=call_llm)
        elif selected_supervisor == "ACT":
            supervisor = SupervisorACT(args, llm)
            
            supervisor.evaluate_pf_processes(dialogue_history)
            intervention_points = supervisor.decide_intervention_point(supervisor.pf_rating)
            dynamic_prompt = supervisor.generate_intervention_guidance(dialogue_history, supervisor.pf_rating, intervention_points)
        elif selected_supervisor == "IPT":
            supervisor = SupervisorIPT(args, llm)
            
            dynamic_prompt = supervisor.generate_guidance(dialogue_history)
        return dynamic_prompt
            
    def generate_response(self, args, counselor_utterance, client_utterance, timestamp):
        dynamic_prompt = self.request_for_guidance(args, counselor_utterance, client_utterance, timestamp)
        final_prompt = self.static_prompt + "\n" + dynamic_prompt

        return call_llm(final_prompt, llm=self.llm, model=self.model, temperature=self.temperature)


if __name__ == "__main__":
    from openai import OpenAI
    import dotenv
    dotenv.load_dotenv()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")
    
    logging.info("Starting ACT supervisor agent...")
    
    args = parse_args()
    
    llm = OpenAI(api_key=OPENAI_API_KEY)
    from sentence_transformers import SentenceTransformer
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    
    counselor = CounselorAgent(args, llm, retriever)
    dialogue_history = "Counselor: Can you tell me what brought you in today?\n" \
                       "Client: I just feel stuck. I know I want to do something meaningful, but I always end up doing nothing.\n" \
                       "Counselor: What stops you from doing the things that feel meaningful?\n" \
                       "Client: It's like this voice in my head tells me I'll just mess it up, so what's the point.\n" \
                       "Counselor: That sounds hard. When does that voice usually show up?\n" \
                       "Client: Usually when I start planning something important. Like last week, I wanted to reach out to an old friend, but then I thought, 'They probably don’t want to hear from me anyway.'\n" \
                       "Counselor: And then what happened?\n" \
                       "Client: I just gave up and scrolled on my phone instead. It's safer not to try, I guess.\n" \
                       "Counselor: Do you think this keeps you away from things that really matter to you?\n" \
                       "Client: Yeah, I really value connection... but I don’t act like it."

    counselor_utterance = "Can you tell me what's been bothering you lately?"
    client_utterance = "I feel like no matter what I do, it's never enough."
    
    import datetime
    timestamp = datetime.datetime.now().isoformat()
    
    print("=========================================================================\n")
    print(counselor.request_for_guidance(args, counselor_utterance, client_utterance, timestamp, dialogue_history))
    # response = counselor.generate_response(args, counselor_utterance, client_utterance, timestamp, dialogue_history)
    # print("Counselor Response:")
    # print(response)