from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from chat import chat_with_mascc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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