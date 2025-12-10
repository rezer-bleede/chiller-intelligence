#!/bin/bash

# Chiller Intelligence Quick Deploy Script
# This script downloads and deploys the Chiller Intelligence application

set -e

echo "🌡️ Chiller Intelligence Quick Deploy"
echo "====================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="chiller-intelligence-deploy"
if [ -d "$DEPLOY_DIR" ]; then
    echo "📁 Directory $DEPLOY_DIR already exists. Updating files..."
else
    echo "📁 Creating deployment directory: $DEPLOY_DIR"
    mkdir "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# Download deployment files
echo "📥 Downloading deployment files..."

# Download docker-compose.prod.yml
curl -fsSL -o docker-compose.prod.yml https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docker-compose.prod.yml

# Download .env.example
curl -fsSL -o .env.example https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/.env.example

# Download deploy.sh
curl -fsSL -o deploy.sh https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/deploy.sh
chmod +x deploy.sh

echo "✅ Files downloaded successfully!"

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    
    echo ""
    echo "🔧 CONFIGURATION REQUIRED:"
    echo "   Please edit the .env file and set your DOCKERHUB_USERNAME"
    echo ""
    echo "   Example:"
    echo "   DOCKERHUB_USERNAME=myusername"
    echo ""
    
    # Try to open .env file in default editor
    if command -v nano &> /dev/null; then
        read -p "Would you like to edit the .env file now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            nano .env
        fi
    fi
    
    echo "📝 After configuring .env, run: ./deploy.sh"
else
    echo "⚙️ Using existing .env file"
    
    # Check if DOCKERHUB_USERNAME is set
    if grep -q "^DOCKERHUB_USERNAME=" .env && ! grep -q "^DOCKERHUB_USERNAME=your-dockerhub-username" .env; then
        echo "🚀 Configuration looks good! Starting deployment..."
        ./deploy.sh
    else
        echo "⚠️  Please set DOCKERHUB_USERNAME in .env file, then run: ./deploy.sh"
    fi
fi

echo ""
echo "📍 Deployment files are in: $(pwd)"
echo "🚀 To deploy manually: ./deploy.sh"