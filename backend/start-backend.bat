@echo off
setlocal
cd /d "%~dp0"
set "PY=C:\Users\Sri\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not exist "%PY%" set "PY=python"
if not exist "crimemap.db" (
  echo Seeding synthetic CRIMEMAP database...
  "%PY%" seed_database.py
  if errorlevel 1 pause & exit /b 1
)
echo Starting CRIMEMAP FastAPI backend on http://127.0.0.1:8000 ...
"%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
endlocal
