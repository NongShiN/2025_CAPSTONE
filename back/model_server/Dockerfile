FROM python:3.10

WORKDIR /app

# model 전체 복사 (prompts, memory, data 다 포함)
COPY ../../model ./model
COPY back/model_server ./model_server
COPY back/model_server/requirements.txt ./requirements.txt

# PYTHONPATH에 /app 추가해서 model.* import 가능하게
ENV PYTHONPATH=/app

# 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# ✅ 포트 8080으로 모델 API 실행
CMD ["uvicorn", "model_server.main:app", "--host", "0.0.0.0", "--port", "8080"]