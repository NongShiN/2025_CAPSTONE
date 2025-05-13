import os
import sys
import logging
import datetime
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from .mascc import MASCC
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


# user가 log in 하면 counselor 에이전트 인스턴스 생성
# 아직은 하나의 counselor에 대해서 구현
# 이후에 user에 대한 전체 dialoue 다 받아와야함. 현재는 임시 대화 파일에서 불러옴
def load_counselor(mascc):
    mascc.counselor.load_dialogues()


def select_session(mascc, dialogue_history_id):
    mascc.counselor.load_dialogue_history(dialogue_history_id)


# ✅ mascc 인스턴스를 인자로 받는 버전
def chat_with_mascc(user_id: str, user_input: str, mascc) -> str:
    # 초기화 단계 처리
    if user_input == None:
        return None

    timestamp = datetime.datetime.now().isoformat()

    response = mascc.generate(
        mascc.args,
        user_id=user_id,
        client_utterance=user_input,
        timestamp=timestamp
    )
    logging.info(f"\n[Counselor Response]: {response}")

    return response


if __name__ == "__main__":
    mascc = load_mascc()
    load_counselor(mascc)
    
    print("Welcome to the MASCC chatbot. Type 'exit' or 'quit' to end the conversation.\n")
    
    select_session(mascc, "dlg004")
    
    if mascc.counselor.dialogue_history == []:
        last_counselor = "Hello, how can I help you?"
        timestamp = datetime.datetime.now().isoformat()

        mascc.counselor.update_dialogue_history(
            "Counselor", 
            last_counselor,
            timestamp
            )

        print(f"Counselor: {last_counselor}")

    
    while True:
        user_input = input("You: ")
        timestamp = datetime.datetime.now().isoformat()

        if user_input.lower() in ["exit", "quit"]:
            print("Ending the chat. Take care!")
            break

        response = chat_with_mascc(user_input, mascc)
        timestamp = datetime.datetime.now().isoformat()
        mascc.counselor.update_dialogue_history(
            "Counselor", 
            response,
            timestamp
            )
        print(f"Counselor: {response}")

    mascc.counselor.update_dialogues("dlg004")
    print("========================= Session end =========================")
    print(mascc.counselor.dialogues)