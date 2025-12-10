# Chiller Intelligence Quick Deploy Script for Windows PowerShell
# This script downloads and deploys the Chiller Intelligence application

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "🌡️ Chiller Intelligence Quick Deploy for Windows" -ForegroundColor Cyan
    Write-Host "Usage: .\quick-deploy.ps1" -ForegroundColor White
    Write-Host "This script downloads and deploys the Chiller Intelligence application" -ForegroundColor Gray
    exit 0
}

Write-Host "🌡️ Chiller Intelligence Quick Deploy" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

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

# Create deployment directory
$deployDir = "chiller-intelligence-deploy"
if (Test-Path $deployDir) {
    Write-Host "📁 Directory $deployDir already exists. Updating files..." -ForegroundColor Yellow
} else {
    Write-Host "📁 Creating deployment directory: $deployDir" -ForegroundColor Blue
    New-Item -ItemType Directory -Path $deployDir | Out-Null
}

Set-Location $deployDir

# Download deployment files
Write-Host "📥 Downloading deployment files..." -ForegroundColor Blue

$baseUrl = "https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main"
$files = @{
    "docker-compose.prod.yml" = "$baseUrl/docker-compose.prod.yml"
    ".env.example" = "$baseUrl/.env.example"
    "deploy.ps1" = "$baseUrl/deploy.ps1"
    "deploy.bat" = "$baseUrl/deploy.bat"
}

foreach ($file in $files.GetEnumerator()) {
    try {
        Write-Host "   Downloading $($file.Key)..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $file.Value -OutFile $file.Key -UseBasicParsing
        Write-Host "   ✅ $($file.Key) downloaded" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to download $($file.Key): $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Files downloaded successfully!" -ForegroundColor Green

# Check if .env exists, if not create from example
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file from template..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    
    Write-Host ""
    Write-Host "🔧 CONFIGURATION REQUIRED:" -ForegroundColor Yellow
    Write-Host "   Please edit the .env file and set your DOCKERHUB_USERNAME" -ForegroundColor White
    Write-Host ""
    Write-Host "   Example:" -ForegroundColor White
    Write-Host "   DOCKERHUB_USERNAME=myusername" -ForegroundColor Gray
    Write-Host ""
    
    # Ask if user wants to edit the .env file now
    $response = Read-Host "Would you like to edit the .env file now? (y/N)"
    if ($response -match "^[Yy]") {
        Start-Process notepad ".env" -Wait
    }
    
    Write-Host "📝 After configuring .env, run: .\deploy.ps1 or .\deploy.bat" -ForegroundColor Yellow
} else {
    Write-Host "⚙️ Using existing .env file" -ForegroundColor Blue
    
    # Check if DOCKERHUB_USERNAME is set
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DOCKERHUB_USERNAME=([^`r`n]+)" -and $matches[1] -ne "your-dockerhub-username") {
        Write-Host "🚀 Configuration looks good! Starting deployment..." -ForegroundColor Green
        & ".\deploy.ps1"
    } else {
        Write-Host "⚠️  Please set DOCKERHUB_USERNAME in .env file, then run: .\deploy.ps1" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📍 Deployment files are in: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🚀 To deploy manually:" -ForegroundColor Cyan
Write-Host "   PowerShell: .\deploy.ps1" -ForegroundColor White
Write-Host "   Command Prompt: .\deploy.bat" -ForegroundColor White