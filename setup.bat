@echo off
echo ========================================
echo WIN NOC - Setup del Sistema
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado. Por favor instala Node.js 20.x desde https://nodejs.org/
    pause
    exit /b 1
)

echo Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado. Por favor instala Python 3.11 desde https://python.org/
    pause
    exit /b 1
)

echo Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: PostgreSQL no está instalado o no está en el PATH
    echo Por favor instala PostgreSQL 15+ desde https://postgresql.org/
)

echo.
echo ========================================
echo Configurando Backend...
echo ========================================
cd backend
if not exist .env (
    echo Copiando archivo de configuración...
    copy .env.example .env
)

echo Instalando dependencias del backend...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias del backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configurando Frontend...
echo ========================================
cd ..\frontend

echo Instalando dependencias del frontend...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias del frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configurando Módulo de ML...
echo ========================================
cd ..\ml-predictor

echo Creando entorno virtual de Python...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el entorno virtual
    pause
    exit /b 1
)

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo Instalando dependencias de Python...
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Falló la instalación de dependencias de Python
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Configuración completada exitosamente!
echo ========================================
echo.
echo Para iniciar el sistema:
echo 1. Asegúrate de que PostgreSQL esté ejecutándose
echo 2. Ejecuta: docker-compose up
echo    O ejecuta cada servicio por separado:
echo    - Backend: cd backend && npm run dev
echo    - Frontend: cd frontend && npm start
echo    - ML: cd ml-predictor && venv\Scripts\activate && python app.py
echo.
echo Dashboard disponible en: http://localhost:3000
echo API Backend en: http://localhost:3001
echo API ML en: http://localhost:5000
echo.
pause