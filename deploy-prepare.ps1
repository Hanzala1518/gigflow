# GigFlow Deployment Helper Script (PowerShell)
# This script helps prepare your project for deployment

Write-Host "🚀 GigFlow Deployment Preparation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (!(Test-Path .git)) {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
    Write-Host "Run: git init"
    exit 1
}

Write-Host "✅ Git repository found" -ForegroundColor Green
Write-Host ""

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $commit = Read-Host "Commit changes now? (y/n)"
    if ($commit -eq 'y' -or $commit -eq 'Y') {
        $commitMsg = Read-Host "Enter commit message"
        git add .
        git commit -m "$commitMsg"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""

# Check if remote is set
$remote = git remote
if (!($remote -contains "origin")) {
    Write-Host "❌ No remote repository set" -ForegroundColor Red
    Write-Host "Run: git remote add origin <your-github-repo-url>"
    exit 1
}

Write-Host "✅ Remote repository configured" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
$push = Read-Host "Push to GitHub? (y/n)"
if ($push -eq 'y' -or $push -eq 'Y') {
    try {
        git push origin main
        Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
    } catch {
        try {
            git push origin master
            Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to push" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️  Skipped pushing to GitHub" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Pre-deployment checks complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy backend on Render - see DEPLOYMENT.md Part 2"
Write-Host "2. Deploy frontend on Vercel - see DEPLOYMENT.md Part 3"
Write-Host "3. Update CORS_ORIGIN on Render with your Vercel URL"
Write-Host "4. Test the deployed application"
Write-Host ""
Write-Host "📖 Full guide: DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host "📋 Checklist: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
