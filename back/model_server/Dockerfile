FROM python:3.10

WORKDIR /app

# model 전체 복사 (prompts, memory, data 다 포함)
COPY ../../model ./model

# back 폴더 전체 복사
COPY back ./back

# requirements.txt 복사 (경로는 back/model_server 안에 있으므로)
COPY back/model_server/requirements.txt ./requirements.txt

# PYTHONPATH에 /app 추가해서 back.* import 가능하게
ENV PYTHONPATH=/app

# 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# uvicorn 실행 시 모듈 경로도 back.model_server.main 으로 맞춰야 함
CMD ["uvicorn", "back.model_server.main:app", "--host", "0.0.0.0", "--port", "8080"]
