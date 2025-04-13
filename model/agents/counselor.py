import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from openai import OpenAI
from agents.supervisor_empathic import SupervisorEmpathic
from agents.supervisor_cbt import SupervisorCBT
from agents.supervisor_act import SupervisorACT
from agents.supervisor_dbt import SupervisorDBT
from agents.supervisor_ifs import SupervisorIFS
from agents.supervisor_ipt import SupervisorIPT
from utils.util import call_llm, load_prompt
from model import parse_args
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("run_model.log", encoding='utf-8')
    ]
)

class CounselorAgent:
    def __init__(self, args, llm, retriever, model="gpt-4o-mini", temperature=0.7):
        self.llm = llm
        self.args = args
        self.model = model
        self.temperature = temperature
        self.retriever = retriever
        self.static_prompt = load_prompt("static_prompt.txt")

    def select_supervisor_role(self, counselor_utterance, client_utterance):
        prompt = (
            "You are a mental health routing agent. Based on the following dialogue between the counselor and the client, "
            "select the most appropriate therapeutic supervisor to consult from the following:"
            " [Empathic, CBT, ACT, DBT, IFS, IPT]. If no therapeutic supervisor is needed, respond with 'None'.\n"
            "Respond with one word only.\n\n"
            f"Counselor: \"{counselor_utterance}\"\nClient: \"{client_utterance}\""
        )
        response = call_llm(prompt, llm=self.llm, model=self.model, temperature=0)
        return response.strip()

    def request_for_guidance(self, args, counselor_utterance, client_utterance, timestamp):
        selected_role = self.select_supervisor_role(counselor_utterance, client_utterance)
        #selected_role = "None"
        
        if selected_role == "None":
            # 특별한 상담 및 치료 기법 적용이 필요 없음
            return ""

        if selected_role == "CBT":
            supervisor = SupervisorCBT(self.args, self.llm, self.retriever, model=self.model, temperature=self.temperature)
            
            basic_info, cd_info = supervisor.extract_info_from_utterance(
                client_utterance,
                call_llm,
                supervisor.cd_prompt_template,
                supervisor.insight_prompt_template,
                timestamp
            )
            
            supervisor.update_and_baisc_cd_memory(args, basic_info, cd_info)
            
            dynamic_prompt = supervisor.compose_dynamic_prompt(
                self.args,
                counselor_utterance,
                client_utterance,
                f_llm=call_llm,
            )
            return dynamic_prompt

        # For all other roles, just return which one was selected
        return f"Selected supervisor role: {selected_role}"

    def generate_response(self, args, counselor_utterance, client_utterance, timestamp):
        dynamic_prompt = self.request_for_guidance(args, counselor_utterance, client_utterance, timestamp)
        final_prompt = self.static_prompt + "\n" + dynamic_prompt

        return call_llm(final_prompt, llm=self.llm, model=self.model, temperature=self.temperature)


if __name__ == "__main__":
    import dotenv
    dotenv.load_dotenv()

    args = parse_args()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

    llm = OpenAI(api_key=OPENAI_API_KEY)
    from sentence_transformers import SentenceTransformer, util
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    
    counselor = CounselorAgent(args, llm, retriever)

    counselor_utterance = "Can you tell me what's been bothering you lately?"
    client_utterance = "I feel like no matter what I do, it's never enough."
    
    import datetime
    timestamp = datetime.datetime.now().isoformat()
    
    print("=========================================================================\n")
    #print(counselor.request_for_guidance(counselor_utterance, client_utterance, timestamp))
    response = counselor.generate_response(counselor_utterance, client_utterance, timestamp)
    print("Counselor Response:")
    print(response)
