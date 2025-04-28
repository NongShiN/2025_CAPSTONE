FROM python:3.10

WORKDIR /app

COPY ./model /app/model
COPY ./model/requirements.txt /app/requirements.txt

ENV PYTHONPATH=/app/model

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["uvicorn", "model.main:app", "--host", "0.0.0.0", "--port", "8080"]