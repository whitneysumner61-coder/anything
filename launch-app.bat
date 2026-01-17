@echo off
REM PyBridge DevOS Launcher Script for Windows (CMD)
REM For PowerShell users, use: .\launch-app.ps1

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   PyBridge DevOS Launcher
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo.
    echo You need to navigate to the project directory first:
    echo   cd path\to\pybridge-devos
    echo.
    pause
    exit /b 1
)

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Building MCP server...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Building web application...
call npm run build:app
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web app build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Starting application...
echo.
echo ============================================
echo   Opening browser: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ============================================
echo.

REM Open browser after a short delay
start "" http://localhost:3000

REM Start the server
call npm run app
