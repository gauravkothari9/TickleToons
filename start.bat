@echo off
rem Starts Tickle Toons Studio. First run sets up a private Python environment for the voices.
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo First run: setting up Python environment...
  set "PY="
  where python >nul 2>nul && set "PY=python"
  if not defined PY if exist "%USERPROFILE%\.local\bin\python3.14.exe" set "PY=%USERPROFILE%\.local\bin\python3.14.exe"
  if not defined PY (
    echo Python not found. Install it from https://www.python.org/downloads/
    pause
    exit /b 1
  )
  call "%%PY%%" -m venv .venv
  ".venv\Scripts\python.exe" -m pip install -q -r requirements.txt
)

".venv\Scripts\python.exe" server.py
