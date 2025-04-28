from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Web Server is running!"}

@app.get("/model")
async def call_model():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://model:8000/gen")
        return {"model_response": response.json()}
