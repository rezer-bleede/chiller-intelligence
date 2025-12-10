@echo off
setlocal enabledelayedexpansion

REM Chiller Intelligence Quick Deploy Script for Windows (Batch)
REM This script downloads and deploys the Chiller Intelligence application

echo.
echo 🌡️ Chiller Intelligence Quick Deploy
echo =====================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/install/windows/
    pause
    exit /b 1
)
echo ✅ Docker is installed

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not available. Please install Docker Compose.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)
echo ✅ Docker Compose is available

REM Create deployment directory
set DEPLOY_DIR=chiller-intelligence-deploy
if exist "%DEPLOY_DIR%" (
    echo 📁 Directory %DEPLOY_DIR% already exists. Updating files...
) else (
    echo 📁 Creating deployment directory: %DEPLOY_DIR%
    mkdir "%DEPLOY_DIR%"
)

cd "%DEPLOY_DIR%"

REM Download deployment files
echo 📥 Downloading deployment files...

set BASE_URL=https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main

echo    Downloading docker-compose.prod.yml...
powershell -Command "Invoke-WebRequest -Uri '%BASE_URL%/docker-compose.prod.yml' -OutFile 'docker-compose.prod.yml' -UseBasicParsing" 2>nul
if errorlevel 1 (
    echo    ❌ Failed to download docker-compose.prod.yml
    pause
    exit /b 1
)
echo    ✅ docker-compose.prod.yml downloaded

echo    Downloading .env.example...
powershell -Command "Invoke-WebRequest -Uri '%BASE_URL%/.env.example' -OutFile '.env.example' -UseBasicParsing" 2>nul
if errorlevel 1 (
    echo    ❌ Failed to download .env.example
    pause
    exit /b 1
)
echo    ✅ .env.example downloaded

echo    Downloading deploy.ps1...
powershell -Command "Invoke-WebRequest -Uri '%BASE_URL%/deploy.ps1' -OutFile 'deploy.ps1' -UseBasicParsing" 2>nul
if errorlevel 1 (
    echo    ❌ Failed to download deploy.ps1
    pause
    exit /b 1
)
echo    ✅ deploy.ps1 downloaded

echo    Downloading deploy.bat...
powershell -Command "Invoke-WebRequest -Uri '%BASE_URL%/deploy.bat' -OutFile 'deploy.bat' -UseBasicParsing" 2>nul
if errorlevel 1 (
    echo    ❌ Failed to download deploy.bat
    pause
    exit /b 1
)
echo    ✅ deploy.bat downloaded

echo ✅ Files downloaded successfully!

REM Check if .env exists, if not create from example
if not exist ".env" (
    echo ⚙️ Creating .env file from template...
    copy ".env.example" ".env" >nul
    
    echo.
    echo 🔧 CONFIGURATION REQUIRED:
    echo    Please edit the .env file and set your DOCKERHUB_USERNAME
    echo.
    echo    Example:
    echo    DOCKERHUB_USERNAME=myusername
    echo.
    
    set /p response="Would you like to edit the .env file now? (y/N): "
    if /i "!response!"=="y" (
        notepad ".env"
    )
    
    echo 📝 After configuring .env, run: deploy.bat or deploy.ps1
) else (
    echo ⚙️ Using existing .env file
    
    REM Check if DOCKERHUB_USERNAME is set
    findstr /B "DOCKERHUB_USERNAME=" ".env" | findstr /V "your-dockerhub-username" >nul
    if not errorlevel 1 (
        echo 🚀 Configuration looks good! Starting deployment...
        call deploy.bat
    ) else (
        echo ⚠️  Please set DOCKERHUB_USERNAME in .env file, then run: deploy.bat
    )
)

echo.
echo 📍 Deployment files are in: %CD%
echo 🚀 To deploy manually:
echo    Command Prompt: deploy.bat
echo    PowerShell: deploy.ps1
echo.
pause