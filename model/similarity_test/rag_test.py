import faiss
import pandas as pd
import openai
import numpy as np
from openai import OpenAI

OPENAI_API_KEY="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"

client = OpenAI(api_key = OPENAI_API_KEY)


# 저장된 FAISS 벡터DB 및 데이터 불러오기
index = faiss.read_index("faiss_index.bin")
df_unique = pd.read_pickle("questions_answers.pkl")

embedding_model = "text-embedding-3-small"

# 임베딩 함수
def get_embedding(text):
    response = client.embeddings.create(input=text, model=embedding_model)
    return response.data[0].embedding

# 벡터DB에서 유사 질문 찾기
def rag_search(query, top_k=1):
    query_emb = np.array(get_embedding(query)).reshape(1, -1)
    distances, indices = index.search(query_emb, top_k)
    results = df_unique.iloc[indices[0]]
    return results[['questionText', 'answerText', 'preference_score']]

# RAG를 통한 답변 생성
def generate_rag_response(user_question):
    retrieved = rag_search(user_question, top_k=1).iloc[0]
    
    prompt = f"""
    You are a professional therapist helping a patient.

    Patient Question:
    "{user_question}"

    Below is a similar previously answered question and a professional therapist's response:
    Similar Question:
    "{retrieved['questionText']}"

    Therapist Response:
    "{retrieved['answerText']}"

    Based on this, provide a helpful and empathetic response to the patient's question above.
    """

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional, empathetic therapist."},
            {"role": "user", "content": prompt}]
    )


    return completion.choices[0].message.content

# 예시 실행
if __name__ == "__main__":
    user_question = "A few years ago I was making love to my wife when for no known reason I lost my erection,    Now I'm In my early 30s and my problem has become more and more frequent. This is causing major problems for my ego and it's diminishing my self esteem. This has resulted in ongoing depression and tearing apart my marriage.    I am devastated and cannot find a cause for these issues. I am very attracted to my wife and want to express it in the bedroom like I used to.    What could be causing this, and what can I do about it?"
    response = generate_rag_response(user_question)
    print("🗨️ RAG-based answers:\n", response)

