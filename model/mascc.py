# MASCC (Multi-Agent System for Counsel Chat)
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from openai import OpenAI
from model.utils.args import parse_args
from model.agents.counselor import CounselorAgent
import datetime
import logging

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

    def generate(self, args, counselor_utterance, client_utterance, timestamp):
        logging.info("Running single-turn interaction.")
        # return self.getCounselor(user_id=user_id).generate_response(args, counselor_utterance, client_utterance, timestamp)
        return self.counselor.generate_response(args, counselor_utterance, client_utterance, timestamp)

if __name__ == "__main__":
    from sentence_transformers import SentenceTransformer
    import dotenv
    dotenv.load_dotenv()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

    llm = OpenAI(api_key=OPENAI_API_KEY)
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    
    args = parse_args()

    llm = OpenAI(api_key=OPENAI_API_KEY)
    mascc = MASCC(args, llm, retriever)

    counselor_utterance = "Can you tell me what's been bothering you lately?"
    client_utterance = "I feel like no matter what I do, it's never enough."
    timestamp = datetime.datetime.now().isoformat()
    
    response = mascc.generate(args, counselor_utterance, client_utterance, timestamp)
    print("\n[Counselor Response]:")
    print(response)
