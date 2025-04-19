from fastapi import FastAPI, Query
from model.chat import chat_with_model  # ✅ 정상 import 가능

app = FastAPI()

@app.get("/gen")
def generate(user_input: str = Query(...)):
    try:
        result = chat_with_model(user_input)
        return {"response": result}
    except Exception as e:
        return {"error": str(e)}