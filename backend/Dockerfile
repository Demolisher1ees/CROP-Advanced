FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set Python path
ENV PYTHONPATH=/app

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run Alembic migrations and start the application
# migrations will create tables based on models
CMD ["sh", "-c", "echo 'Skipping migrations' && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
