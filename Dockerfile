# Dockerfile para WIN NOC System - Render Deployment
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos de la aplicación
COPY win_noc_server.py .

# Copiar directorios de la aplicación (con verificación)
COPY . .

# Crear directorios necesarios si no existen
RUN mkdir -p templates static

# Exponer puerto
EXPOSE 5000

# Variables de entorno
ENV FLASK_APP=win_noc_server.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Comando para ejecutar la aplicación
CMD ["python", "win_noc_server.py"]