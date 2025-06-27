@echo off
echo ========================================
echo WIN NOC - Iniciando Sistema
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker no está disponible. Iniciando servicios manualmente...
    goto manual_start
)

echo Verificando Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Compose no está disponible. Iniciando servicios manualmente...
    goto manual_start
)

echo Iniciando servicios con Docker Compose...
docker-compose up --build
goto end

:manual_start
echo.
echo ========================================
echo Inicio Manual de Servicios
echo ========================================
echo.

echo Iniciando Backend...
start "WIN NOC Backend" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo Iniciando Frontend...
start "WIN NOC Frontend" cmd /k "cd frontend && npm start"

timeout /t 5 /nobreak >nul

echo Iniciando Módulo de ML...
start "WIN NOC ML" cmd /k "cd ml-predictor && venv\Scripts\activate && python app.py"

echo.
echo ========================================
echo Servicios iniciados!
echo ========================================
echo.
echo Dashboard: http://localhost:3000
echo API Backend: http://localhost:3001
echo API ML: http://localhost:5000
echo.
echo Presiona cualquier tecla para abrir el dashboard...
pause >nul
start http://localhost:3000

:end