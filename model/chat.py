import os
import sys
import logging
import datetime
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from mascc import MASCC
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found. Check your .env file.")

# === Logging Configuration ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("mascc.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

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

# ✅ MASCC 인스턴스를 명시적으로 초기화하는 함수
def load_mascc():
    args = DefaultArgs()
    llm = OpenAI(api_key=OPENAI_API_KEY)
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    mascc = MASCC(args, llm, retriever)
    return mascc

# ✅ mascc 인스턴스를 인자로 받는 버전
def chat_with_mascc(user_input: str, mascc_instance, last_counselor: str = "Hello, how can I help you?") -> str:
    timestamp = datetime.datetime.now().isoformat()

    response = mascc_instance.generate(
        mascc_instance.args,
        counselor_utterance=last_counselor,
        client_utterance=user_input,
        timestamp=timestamp
    )
    logging.info(f"\n[Counselor Response]: {response}")

    return response

# ❌ 글로벌 mascc 삭제
# mascc = MASCC(args, llm, retriever) (삭제)

if __name__ == "__main__":
    mascc_instance = load_mascc()
    print("Welcome to the MASCC chatbot. Type 'exit' or 'quit' to end the conversation.\n")

    last_counselor = "Hello, how can I help you?"
    print(f"Counselor: {last_counselor}")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Ending the chat. Take care!")
            break

        response = chat_with_mascc(user_input, mascc_instance, last_counselor)
        print(f"Counselor: {response}")
        last_counselor = response