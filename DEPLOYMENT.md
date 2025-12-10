# 🚀 Chiller Intelligence - Deployment Guide

This guide explains how to deploy the Chiller Intelligence application using pre-built Docker images from DockerHub.

## 🎯 Quick Start

### One-Command Deploy

Choose your platform:

#### 🐧 Linux / macOS
```bash
curl -fsSL https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.sh | bash
```

#### 🪟 Windows PowerShell
```powershell
iwr -useb https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.ps1 | iex
```

#### 🪟 Windows Command Prompt
```cmd
powershell -Command "iwr -useb https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.bat -OutFile quick-deploy.bat; .\quick-deploy.bat"
```

These commands will:
1. Download all necessary deployment files
2. Create a deployment directory
3. Set up configuration templates
4. Guide you through the deployment process

### Manual Deployment

#### 🐧 Linux / macOS

1. **Download deployment files:**
   ```bash
   mkdir chiller-intelligence-deploy && cd chiller-intelligence-deploy
   curl -O https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docker-compose.prod.yml
   curl -O https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/.env.example
   curl -O https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/deploy.sh
   chmod +x deploy.sh
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set DOCKERHUB_USERNAME
   ```

3. **Deploy:**
   ```bash
   ./deploy.sh
   ```

#### 🪟 Windows PowerShell

1. **Download deployment files:**
   ```powershell
   mkdir chiller-intelligence-deploy; cd chiller-intelligence-deploy
   iwr -Uri "https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docker-compose.prod.yml" -OutFile "docker-compose.prod.yml"
   iwr -Uri "https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/.env.example" -OutFile ".env.example"
   iwr -Uri "https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/deploy.ps1" -OutFile "deploy.ps1"
   ```

2. **Configure environment:**
   ```powershell
   cp .env.example .env
   notepad .env  # Edit and set DOCKERHUB_USERNAME
   ```

3. **Deploy:**
   ```powershell
   .\deploy.ps1
   ```

#### 🪟 Windows Command Prompt

1. **Download deployment files:**
   ```cmd
   mkdir chiller-intelligence-deploy && cd chiller-intelligence-deploy
   powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docker-compose.prod.yml' -OutFile 'docker-compose.prod.yml'"
   powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/.env.example' -OutFile '.env.example'"
   powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/deploy.bat' -OutFile 'deploy.bat'"
   ```

2. **Configure environment:**
   ```cmd
   copy .env.example .env
   notepad .env
   ```

3. **Deploy:**
   ```cmd
   deploy.bat
   ```

## ⚙️ Configuration

### Required Environment Variables

- `DOCKERHUB_USERNAME`: Your DockerHub username where the images are published

### Optional Environment Variables

- `TAG`: Image tag to use (default: `latest`)
- `POSTGRES_PASSWORD`: Database password (default: `postgres`)
- `SECRET_KEY`: API secret key (default: `dev-secret-key`)
- `GENERATOR_SERVICE_TOKEN`: Service token for data generator (default: `service-token-xyz`)

### Example .env file

```env
DOCKERHUB_USERNAME=myusername
TAG=latest
POSTGRES_PASSWORD=my-secure-password
SECRET_KEY=my-secret-key
GENERATOR_SERVICE_TOKEN=my-service-token
```

## 🐳 Docker Images

The following images will be pulled from DockerHub:

- `{DOCKERHUB_USERNAME}/chiller-intelligence-api:latest` - FastAPI backend
- `{DOCKERHUB_USERNAME}/chiller-intelligence-web:latest` - React frontend
- `{DOCKERHUB_USERNAME}/chiller-intelligence-data-generator:latest` - Data generation service
- `postgres:16` - PostgreSQL databases

## 🌐 Access Points

After deployment, access your application at:

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Base URL**: http://localhost:8000

## 🛠️ Management Commands

### View logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Stop the application
```bash
docker compose -f docker-compose.prod.yml down
```

### Update to latest images
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Restart a specific service
```bash
docker compose -f docker-compose.prod.yml restart api
```

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- Internet connection to pull images
- Ports 3000, 5432, 5433, and 8000 available

## 🔧 Troubleshooting

### Images not found
Make sure the `DOCKERHUB_USERNAME` in your `.env` file matches the DockerHub account where the images are published.

### Port conflicts
If you have port conflicts, modify the port mappings in `docker-compose.prod.yml`:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001 for web service
```

### Database connection issues
Ensure the database containers are fully started before the API service. The deployment script includes appropriate wait times.

## 🏗️ Architecture

The application consists of:

- **Web Service**: React frontend served by Nginx
- **API Service**: FastAPI backend with PostgreSQL
- **Data Generator**: Python service for generating sample data
- **Databases**: Two PostgreSQL instances (main and historical data)

## 📚 Additional Resources

- [GitHub Repository](https://github.com/rezer-bleede/chiller-intelligence)
- [Docker Hub Images](https://hub.docker.com/u/{DOCKERHUB_USERNAME})
- [Quick Deploy Page](https://rezer-bleede.github.io/chiller-intelligence/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker compose -f docker-compose.prod.yml logs`
2. Verify your `.env` configuration
3. Ensure all required ports are available
4. Check Docker and Docker Compose versions