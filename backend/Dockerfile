FROM python:3.11-slim

# libpq-dev is for Postgres, build-essential/gcc for compiling dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Change the pre-download line in your backend/Dockerfile
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-MiniLM-L3-v2')"

# NOW copy the rest of your code
COPY . .

# Render uses the $PORT environment variable automatically
CMD gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT