#!/bin/bash

# Chiller Intelligence Deployment Script
# This script deploys the Chiller Intelligence application using Docker Compose

set -e

echo "🚀 Chiller Intelligence Deployment Script"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit the .env file with your configuration before running this script again."
        echo "   Required: DOCKERHUB_USERNAME"
        echo "   Recommended: POSTGRES_PASSWORD, SECRET_KEY, GENERATOR_SERVICE_TOKEN"
        exit 1
    else
        echo "❌ No .env.example file found. Please create a .env file manually."
        exit 1
    fi
fi

# Source environment variables
source .env

# Validate required environment variables
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ DOCKERHUB_USERNAME is not set in .env file"
    exit 1
fi

echo "📋 Configuration:"
echo "   Docker Hub Username: $DOCKERHUB_USERNAME"
echo "   Image Tag: ${TAG:-latest}"
echo ""

# Pull the latest images
echo "📥 Pulling Docker images..."
docker compose -f docker-compose.prod.yml pull

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Start the application
echo "🚀 Starting Chiller Intelligence..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access the application:"
echo "   Web Interface: http://localhost:3000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📝 To view logs: docker compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker compose -f docker-compose.prod.yml down"