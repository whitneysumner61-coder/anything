@echo off
REM PyBridge DevOS Launcher Script for Windows

echo Starting PyBridge DevOS...

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Build the application
echo Building application...
call npm run build
call npm run build:app

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

REM Open browser after a short delay
start "" http://localhost:3000

REM Start the server
echo Starting server at http://localhost:3000
echo Press Ctrl+C to stop the server
call npm run app
