FROM python:3.12-slim

# libpq-dev is for Postgres, build-essential/gcc for compiling dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV FASTEMBED_CACHE_DIR=/app/fastembed_cache

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the model during the build phase
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='BAAI/bge-small-en-v1.5', cache_dir='/app/fastembed_cache')"

# NOW copy the rest of your code
COPY . .

# Run migrations and start gunicorn
CMD sh -c "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT"