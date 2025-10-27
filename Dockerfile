# Stage 1: Build React frontend
FROM node:20 AS frontend-build
WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build assets
COPY frontend/ .
# Build tailwind CSS output first (if applicable)
RUN npm run build:css
# Then build Vite production assets
RUN npm run build


# Stage 2: Set up Django backend
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy built frontend static assets into Django static folder
COPY --from=frontend-build /frontend/dist /app/backend/static

# Collect static files for Django
RUN python manage.py collectstatic --noinput

# Expose port 8000 for application
EXPOSE 8000

# Run Gunicorn WSGI server
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
