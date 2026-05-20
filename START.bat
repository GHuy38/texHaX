@echo off
chcp 65001 >nul
title Razer - Setup & Launch
color 0A

echo.
echo  ██████╗  █████╗ ███████╗███████╗██████╗
echo  ██╔══██╗██╔══██╗╚══███╔╝██╔════╝██╔══██╗
echo  ██████╔╝███████║  ███╔╝ █████╗  ██████╔╝
echo  ██╔══██╗██╔══██║ ███╔╝  ██╔══╝  ██╔══██╗
echo  ██║  ██║██║  ██║███████╗███████╗██║  ██║
echo  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
echo  Color-Based Target Detection Tool v1.0.0
echo.
echo  Checking requirements...
echo  ─────────────────────────────────────────
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Node.js not found. Downloading installer...
    echo.
    
    :: Download Node.js LTS
    set NODE_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    set NODE_MSI=%TEMP%\node-installer.msi
    
    echo  Downloading Node.js v20.11.0 LTS...
    powershell -NoProfile -Command "& { $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_MSI%' }"
    
    if exist "%NODE_MSI%" (
        echo  Installing Node.js silently...
        msiexec /i "%NODE_MSI%" /quiet /norestart ADDLOCAL=ALL
        echo  Node.js installed. Please restart this script.
        pause
        exit /b 0
    ) else (
        echo  [ERROR] Failed to download Node.js.
        echo  Please install Node.js manually from: https://nodejs.org
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  [OK] Node.js %NODE_VER% found
)

:: Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] npm not found in PATH. Trying common locations...
    set NPM_CMD=
    if exist "C:\Program Files\nodejs\npm.cmd" set NPM_CMD="C:\Program Files\nodejs\npm.cmd"
    if exist "%APPDATA%\npm\npm.cmd" set NPM_CMD="%APPDATA%\npm\npm.cmd"
    if "%NPM_CMD%"=="" (
        echo  [ERROR] npm not found. Please reinstall Node.js from https://nodejs.org
        pause
        exit /b 1
    )
) else (
    set NPM_CMD=npm
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo  [OK] npm v%NPM_VER% found
)

echo.
cd /d "%~dp0"
echo  Working directory: %CD%
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo  Installing dependencies (this may take 2-3 minutes)...
    echo  ─────────────────────────────────────────
    %NPM_CMD% install
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully
) else (
    echo  [OK] Dependencies already installed
)

echo.
echo  ─────────────────────────────────────────
echo  Launching Razer...
echo  ─────────────────────────────────────────
echo.

%NPM_CMD% run dev

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Failed to launch. Check the error above.
    pause
)
