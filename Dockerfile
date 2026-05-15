# Stage 1: pull the vector database from the currently deployed image
FROM australia-southeast1-docker.pkg.dev/voxii-backend-2026/cloud-run-source-deploy/voxii-tutor-backend:latest AS db

# Stage 2: fresh Python image with updated code
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY build_prompt.py .
COPY intake_classifier.py .
COPY personalized_prompt.py .
COPY curriculum_authorities.py .
COPY knowledge_graph.py .
COPY math_solver.py .

# Reuse the vector database from the existing image — keeps it out of git
COPY --from=db /app/vcaa_json_index ./vcaa_json_index/

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
