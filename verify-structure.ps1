# GigFlow Structure Verification Script

Write-Host "🔍 Verifying GigFlow Project Structure..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = @()

# Check root structure
Write-Host "Checking root structure..." -ForegroundColor Yellow

if (Test-Path "backend") {
    $success += "✅ backend/ folder exists"
} else {
    $errors += "❌ backend/ folder missing"
}

if (Test-Path "frontend") {
    $success += "✅ frontend/ folder exists"
} else {
    $errors += "❌ frontend/ folder missing"
}

if (Test-Path "package.json") {
    $success += "✅ Root package.json exists"
} else {
    $warnings += "⚠️  Root package.json missing (optional)"
}

# Check backend
Write-Host "Checking backend structure..." -ForegroundColor Yellow

if (Test-Path "backend/index.js") {
    $success += "✅ backend/index.js exists"
} else {
    $errors += "❌ backend/index.js missing"
}

if (Test-Path "backend/package.json") {
    $success += "✅ backend/package.json exists"
} else {
    $errors += "❌ backend/package.json missing"
}

if (Test-Path "backend/.env") {
    $success += "✅ backend/.env exists"
} else {
    $warnings += "⚠️  backend/.env missing (copy from .env.example)"
}

if (Test-Path "backend/.env.example") {
    $success += "✅ backend/.env.example exists"
} else {
    $warnings += "⚠️  backend/.env.example missing"
}

$backendFolders = @("config", "controllers", "middleware", "models", "routes", "utils")
foreach ($folder in $backendFolders) {
    if (Test-Path "backend/$folder") {
        $success += "✅ backend/$folder/ exists"
    } else {
        $errors += "❌ backend/$folder/ missing"
    }
}

# Check frontend
Write-Host "Checking frontend structure..." -ForegroundColor Yellow

if (Test-Path "frontend/src") {
    $success += "✅ frontend/src/ exists"
} else {
    $errors += "❌ frontend/src/ missing"
}

if (Test-Path "frontend/package.json") {
    $success += "✅ frontend/package.json exists"
} else {
    $errors += "❌ frontend/package.json missing"
}

if (Test-Path "frontend/vite.config.js") {
    $success += "✅ frontend/vite.config.js exists"
} else {
    $errors += "❌ frontend/vite.config.js missing"
}

if (Test-Path "frontend/vercel.json") {
    $success += "✅ frontend/vercel.json exists"
} else {
    $warnings += "⚠️  frontend/vercel.json missing"
}

# Check deployment files
Write-Host "Checking deployment files..." -ForegroundColor Yellow

if (Test-Path "render.yaml") {
    $success += "✅ render.yaml exists"
} else {
    $warnings += "⚠️  render.yaml missing"
}

if (Test-Path "DEPLOYMENT.md") {
    $success += "✅ DEPLOYMENT.md exists"
} else {
    $warnings += "⚠️  DEPLOYMENT.md missing"
}

if (Test-Path ".gitignore") {
    $success += "✅ .gitignore exists"
} else {
    $errors += "❌ .gitignore missing"
}

# Check for files that shouldn't exist
Write-Host "Checking for misplaced files..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $errors += "❌ Root node_modules/ exists (should be deleted)"
} else {
    $success += "✅ No root node_modules/"
}

if (Test-Path ".env") {
    $errors += "❌ Root .env exists (should be in backend/)"
} else {
    $success += "✅ No root .env file"
}

if (Test-Path "src") {
    $errors += "❌ Root src/ exists (should be in backend/)"
} else {
    $success += "✅ No root src/ folder"
}

# Print results
Write-Host ""
Write-Host "================== RESULTS ==================" -ForegroundColor Cyan
Write-Host ""

if ($success.Count -gt 0) {
    Write-Host "SUCCESS ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "  $item" -ForegroundColor Green
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "ERRORS ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "❌ Structure verification FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Structure verification PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your project is ready for:" -ForegroundColor Cyan
    Write-Host "  1. GitHub commit" -ForegroundColor White
    Write-Host "  2. Deployment to Render (backend)" -ForegroundColor White
    Write-Host "  3. Deployment to Vercel (frontend)" -ForegroundColor White
    Write-Host ""
    exit 0
}
