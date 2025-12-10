# 🪟 Windows Deployment Troubleshooting

This guide helps resolve common issues when deploying Chiller Intelligence on Windows.

## 🔧 Prerequisites

### Docker Desktop for Windows
- Download from: https://docs.docker.com/desktop/install/windows/
- Ensure Docker Desktop is running before deployment
- Enable WSL 2 backend if prompted

### PowerShell Execution Policy
If you get execution policy errors, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🚨 Common Issues

### 1. "Docker is not installed" Error

**Problem**: The script can't find Docker
**Solution**: 
1. Install Docker Desktop for Windows
2. Restart your computer after installation
3. Ensure Docker Desktop is running (check system tray)
4. Open a new terminal window

### 2. PowerShell Script Won't Run

**Problem**: `.\deploy.ps1` gives execution policy error
**Solutions**:
```powershell
# Option 1: Bypass execution policy for this script
powershell -ExecutionPolicy Bypass -File .\deploy.ps1

# Option 2: Change execution policy (as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Option 3: Use the batch file instead
deploy.bat
```

### 3. Download Fails with SSL/TLS Error

**Problem**: `Invoke-WebRequest` fails with SSL errors
**Solution**:
```powershell
# Add TLS 1.2 support
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Then run the deployment command again
```

### 4. Port Already in Use

**Problem**: "Port 3000 is already in use"
**Solutions**:
1. **Find what's using the port**:
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Change ports in docker-compose.prod.yml**:
   ```yaml
   web:
     ports:
       - "3001:80"  # Change from 3000 to 3001
   ```

### 5. Docker Compose Command Not Found

**Problem**: `docker compose` command not recognized
**Solutions**:
1. **Update Docker Desktop** to latest version
2. **Use legacy command**:
   ```cmd
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 6. Permission Denied Errors

**Problem**: Can't create files or directories
**Solutions**:
1. **Run as Administrator**
2. **Check antivirus software** - temporarily disable real-time protection
3. **Use a different directory**:
   ```cmd
   cd C:\Users\%USERNAME%\Desktop
   mkdir chiller-deploy
   cd chiller-deploy
   ```

### 7. Network Connection Issues

**Problem**: Can't download files or pull Docker images
**Solutions**:
1. **Check corporate firewall/proxy**
2. **Configure Docker proxy** (if behind corporate firewall):
   - Docker Desktop → Settings → Resources → Proxies
3. **Use alternative download method**:
   ```powershell
   # Download with different user agent
   $headers = @{'User-Agent' = 'Mozilla/5.0'}
   Invoke-WebRequest -Uri "URL" -OutFile "filename" -Headers $headers
   ```

### 8. WSL 2 Issues

**Problem**: Docker Desktop requires WSL 2
**Solutions**:
1. **Enable WSL 2**:
   ```cmd
   # Run as Administrator
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```
2. **Restart computer**
3. **Download WSL 2 kernel update**: https://aka.ms/wsl2kernel
4. **Set WSL 2 as default**:
   ```cmd
   wsl --set-default-version 2
   ```

### 9. Notepad Won't Open .env File

**Problem**: Notepad doesn't open or shows weird characters
**Solutions**:
1. **Use different editor**:
   ```cmd
   code .env          # VS Code
   notepad++ .env     # Notepad++
   ```
2. **Manual edit**:
   - Right-click → Open with → Choose program
   - Select Notepad or your preferred text editor

### 10. Container Startup Failures

**Problem**: Containers fail to start
**Diagnosis**:
```cmd
# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs

# Check specific service logs
docker compose -f docker-compose.prod.yml logs api
```

**Common fixes**:
1. **Increase Docker memory** (Docker Desktop → Settings → Resources)
2. **Check .env file** for correct DOCKERHUB_USERNAME
3. **Verify images exist** on DockerHub

## 🛠️ Alternative Deployment Methods

### Method 1: Manual Docker Commands
```cmd
# Pull images manually
docker pull %DOCKERHUB_USERNAME%/chiller-intelligence-api:latest
docker pull %DOCKERHUB_USERNAME%/chiller-intelligence-web:latest
docker pull %DOCKERHUB_USERNAME%/chiller-intelligence-data-generator:latest
docker pull postgres:16

# Run with docker compose
docker compose -f docker-compose.prod.yml up -d
```

### Method 2: Use Git Bash (if installed)
```bash
# If you have Git for Windows installed
curl -fsSL https://raw.githubusercontent.com/rezer-bleede/chiller-intelligence/main/docs/quick-deploy.sh | bash
```

### Method 3: Download Files Manually
1. Visit: https://rezer-bleede.github.io/chiller-intelligence/
2. Download all files manually
3. Edit .env file in text editor
4. Run deployment script

## 📞 Getting Help

If you're still having issues:

1. **Check Docker Desktop status** - ensure it's running
2. **Restart Docker Desktop**
3. **Try running as Administrator**
4. **Check Windows version compatibility**
5. **Disable antivirus temporarily** during deployment
6. **Use Windows Subsystem for Linux (WSL)** as alternative

## 🔍 Debug Information

To gather debug information for support:

```cmd
# System information
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# Docker version
docker --version
docker compose version

# PowerShell version
$PSVersionTable.PSVersion

# Network connectivity test
ping github.com
nslookup raw.githubusercontent.com
```

## 🌐 Alternative Platforms

If Windows deployment continues to fail, consider:
- **Windows Subsystem for Linux (WSL)** - Use Linux commands in Windows
- **Virtual Machine** - Run Ubuntu/Linux VM
- **Cloud deployment** - Use cloud platforms like AWS, Azure, or DigitalOcean