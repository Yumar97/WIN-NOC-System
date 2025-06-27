#!/bin/bash

# WIN NOC System - Build script para Render
echo "🚀 Iniciando build de WIN NOC System..."

# Crear directorios necesarios
mkdir -p templates static

# Instalar dependencias
echo "📦 Instalando dependencias de Python..."
pip install -r requirements.txt

echo "✅ Build completado exitosamente!"