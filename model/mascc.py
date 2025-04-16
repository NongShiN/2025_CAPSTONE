# MASCC (Multi-Agent System for Counsel Chat)
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from openai import OpenAI
from sentence_transformers import SentenceTransformer, util
from utils.args import parse_args
from agents.counselor import CounselorAgent
from utils.util import call_llm
import datetime
import logging
import dotenv

dotenv.load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

llm = OpenAI(api_key=OPENAI_API_KEY)
retriever = SentenceTransformer("all-MiniLM-L6-v2")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("mascc.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class MASCC:
    def __init__(self, args, llm, retriever):
        self.args = args
        self.llm = llm
        self.counselor = CounselorAgent(args, llm, retriever)
        logging.info("MASCC system initialized.")

    def generate(self, args, counselor_utterance, client_utterance, timestamp):
        logging.info("Running single-turn interaction.")
        return self.counselor.generate_response(args, counselor_utterance, client_utterance, timestamp)

if __name__ == "__main__":
    args = parse_args()

    llm = OpenAI(api_key=OPENAI_API_KEY)
    mascc = MASCC(args, llm, retriever)

    counselor_utterance = "Can you tell me what's been bothering you lately?"
    client_utterance = "I feel like no matter what I do, it's never enough."
    timestamp = datetime.datetime.now().isoformat()
    
    try:
        response = mascc.generate(args, counselor_utterance, client_utterance, timestamp)
        print("\n[Counselor Response]:")
        print(response)
    except Exception as e:
        logging.error("An error occurred during response generation: %s", str(e))
        print("[Error] Something went wrong. Please try again.")
