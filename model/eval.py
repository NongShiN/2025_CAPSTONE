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
    cbt_info_path='data/cbt_info.json'
    top_k=5


# ✅ MASCC 인스턴스를 명시적으로 초기화하는 함수
def load_mascc():
    args = DefaultArgs()
    llm = OpenAI(api_key=OPENAI_API_KEY)
    retriever = SentenceTransformer("all-MiniLM-L6-v2")
    mascc = MASCC(args, llm, retriever)
    return mascc


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
    args = DefaultArgs()
    
    print("==================================================== MASCC Evaluation =====================================================")
    ################## Load MASCC and Counselor Agent ##################
    mascc = load_mascc()
    print("================================================= Turn on MASCC Framework =================================================")
    user_id = "eval_user_id"
    user_insight = {}
    session_id = "eval_test_session"
    
    counselor = mascc.get_counselor(user_id)
    print("============================================ Loading Counselor Agent Complete. ============================================")

    counselor.user_info["user_id"] = user_id
    counselor.user_info["insight"] = user_insight
    print(counselor.user_info)

    hist = []
    
    transformed_dialogue_history = []
    counselor.dialogue_history = transformed_dialogue_history
    counselor.dialogue_history_id = session_id

    counselor.session_info[session_id] = {
        "insight": {},
        "selected_supervisor": "None",
        "cbt_info": {
            "cbt_log": {},
            "basic_memory": [],
            "cd_memory": []
        },
        "pf_rating": {},
        "ipt_log": []
    }
    print(counselor)
    ################## Load MASCC and Counselor Agent ##################
    
    ######################## Start Conversation ########################
    if counselor.dialogue_history == []:
        last_counselor = "Hello, how can I help you?"
        timestamp = datetime.datetime.now().isoformat()

        counselor.update_dialogue_history(
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

        response = mascc.generate(args, user_id, user_input, timestamp)
        timestamp = datetime.datetime.now().isoformat()
        counselor.update_dialogue_history(
            "Counselor", 
            response,
            timestamp
            )
        print(f"Counselor: {response}")

    counselor.update_dialogues("dlg004")
    print("========================= Session end =========================")
    print(counselor.dialogues)