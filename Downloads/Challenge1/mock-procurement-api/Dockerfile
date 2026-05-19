# Use lightweight Python 3.11 base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency definition first to optimize layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY app.py .

# Expose port (Cloud Run sets PORT env variable dynamically, default to 8080)
EXPOSE 8080

# Run FastAPI app with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
