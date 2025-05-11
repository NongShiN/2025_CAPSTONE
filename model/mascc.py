# MASCC (Multi-Agent System for Counsel Chat)
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from openai import OpenAI
from .agents.counselor import CounselorAgent
import datetime
import logging


class DefaultArgs:
    insight_prompt_name='prompts/cbt/extract_insight.txt'
    dynamic_prompt_name='prompts/cbt/dynamic_prompt.txt'
    cd_prompt_name='prompts/cbt/detect_cognitive_distortion.txt'
    model='gpt-4o-mini'
    temperature=0.7
    basic_memory_path='memory/basic_memory.json'
    cd_memory_path='memory/cd_memory.json'
    cbt_log_path='data/cbt_log.json'
    cbt_info_path='data/cbt_info.json'
    top_k=5
    
class MASCC:
    def __init__(self, args, llm, retriever):
        self.args = args
        self.llm = llm
        self.retriever = retriever
        self.counselor = {}
        #self.counselor = {"user1": CounselorAgent(self.args, self.llm, self.retriever)}
        logging.info("MASCC system initialized.")
    
        
    # user_id에 해당하는 counselor 에이전트 인스턴스를 반환
    def get_counselor(self, user_id):
        if user_id not in self.counselor.keys():
            self.counselor[user_id] = CounselorAgent(self.args, self.llm, self.retriever)
            self.counselor[user_id].load_dialogues()
            
        return self.counselor[user_id]
        # TODO: 처음 생성되는 에이전트의 dialogues가 아무것도 없을 때 디폴트값이 필요함


    # user_id의 전체 dialogues 중에서 dialogue_history_id에 해당하는 대화 내역을 counselor 에이전트 내부 변수에 저장 
    def select_session(self, user_id, dialogue_history_id):
        counselor = self.get_counselor(user_id)
        counselor.load_dialogue_history(dialogue_history_id)
    
    
    def generate(self, args, user_id, client_utterance, timestamp):
        logging.info("Running single-turn interaction.")

        counselor = self.get_counselor(user_id)
        
        return counselor.generate_response(args, client_utterance, timestamp)


if __name__ == "__main__":
    from sentence_transformers import SentenceTransformer
    import dotenv
    dotenv.load_dotenv()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

    llm = OpenAI(api_key=OPENAI_API_KEY)
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    
    args = DefaultArgs()

    llm = OpenAI(api_key=OPENAI_API_KEY)
    mascc = MASCC(args, llm, retriever)

    counselor_utterance = "Can you tell me what's been bothering you lately?"
    client_utterance = "I feel like no matter what I do, it's never enough."
    timestamp = datetime.datetime.now().isoformat()
    
    response = mascc.generate(args, client_utterance, timestamp)
    print("\n[Counselor Response]:")
    print(response)
