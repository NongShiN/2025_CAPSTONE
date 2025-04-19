FROM python:3.10

WORKDIR /app

# model 및 model_server 코드 복사
COPY model ./model
COPY back/model_server ./model_server

# PYTHONPATH 설정 (model도 import 가능하게)
ENV PYTHONPATH=/app

# requirements.txt 설치
RUN pip install --no-cache-dir -r model_server/requirements.txt

# 모델 서버 실행
CMD ["uvicorn", "model_server.main:app", "--host", "0.0.0.0", "--port", "8000"]