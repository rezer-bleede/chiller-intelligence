@echo off
setlocal enabledelayedexpansion

REM Chiller Intelligence Deployment Script for Windows (Batch)
REM This script deploys the Chiller Intelligence application using Docker Compose

echo.
echo 🚀 Chiller Intelligence Deployment Script
echo ==========================================

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

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  No .env file found. Creating one from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo 📝 Please edit the .env file with your configuration before running this script again.
        echo    Required: DOCKERHUB_USERNAME
        echo    Recommended: POSTGRES_PASSWORD, SECRET_KEY, GENERATOR_SERVICE_TOKEN
        echo.
        echo Opening .env file in notepad...
        notepad ".env"
        echo After saving the .env file, run this script again.
        pause
        exit /b 1
    ) else (
        echo ❌ No .env.example file found. Please create a .env file manually.
        pause
        exit /b 1
    )
)

REM Check if DOCKERHUB_USERNAME is set in .env
findstr /B "DOCKERHUB_USERNAME=" ".env" >nul
if errorlevel 1 (
    echo ❌ DOCKERHUB_USERNAME is not set in .env file
    pause
    exit /b 1
)

REM Extract DOCKERHUB_USERNAME for display
for /f "tokens=2 delims==" %%a in ('findstr /B "DOCKERHUB_USERNAME=" ".env"') do set DOCKERHUB_USERNAME=%%a
for /f "tokens=2 delims==" %%a in ('findstr /B "TAG=" ".env" 2^>nul') do set TAG=%%a
if not defined TAG set TAG=latest

echo.
echo 📋 Configuration:
echo    Docker Hub Username: !DOCKERHUB_USERNAME!
echo    Image Tag: !TAG!
echo.

REM Pull the latest images
echo 📥 Pulling Docker images...
docker compose -f docker-compose.prod.yml pull
if errorlevel 1 (
    echo ❌ Failed to pull Docker images. Please check your configuration.
    pause
    exit /b 1
)

REM Stop existing containers if running
echo 🛑 Stopping existing containers...
docker compose -f docker-compose.prod.yml down >nul 2>&1

REM Start the application
echo 🚀 Starting Chiller Intelligence...
docker compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start containers. Check the logs for details.
    echo    Run: docker compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
)

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo 📊 Service Status:
docker compose -f docker-compose.prod.yml ps

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Access the application:
echo    Web Interface: http://localhost:3000
echo    API Documentation: http://localhost:8000/docs
echo.
echo 📝 Management commands:
echo    View logs: docker compose -f docker-compose.prod.yml logs -f
echo    Stop: docker compose -f docker-compose.prod.yml down
echo    Update: docker compose -f docker-compose.prod.yml pull ^&^& docker compose -f docker-compose.prod.yml up -d
echo.
pause