from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from model.chat import chat_with_mascc  # ✅ 정상 import 가능

app = FastAPI()

# ✅ CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 * 사용, 배포 시에는 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/gen")
def generate(user_input: str = Query(...)):
    try:
        result = chat_with_mascc(user_input)
        return {"response": result}
    except Exception as e:
        return {"error": str(e)}

