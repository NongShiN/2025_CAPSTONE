FROM python:3.10

WORKDIR /app

COPY model ./model
COPY back/model_server ./model_server

ENV PYTHONPATH=/app

RUN pip install --no-cache-dir -r model_server/requirements.txt

# ✅ Cloud Run이 기대하는 포트로 수정!
CMD ["uvicorn", "model_server.main:app", "--host", "0.0.0.0", "--port", "8080"]