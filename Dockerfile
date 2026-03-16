
FROM python:3.12-slim AS builder

WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim

WORKDIR /app


COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/


COPY app/ ./app/

# COPY scripts/ ./scripts/


EXPOSE 8000


RUN useradd -m appuser
USER appuser

# cmd to run the app when container is started
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]