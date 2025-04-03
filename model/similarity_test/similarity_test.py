import faiss
import pandas as pd
import openai
import numpy as np
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("API_KEY")

client = OpenAI(api_key = OPENAI_API_KEY)


# 저장된 FAISS 벡터DB 및 데이터 불러오기
index = faiss.read_index("faiss_index.bin")
df_unique = pd.read_pickle("questions_answers.pkl")

embedding_model = "text-embedding-3-small"

total = index.ntotal
dim = index.d
check_num = 80

# 전체 벡터 가져오기
vectors = index.reconstruct_n(0, total)  # shape: (total, dim)

# 앞 80개를 0으로 채운 임베딩으로 대체
empty_vectors = np.zeros((check_num, dim), dtype='float32')
new_vectors = np.vstack([empty_vectors, vectors[check_num:]])

# 새 인덱스 생성 (원래와 같은 타입, 여기서는 IndexFlatL2)
new_index = faiss.IndexFlatL2(dim)
new_index.add(new_vectors)

index = new_index

# 임베딩 함수
def get_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
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

def generate_base_response(user_question):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional, empathetic therapist."},
            {"role": "user", "content": user_question}]
    )

    return completion.choices[0].message.content


# 유사도 확인
df_test = df_unique.head(check_num)[["questionText", "answerText"]]

df_test["GPTanswer"] = df_test["questionText"].apply(generate_base_response)
print("GPTanswer") 

df_test["RAGanswer"] = df_test["questionText"].apply(generate_rag_response)
print("RAGanswer")

df_test["answerEmbedding"] = df_test["answerText"].apply(get_embedding)
print("answerEmbedding")

df_test["gptEmbedding"] = df_test["GPTanswer"].apply(get_embedding)
print("gptEmbedding")

df_test["ragEmbedding"] = df_test["RAGanswer"].apply(get_embedding)
print("ragEmbedding")


gpt_answer_similarity = df_test.apply(
    lambda row: cosine_similarity(
        [row["answerEmbedding"]], 
        [row["gptEmbedding"]]
    )[0][0], 
    axis=1
)

print("기본 GPT와 유사도: ", sum(gpt_answer_similarity) / check_num)

rag_answer_similarity = df_test.apply(
    lambda row: cosine_similarity(
        [row["answerEmbedding"]], 
        [row["ragEmbedding"]]
    )[0][0], 
    axis=1
)

print("RAG 적용 후 유사도: ", sum(rag_answer_similarity) / check_num)
