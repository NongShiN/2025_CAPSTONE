import random
from datetime import datetime, timedelta
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from model.chat import chat_with_mascc, load_mascc

app = FastAPI()

# ✅ 서버 시작할 때 MASCC 인스턴스 메모리에 미리 로딩
mascc_instance = load_mascc()

# ✅ 서버 부팅 시 더미 입력으로 모델 prewarm
def prewarm_model():
    dummy_input = "Hello, how can I help you?"
    try:
        _ = chat_with_mascc(dummy_input, mascc_instance)
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
    "좋은 아침입니다. 오늘 하루를 어떻게 시작하고 싶나요?",
    "하루의 시작을 함께 열어볼까요?",
    "오늘을 위한 따뜻한 생각을 떠올려볼까요?",
    "오늘 어떤 목표를 세우고 싶으신가요?",
    "하루를 시작하는 당신을 응원합니다.",
]

AFTERNOON_MESSAGES = [
    "오늘 하루, 어떻게 보내고 계신가요?",
    "지금 마음에 떠오르는 생각이 있나요?",
    "하루 중 잠시 멈춰 마음을 살펴볼 시간입니다.",
    "지금까지의 하루를 돌아보며 이야기 나눠볼까요?",
    "조금 힘든 하루라도 괜찮아요. 여기에서 풀어보세요.",
]

EVENING_MESSAGES = [
    "긴 하루를 마친 지금, 마음을 가볍게 풀어볼까요?",
    "오늘 하루 수고 많으셨어요.",
    "편안한 밤을 맞이하기 전에 마음을 정리해볼까요?",
    "하루를 마무리하며, 나를 토닥이는 시간을 가져봅시다.",
    "지친 하루 속에서도 당신은 충분히 잘 해내고 있어요.",
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

@app.get("/gen")
def generate(user_input: str = Query(None)):
    global last_interaction_time
    try:
        if not user_input:
            greeting = get_greeting_by_time()
            last_interaction_time = datetime.now()
            return {"response": greeting}
        
        result = chat_with_mascc(user_input, mascc_instance)
        last_interaction_time = datetime.now()
        return {"response": result}
    
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