# Use the official Python image
FROM python:3.11-slim

# Install system dependencies for ChromaDB/pysqlite3
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- THE CRITICAL PART ---
# Copy your main code
COPY main.py .
COPY build_prompt.py .

# This copies the folder and everything inside it recursively
COPY vcaa_json_index/ ./vcaa_json_index/

# Expose the port
EXPOSE 8080

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]