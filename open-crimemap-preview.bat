@echo off
setlocal
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

echo Checking CRIMEMAP AI preview server...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    echo Starting Vite preview server on port 3000...
    if not exist "%APP_DIR%node_modules\vite\bin\vite.js" (
        echo Dependencies are missing. Installing them first...
        call npm install
        if errorlevel 1 (
            echo Failed to install dependencies.
            pause
            exit /b 1
        )
    )
    start "CRIMEMAP AI Preview Server" /min cmd /k "cd /d \"%APP_DIR%\" && npm run dev"
    timeout /t 5 /nobreak >nul
)

echo Opening CRIMEMAP AI dashboard preview...
start "" "http://127.0.0.1:3000/dashboard"
endlocal
