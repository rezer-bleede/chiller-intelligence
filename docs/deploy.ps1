# Chiller Intelligence Deployment Script for Windows
# This script deploys the Chiller Intelligence application using Docker Compose

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "🌡️ Chiller Intelligence Deployment Script for Windows" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy.ps1" -ForegroundColor White
    Write-Host "This script will deploy the Chiller Intelligence application using Docker Compose" -ForegroundColor Gray
    exit 0
}

Write-Host "🚀 Chiller Intelligence Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker not found"
    }
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/desktop/install/windows/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker compose version 2>$null
    if (-not $composeVersion) {
        throw "Docker Compose not found"
    }
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating one from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "📝 Please edit the .env file with your configuration before running this script again." -ForegroundColor Yellow
        Write-Host "   Required: DOCKERHUB_USERNAME" -ForegroundColor White
        Write-Host "   Recommended: POSTGRES_PASSWORD, SECRET_KEY, GENERATOR_SERVICE_TOKEN" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "Opening .env file in notepad..." -ForegroundColor Gray
        Start-Process notepad ".env" -Wait
        Write-Host "After saving the .env file, run this script again." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ No .env.example file found. Please create a .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Source environment variables from .env file
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $envVars[$matches[1]] = $matches[2]
    }
}

# Validate required environment variables
if (-not $envVars.ContainsKey("DOCKERHUB_USERNAME") -or [string]::IsNullOrWhiteSpace($envVars["DOCKERHUB_USERNAME"])) {
    Write-Host "❌ DOCKERHUB_USERNAME is not set in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor White
Write-Host "   Docker Hub Username: $($envVars['DOCKERHUB_USERNAME'])" -ForegroundColor Gray
Write-Host "   Image Tag: $($envVars['TAG'] ?? 'latest')" -ForegroundColor Gray
Write-Host ""

# Pull the latest images
Write-Host "📥 Pulling Docker images..." -ForegroundColor Blue
try {
    docker compose -f docker-compose.prod.yml pull
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to pull images"
    }
    Write-Host "✅ Images pulled successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to pull Docker images. Please check your configuration." -ForegroundColor Red
    exit 1
}

# Stop existing containers if running
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down 2>$null

# Start the application
Write-Host "🚀 Starting Chiller Intelligence..." -ForegroundColor Blue
try {
    docker compose -f docker-compose.prod.yml up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start containers"
    }
} catch {
    Write-Host "❌ Failed to start containers. Check the logs for details." -ForegroundColor Red
    Write-Host "   Run: docker compose -f docker-compose.prod.yml logs" -ForegroundColor Gray
    exit 1
}

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Check service status
Write-Host "📊 Service Status:" -ForegroundColor White
docker compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Web Interface: http://localhost:3000" -ForegroundColor White
Write-Host "   API Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📝 Management commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor Gray
Write-Host "   Stop: docker compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host "   Update: docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d" -ForegroundColor Gray