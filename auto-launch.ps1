<#
.SYNOPSIS
  PyBridge DevOS - Auto-Discovery Windows Launcher

.DESCRIPTION
  This script automatically:
  1. Searches your system for the pybridge-devos project
  2. Navigates to it
  3. Installs dependencies
  4. Builds and launches the application

  Run this from ANYWHERE on your Windows system!

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\auto-launch.ps1

#>

[CmdletBinding()]
param(
  [int]$Port = 3000,
  [switch]$KillPort
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info([string]$msg) {
  Write-Host "[PyBridge] " -NoNewline -ForegroundColor Cyan
  Write-Host $msg
}

function Write-Success([string]$msg) {
  Write-Host "[PyBridge] " -NoNewline -ForegroundColor Green
  Write-Host $msg
}

function Write-Warn([string]$msg) {
  Write-Warning "[PyBridge] $msg"
}

function Find-ProjectRoot {
  Write-Info "Searching for pybridge-devos project..."

  # Common search locations
  $searchPaths = @(
    "$env:USERPROFILE",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\source",
    "$env:USERPROFILE\.claude-worktrees",
    "C:\Users",
    "D:\"
  )

  $candidates = @()

  foreach ($root in $searchPaths) {
    if (-not (Test-Path $root)) { continue }

    Write-Host "  Searching in $root..." -ForegroundColor Gray

    # Look for package.json files with our project name
    Get-ChildItem -Path $root -Recurse -Filter "package.json" -Depth 5 -ErrorAction SilentlyContinue | ForEach-Object {
      try {
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        $json = $content | ConvertFrom-Json -ErrorAction Stop

        # Check if this is our project
        if ($json.name -eq "pybridge-devos") {
          $projectDir = Split-Path $_.FullName -Parent
          $candidates += [PSCustomObject]@{
            Path = $projectDir
            LastModified = $_.LastWriteTime
          }
          Write-Success "Found candidate: $projectDir"
        }
      } catch {
        # Skip invalid JSON
      }
    }
  }

  if ($candidates.Count -eq 0) {
    throw @"
Could not find the pybridge-devos project on your system.

Please do ONE of these:

1. If you know where it is, navigate there and run:
   cd path\to\pybridge-devos
   .\launch-app.ps1

2. Clone/download the project:
   git clone https://github.com/whitneysumner61-coder/anything.git
   cd anything
   .\launch-app.ps1

3. Use Claude Code teleport to sync the repository
"@
  }

  # Return the most recently modified one
  $best = $candidates | Sort-Object LastModified -Descending | Select-Object -First 1
  return $best.Path
}

function Kill-PortProcess([int]$portNum) {
  if (-not $KillPort) { return }

  Write-Info "Checking for processes on port $portNum..."
  $conns = Get-NetTCPConnection -LocalPort $portNum -State Listen -ErrorAction SilentlyContinue

  if (-not $conns) {
    Write-Info "No process found on port $portNum."
    return
  }

  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    try {
      $proc = Get-Process -Id $pid -ErrorAction Stop
      Write-Warn "Stopping process on port ${portNum}: PID=$pid Name=$($proc.ProcessName)"
      Stop-Process -Id $pid -Force
      Start-Sleep -Milliseconds 500
    } catch {
      Write-Warn "Failed to stop PID=$pid"
    }
  }
}

# ============================================
# MAIN SCRIPT
# ============================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PyBridge DevOS - Auto Discovery Launcher" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

try {
  # Find the project
  $projectPath = Find-ProjectRoot

  Write-Success "Project found at: $projectPath"
  Write-Info "Changing to project directory..."

  Set-Location $projectPath

  # Verify Node.js
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
  }

  $nodeVersion = (& node --version)
  Write-Success "Node.js version: $nodeVersion"

  # Kill port if requested
  Kill-PortProcess -portNum $Port

  # Install dependencies
  Write-Info "Installing dependencies..."
  & npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

  # Build MCP server
  Write-Info "Building MCP server..."
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "MCP server build failed" }

  # Build web app
  Write-Info "Building web application..."
  & npm run build:app
  if ($LASTEXITCODE -ne 0) { throw "Web app build failed" }

  Write-Success "Build complete!"

  # Open browser after delay
  $targetUrl = "http://localhost:$Port/"
  Start-Job -ScriptBlock {
    param($url)
    Start-Sleep -Seconds 3
    Start-Process $url
  } -ArgumentList $targetUrl | Out-Null

  # Show success message
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
  Write-Host "  🚀 PyBridge DevOS is starting!" -ForegroundColor Green
  Write-Host ""
  Write-Host "  📂 Project: $projectPath" -ForegroundColor Yellow
  Write-Host "  🌐 URL: $targetUrl" -ForegroundColor Yellow
  Write-Host "  ⌨️  Press Ctrl+C to stop" -ForegroundColor Gray
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
  Write-Host ""

  # Start the application
  & npm run app

} catch {
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
  Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
  Write-Host ""

  Write-Host "Need help? Check these files:" -ForegroundColor Yellow
  Write-Host "  - WINDOWS-SETUP.md" -ForegroundColor Cyan
  Write-Host "  - README.md" -ForegroundColor Cyan
  Write-Host "  - QUICKSTART.md" -ForegroundColor Cyan
  Write-Host ""

  exit 1
}
