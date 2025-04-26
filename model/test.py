import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
import datetime
from model.utils.util import call_llm, load_prompt, load_dialogue_history, str_to_json_data
from model.agents.counselor import CounselorAgent
from openai import OpenAI
from sentence_transformers import SentenceTransformer
import dotenv
dotenv.load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

class DefaultArgs:
    final_prompt_name = 'final_prompt.txt'
    cd_prompt_name = 'detect_cognitive_distortion.txt'
    insight_prompt_name = 'extract_insight.txt'
    model = 'gpt-4o-mini'
    temperature = 0.7
    basic_memory_path = 'basic_memory.json'
    cd_memory_path = 'cd_memory.json'
    cbt_log_name = 'cbt_log.json'
    top_k = 5
    cbt_info_name = 'cbt_info.json'

args = DefaultArgs()
llm = OpenAI(api_key=OPENAI_API_KEY)
retriever = SentenceTransformer("all-MiniLM-L6-v2")

agent = CounselorAgent(args, llm, retriever)
print(agent)