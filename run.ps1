# DSAForge Startup Automation Script
Write-Host "🚀 Launching DSAForge Tracker..." -ForegroundColor Magenta

# 1. Start FastAPI Backend Server
Write-Host "👉 Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 2. Start Vite React Frontend Dev Server
Write-Host "👉 Starting React Development Server on http://localhost:5173..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# 3. Open Browser
Start-Sleep -Seconds 3
Write-Host "🎉 Opening DSAForge in your browser!" -ForegroundColor Green
Start-Process "http://localhost:5173"
