import pandas as pd
import openai
import faiss
import numpy as np
from datasets import load_dataset
import pickle
from openai import OpenAI

OPENAI_API_KEY="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"

client = OpenAI(api_key = OPENAI_API_KEY)

# 데이터 로드 및 처리
dataset = load_dataset("nbertagnolli/counsel-chat")

df = dataset["train"].to_pandas()

# preference_score 계산
df['preference_score'] = np.log(df['upvotes'] + 1) / np.log(df['views'] + 1)
df_sorted = df.sort_values(by=['questionText', 'preference_score'], ascending=[True, False])
df_unique = df_sorted.drop_duplicates(subset='questionText', keep='first').reset_index(drop=True)
# none 값 제거
empty_or_nan = df_unique['questionText'].isnull() | (df_unique['questionText'].str.strip() == '')
df_unique = df_unique[~empty_or_nan].reset_index(drop=True)

# 임베딩 함수
def get_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    return response.data[0].embedding


# 질문 임베딩 생성
embeddings = np.array([get_embedding(q) for q in df_unique['questionText']])

# FAISS 벡터DB 생성 및 저장
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# 벡터DB 저장
faiss.write_index(index, "faiss_index.bin")

# 데이터 저장 (pandas dataframe)
df_unique.to_pickle("questions_answers.pkl")

print("✅ 벡터DB와 데이터 저장 완료!")

