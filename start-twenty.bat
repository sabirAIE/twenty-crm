@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo           Starting Twenty CRM with Docker
echo ========================================================
echo.

docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker daemon is not accessible!
    echo.
    echo Please make sure:
    echo  1. WSL 2 is installed (Run 'wsl --install' in PowerShell as Administrator)
    echo  2. Docker Desktop is running and fully started
    echo.
    pause
    exit /b 1
)

echo [OK] Docker daemon is ready.
echo [INFO] Starting Twenty CRM containers...
echo.

docker compose --env-file packages/twenty-docker/.env -f packages/twenty-docker/docker-compose.yml up -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Docker containers. Check Docker logs with:
    echo         docker compose --env-file packages/twenty-docker/.env -f packages/twenty-docker/docker-compose.yml logs
    pause
    exit /b 1
)

echo.
echo [INFO] Waiting for Twenty CRM server to become ready (running migrations & startup)...
set /a retries=0
:wait_loop
curl -s --fail http://localhost:3000/healthz >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto :ready
)
set /a retries+=1
if %retries% GEQ 30 (
    echo [WARN] Server is taking longer than usual. It may still be finishing migrations.
    goto :open_browser
)
timeout /t 3 /nobreak >nul
<nul set /p=.
goto :wait_loop

:ready
echo.
echo [OK] Twenty CRM is healthy and ready!

:open_browser
echo.
echo ========================================================
echo Web App URL: http://localhost:3000
echo ========================================================
echo.
start http://localhost:3000

