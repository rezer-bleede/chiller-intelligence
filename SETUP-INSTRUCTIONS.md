# 🚀 Chiller Intelligence - Setup Instructions

This document provides step-by-step instructions for setting up the complete CI/CD pipeline and deployment system.

## 📋 Overview

The setup includes:
1. **GitHub Actions** - Automatically builds and publishes Docker images to DockerHub
2. **Production Docker Compose** - Uses published images for easy deployment
3. **GitHub Pages** - Hosts deployment files and quick-deploy script
4. **One-command deployment** - Users can deploy without cloning the repository

## 🔧 Repository Setup

### 1. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=your-dockerhub-access-token
```

**To create a DockerHub access token:**
1. Go to [DockerHub Account Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token and add it as `DOCKERHUB_TOKEN` secret

### 2. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/docs`
5. Click Save

### 3. Push Changes

Push all the new files to trigger the GitHub Actions workflow:

```bash
git add .
git commit -m "Add Docker publishing and deployment system

- GitHub Actions workflow for building and publishing Docker images
- Production docker-compose file using published images
- Quick deployment script and documentation
- GitHub Pages setup for hosting deployment files"
git push origin main
```

## 🐳 Docker Images

After the GitHub Actions workflow runs, the following images will be available on DockerHub:

- `{DOCKERHUB_USERNAME}/chiller-intelligence-api:latest`
- `{DOCKERHUB_USERNAME}/chiller-intelligence-web:latest`
- `{DOCKERHUB_USERNAME}/chiller-intelligence-data-generator:latest`

## 🌐 Deployment URLs

Once GitHub Pages is enabled, users can access:

- **Quick Deploy Page**: `https://{username}.github.io/chiller-intelligence/`
- **Quick Deploy Script**: `https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docs/quick-deploy.sh`

## 🧪 Testing

Run the test script to validate everything is set up correctly:

```bash
./test-deployment.sh
```

## 📚 User Instructions

Share these commands with users for easy deployment:

### One-Command Deploy

#### 🐧 Linux / macOS
```bash
curl -fsSL https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docs/quick-deploy.sh | bash
```

#### 🪟 Windows PowerShell
```powershell
iwr -useb https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docs/quick-deploy.ps1 | iex
```

#### 🪟 Windows Command Prompt
```cmd
powershell -Command "iwr -useb https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docs/quick-deploy.bat -OutFile quick-deploy.bat; .\quick-deploy.bat"
```

### Manual Deploy

#### 🐧 Linux / macOS
```bash
# Download files
curl -O https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/{username}/chiller-intelligence/main/.env.example
curl -O https://raw.githubusercontent.com/{username}/chiller-intelligence/main/deploy.sh

# Configure and deploy
cp .env.example .env
# Edit .env and set DOCKERHUB_USERNAME={your-username}
chmod +x deploy.sh && ./deploy.sh
```

#### 🪟 Windows PowerShell
```powershell
# Download files
iwr -Uri "https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docker-compose.prod.yml" -OutFile "docker-compose.prod.yml"
iwr -Uri "https://raw.githubusercontent.com/{username}/chiller-intelligence/main/.env.example" -OutFile ".env.example"
iwr -Uri "https://raw.githubusercontent.com/{username}/chiller-intelligence/main/deploy.ps1" -OutFile "deploy.ps1"

# Configure and deploy
cp .env.example .env
# Edit .env and set DOCKERHUB_USERNAME={your-username}
.\deploy.ps1
```

#### 🪟 Windows Command Prompt
```cmd
# Download files
powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/{username}/chiller-intelligence/main/docker-compose.prod.yml' -OutFile 'docker-compose.prod.yml'"
powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/{username}/chiller-intelligence/main/.env.example' -OutFile '.env.example'"
powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/{username}/chiller-intelligence/main/deploy.bat' -OutFile 'deploy.bat'"

# Configure and deploy
copy .env.example .env
# Edit .env and set DOCKERHUB_USERNAME={your-username}
deploy.bat
```

## 🔄 Workflow

1. **Developer pushes code** → GitHub Actions builds and publishes Docker images
2. **User runs quick-deploy** → Downloads docker-compose file and deploys using published images
3. **No repository cloning required** → Complete deployment from hosted files

## 🛠️ Maintenance

### Updating Images
- Push to main branch → GitHub Actions automatically builds and publishes new images
- Users can update with: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`

### Adding New Services
1. Add Dockerfile to new service directory
2. Update `docker-compose.yml` (development)
3. Update `docker-compose.prod.yml` (production)
4. Update GitHub Actions matrix to include new service
5. Update documentation

## 🔍 Troubleshooting

### GitHub Actions fails
- Check DockerHub credentials in repository secrets
- Verify Dockerfile syntax in each service directory
- Check GitHub Actions logs for specific errors

### Deployment fails
- Verify `DOCKERHUB_USERNAME` is set correctly in `.env`
- Check if Docker images exist on DockerHub
- Ensure Docker and Docker Compose are installed

### GitHub Pages not working
- Verify Pages is enabled with source set to `/docs` folder
- Check that `docs/index.html` exists in the repository
- Wait a few minutes for Pages to deploy after pushing

## 📞 Support

For issues with the deployment system:
1. Check the test script output: `./test-deployment.sh`
2. Verify all files are present and have correct permissions
3. Check GitHub Actions workflow logs
4. Ensure DockerHub images are published correctly