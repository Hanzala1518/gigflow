#!/bin/bash

# GigFlow Deployment Helper Script
# This script helps prepare your project for deployment

echo "🚀 GigFlow Deployment Preparation"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Commit changes now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""

# Check if remote is set
if ! git remote | grep -q origin; then
    echo "❌ No remote repository set"
    echo "Run: git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Remote repository configured"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
read -p "Push to GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || git push origin master
    echo "✅ Pushed to GitHub"
else
    echo "⏭️  Skipped pushing to GitHub"
fi

echo ""
echo "✅ Pre-deployment checks complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend on Render - see DEPLOYMENT.md Part 2"
echo "2. Deploy frontend on Vercel - see DEPLOYMENT.md Part 3"
echo "3. Update CORS_ORIGIN on Render with your Vercel URL"
echo "4. Test the deployed application"
echo ""
echo "📖 Full guide: DEPLOYMENT.md"
echo "📋 Checklist: DEPLOYMENT_CHECKLIST.md"
