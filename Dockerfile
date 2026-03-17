
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


FROM python:3.12-slim

WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*


COPY --from=builder /install /usr/local


COPY app/ ./app/

# COPY scripts/ ./scripts/

EXPOSE 8000
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# cmd to run the app when container is started
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]