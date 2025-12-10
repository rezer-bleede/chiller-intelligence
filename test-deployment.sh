#!/bin/bash

# Test script to validate deployment files
set -e

echo "🧪 Testing Chiller Intelligence Deployment Files"
echo "==============================================="

# Test 1: Validate docker-compose.prod.yml syntax
echo "📋 Testing docker-compose.prod.yml syntax..."
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.prod.yml syntax is valid"
else
    echo "❌ docker-compose.prod.yml has syntax errors"
    exit 1
fi

# Test 2: Check if all required files exist
echo "📁 Checking required files..."
required_files=("docker-compose.prod.yml" ".env.example" "deploy.sh" "deploy.ps1" "deploy.bat" "docs/index.html" "docs/quick-deploy.sh" "docs/quick-deploy.ps1" "docs/quick-deploy.bat")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Test 3: Validate .env.example format
echo "⚙️ Validating .env.example format..."
if grep -q "DOCKERHUB_USERNAME=" .env.example; then
    echo "✅ .env.example contains DOCKERHUB_USERNAME"
else
    echo "❌ .env.example missing DOCKERHUB_USERNAME"
    exit 1
fi

# Test 4: Check deploy.sh is executable
echo "🚀 Checking deploy.sh permissions..."
if [ -x "deploy.sh" ]; then
    echo "✅ deploy.sh is executable"
else
    echo "❌ deploy.sh is not executable"
    exit 1
fi

# Test 4b: Check Windows scripts exist and have content
echo "🪟 Checking Windows deployment scripts..."
if [ -f "deploy.ps1" ] && [ -s "deploy.ps1" ]; then
    echo "✅ deploy.ps1 exists and has content"
else
    echo "❌ deploy.ps1 is missing or empty"
    exit 1
fi

if [ -f "deploy.bat" ] && [ -s "deploy.bat" ]; then
    echo "✅ deploy.bat exists and has content"
else
    echo "❌ deploy.bat is missing or empty"
    exit 1
fi

# Test 5: Validate GitHub Actions workflow
echo "🔄 Checking GitHub Actions workflow..."
if [ -f ".github/workflows/docker-publish.yml" ]; then
    echo "✅ GitHub Actions workflow exists"
else
    echo "❌ GitHub Actions workflow is missing"
    exit 1
fi

# Test 6: Check docs files
echo "📚 Checking documentation files..."
if [ -f "docs/index.html" ] && [ -f "docs/quick-deploy.sh" ]; then
    echo "✅ Documentation files exist"
else
    echo "❌ Documentation files are missing"
    exit 1
fi

echo ""
echo "🎉 All deployment tests passed!"
echo ""
echo "📝 Next steps:"
echo "1. Set up DockerHub secrets in GitHub repository:"
echo "   - DOCKERHUB_USERNAME"
echo "   - DOCKERHUB_TOKEN"
echo "2. Enable GitHub Pages in repository settings (source: docs folder)"
echo "3. Push changes to trigger the GitHub Actions workflow"
echo "4. Test deployment using the quick deploy command"