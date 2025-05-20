import random
import json
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
#from model.chat import chat_with_mascc, load_mascc, load_counselor, select_session
from model.chat import chat_with_mascc, load_mascc

from back.model_server.models import dialog

app = FastAPI()

# ✅ 서버 시작할 때 MASCC 인스턴스 메모리에 미리 로딩
mascc = load_mascc()
#load_counselor(mascc)

# TODO: session 선택에 필요한 API 함수 구현 필요
# 임시 dialogue history id 사용
#select_session(mascc, "dlg004")

# ✅ 서버 부팅 시 더미 입력으로 모델 prewarm
def prewarm_model():
    dummy_input = None
    user_id = None
    try:
        _ = chat_with_mascc(user_id, dummy_input, mascc)
        print("✅ 모델 prewarm 완료")
    except Exception as e:
        print(f"⚠️ Prewarm 실패: {e}")

prewarm_model()

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 시간대별 심리상담 인사말
MORNING_MESSAGES = [
    "좋은 아침입니다. 오늘 시작하면서 가장 먼저 떠오른 생각은 무엇인가요?",
    "하루를 시작하며 지금 마음 상태는 어떤가요?",
    "오늘 하루, 당신이 기대하거나 염려하는 일이 있다면 함께 이야기해볼까요?",
    "오늘 어떤 하루가 되기를 바라시나요?",
    "지금 떠오르는 감정이나 생각이 있다면 편하게 이야기해 주세요.",
]

AFTERNOON_MESSAGES = [
    "오늘 하루, 지금까지 어떻게 지내셨나요?",
    "지금 이 순간, 가장 마음에 남는 일이 있다면 무엇인가요?",
    "방금 전 혹은 오늘 있었던 일 중, 이야기 나누고 싶은 게 있으신가요?",
    "조금 힘든 일이 있었다면 어떤 점이 특히 힘들게 느껴졌는지 나눠볼 수 있을까요?",
    "지금 가장 하고 싶은 말이 있다면, 무엇일까요?",
]

EVENING_MESSAGES = [
    "오늘 하루를 마무리하며, 가장 기억에 남는 순간은 무엇이었나요?",
    "지금 이 시간, 어떤 생각이나 감정이 머물고 있나요?",
    "편안한 밤을 위해, 마음속에 남아 있는 말을 꺼내어 볼까요?",
    "오늘 자신에게 해주고 싶은 말이 있다면 무엇인가요?",
    "지금 마음이 가는 이야기를 하나 꺼내어 나눠보실래요?",
]
# 리마인더 메시지 (시간 단계별)
REMINDER_MESSAGES_10MIN = [
    "천천히 괜찮아요. 준비되었을 때 말씀해 주세요.",
    "편안하게 숨을 고르고, 이야기할 준비가 되시면 알려주세요.",
]

REMINDER_MESSAGES_20MIN = [
    "아직 여기에 있습니다. 마음이 준비되면 언제든 이야기해 주세요.",
    "조금씩, 당신의 속도에 맞춰 함께 가겠습니다.",
]

REMINDER_MESSAGES_30MIN = [
    "당신의 마음을 기다리고 있습니다. 혼자가 아니에요.",
    "어떤 이야기든 괜찮습니다. 당신을 존중합니다.",
]

last_interaction_time = datetime.now()

def get_kst_time():
    """UTC 기준 현재 시간 → KST(+9시간) 보정"""
    utc_now = datetime.utcnow()
    kst_now = utc_now + timedelta(hours=9)
    return kst_now

def get_greeting_by_time():
    now = get_kst_time()
    hour = now.hour

    if 5 <= hour < 12:
        # 아침
        return random.choice(MORNING_MESSAGES)
    elif 12 <= hour < 18:
        # 오후
        return random.choice(AFTERNOON_MESSAGES)
    else:
        # 저녁
        return random.choice(EVENING_MESSAGES)


# TODO: post 메소드로 변경해야함
@app.post("/load_counselor")
def load_counselor(user_info: dialog.UserInfo):
    user_id = user_info.user_id
    insight = user_info.insight

    counselor = mascc.get_counselor(user_id)
    print(f"============== Loading Counselor Agent Complete. ==============")
    print(mascc.counselor.keys())

    # TODO: dummy variable. 백에서 받아와야함
    counselor.user_info["user_id"] = user_id
    counselor.user_info["insight"] = insight
    print(counselor.user_info)
    return {
        "user_id": counselor.user_info["user_id"],
        "user_info": counselor.user_info["insight"],
        "current_counselor_agent_list": str(mascc.counselor.keys())
    }


@app.post("/select_session")
async def select_session(user_info: dialog.UserInfo, session_info: dialog.SessionInfo, dialog_history: dialog.DialogHistory):
    user_id = user_info.user_id
    session_id = session_info.session_id
    hist = dialog_history.history
    counselor = mascc.get_counselor(user_id)

    transformed_dialogue_history = []
    for entry in hist:
        transformed_dialogue_history.append(
            {"speaker": "Client", "utterance": entry.message, "timestamp": entry.timestamp}
        )
        transformed_dialogue_history.append(
            {"speaker": "Counselor", "utterance": entry.response, "timestamp": entry.timestamp}
        )
    counselor.dialogue_history = transformed_dialogue_history
    counselor.dialogue_history_id = session_id

    counselor.session_info[session_id] = {
        "insight": session_info.insight,
        "selected_supervisor": session_info.selected_supervisor,
        "cbt_info": session_info.cbt_info,
        "pf_rating": session_info.pf_rating,
        "ipt_log": session_info.ipt_log
    }
    # 나중에 백에서 불러와야함
    # 현재는 dummy variable
    #counselor.session_info[session_id] = {
    #    "insight": {},
    #    "selected_supervisor": None,
    #    "cbt_info": {"cbt_log" : {},
    #                 "basic_memory" : [],
    #                 "cd_memory" : []
    #                 },
    #    "pf_rating": {},
    #    "ipt_log" : {"history": []}
    #}

    print(counselor.session_info[session_id])
    print(counselor.dialogue_history_id)
    print(counselor.dialogue_history)

    return {
        "dialogue history id": session_id,
        "dialogue history":transformed_dialogue_history,
        "session_info": counselor.session_info[session_id]
    }

@app.post("/gen")
def generate(user_info: dialog.UserInfo, query: dialog.UserInput):
    global last_interaction_time
    user_id = user_info.user_id
    user_input = query.user_input
    print("🔍 받은 요청 - user_id:", user_id)
    print("🔍 받은 요청 - user_input:", user_input)
    counselor = mascc.get_counselor(user_id)

    try:
        if user_input == "<SOS>":
            greeting = get_greeting_by_time()
            last_interaction_time = datetime.now()

            counselor.update_dialogue_history(
                speaker="Counselor",
                utterance=greeting,
                timestamp=last_interaction_time
            )

            return {"response": greeting}

        result = chat_with_mascc(user_id, user_input, mascc)
        last_interaction_time = datetime.now()

        counselor.update_dialogue_history(
            speaker="Counselor",
            utterance=result,
            timestamp=last_interaction_time
        )
        # print(counselor.dialogue_history)
        print("✅ 생성된 응답:", result)
        print("✅ user_info:", counselor.user_info)
        print("✅ session_info:", counselor.session_info[counselor.dialogue_history_id])
        return {
            "response": result,
            "user_insight": counselor.user_info["insight"],
            "selected_supervisor": counselor.session_info[counselor.dialogue_history_id]["selected_supervisor"],
            "cbt_basic_memory": counselor.session_info[counselor.dialogue_history_id]["cbt_info"]["basic_memory"],
            "cbt_cd_memory": counselor.session_info[counselor.dialogue_history_id]["cbt_info"]["cd_memory"],
            "cbt_log": counselor.session_info[counselor.dialogue_history_id]["cbt_info"]["cbt_log"],
            "pf_rating": counselor.session_info[counselor.dialogue_history_id]["pf_rating"],
            "ipt_log": counselor.session_info[counselor.dialogue_history_id]["ipt_log"],
            "session_insight": counselor.session_info[counselor.dialogue_history_id]["insight"],
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/reminder")
def reminder_check():
    now = datetime.now()
    elapsed = now - last_interaction_time

    if elapsed > timedelta(minutes=30):
        # 30분 이상 경과
        reminder = random.choice(REMINDER_MESSAGES_30MIN)
        return {"response": reminder}
    elif elapsed > timedelta(minutes=20):
        # 20분 이상 경과
        reminder = random.choice(REMINDER_MESSAGES_20MIN)
        return {"response": reminder}
    elif elapsed > timedelta(minutes=10):
        # 10분 이상 경과
        reminder = random.choice(REMINDER_MESSAGES_10MIN)
        return {"response": reminder}
    else:
        return {"response": None}