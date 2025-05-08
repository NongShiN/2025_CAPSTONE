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
        # self.counselor = {}
        self.counselor = CounselorAgent(args, llm, retriever)
        logging.info("MASCC system initialized.")
        
    #def getCounselor(self, user_id: int):
    #    if self.counselor.find(user_id):
    #        return self.counselor[user_id]
    #    else:
    #        self.counselor[user_id] = CounselorAgent(args, llm, retriever)
    #        return self.counselor[user_id]

    def generate(self, args, client_utterance, timestamp):
        logging.info("Running single-turn interaction.")
        # return self.getCounselor(user_id=user_id).generate_response(args, counselor_utterance, client_utterance, timestamp)
        return self.counselor.generate_response(args, client_utterance, timestamp)

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
