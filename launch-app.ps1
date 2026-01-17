<#
.SYNOPSIS
  PyBridge DevOS - Windows PowerShell Launcher

.DESCRIPTION
  Automatically builds and launches the PyBridge DevOS web application.
  - Validates Node.js 18+
  - Installs dependencies
  - Builds MCP server and web app
  - Starts the application on port 3000
  - Opens browser automatically

.PARAMETER Port
  Port number for the web server (default: 3000)

.PARAMETER KillPort
  Kill any process using the target port before starting

.PARAMETER Clean
  Remove node_modules and package-lock.json before installing

.EXAMPLE
  .\launch-app.ps1

.EXAMPLE
  .\launch-app.ps1 -Port 3001 -KillPort
#>

[CmdletBinding()]
param(
  [int]$Port = 3000,
  [switch]$KillPort,
  [switch]$Clean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info([string]$msg) {
  Write-Host "[PyBridge DevOS] " -NoNewline -ForegroundColor Cyan
  Write-Host $msg
}

function Write-Warn([string]$msg) {
  Write-Warning "[PyBridge DevOS] $msg"
}

function Write-Success([string]$msg) {
  Write-Host "[PyBridge DevOS] " -NoNewline -ForegroundColor Green
  Write-Host $msg
}

function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: '$name'. Please install it and ensure it is on PATH."
  }
}

function Get-NodeMajorVersion() {
  $v = (& node --version) 2>$null
  if (-not $v) { throw "Unable to determine Node.js version." }
  $v = $v.Trim().TrimStart("v")
  $major = [int]($v.Split(".")[0])
  return $major
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
      Write-Warn "Failed to stop PID=$pid. Error: $($_.Exception.Message)"
    }
  }
}

# --- Main Script ---
try {
  Write-Info "Starting PyBridge DevOS launcher..."
  Write-Info "Working directory: $(Get-Location)"

  # Check if we're in the right directory
  if (-not (Test-Path ".\package.json")) {
    Write-Host ""
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to navigate to the project directory first:" -ForegroundColor Yellow
    Write-Host "  cd path\to\pybridge-devos" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or if you used Claude Code teleport:" -ForegroundColor Yellow
    Write-Host "  cd (the directory shown in the teleport command)" -ForegroundColor Cyan
    Write-Host ""
    exit 1
  }

  # Preflight checks
  Require-Command "node"
  Require-Command "npm"

  $nodeMajor = Get-NodeMajorVersion
  if ($nodeMajor -lt 18) {
    throw "Node.js 18+ is required. Detected major version: $nodeMajor"
  }
  Write-Success "Node.js OK (v$nodeMajor detected)"

  # Kill port if requested
  Kill-PortProcess -portNum $Port

  # Clean if requested
  if ($Clean) {
    Write-Warn "Clean requested: removing node_modules and lockfile..."
    if (Test-Path ".\node_modules") {
      Remove-Item ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path ".\package-lock.json") {
      Remove-Item ".\package-lock.json" -Force -ErrorAction SilentlyContinue
    }
  }

  # Install dependencies
  Write-Info "Installing dependencies..."
  & npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
  Write-Success "Dependencies installed"

  # Build
  Write-Info "Building MCP server..."
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
  Write-Success "MCP server built"

  Write-Info "Building web application..."
  & npm run build:app
  if ($LASTEXITCODE -ne 0) { throw "npm run build:app failed" }
  Write-Success "Web application built"

  # Open browser after a short delay
  $targetUrl = "http://localhost:$Port/"
  Start-Job -ScriptBlock {
    param($url)
    Start-Sleep -Seconds 3
    Start-Process $url
  } -ArgumentList $targetUrl | Out-Null

  Write-Success "Opening browser: $targetUrl"
  Write-Info "Starting application..."
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host "  PyBridge DevOS is starting!" -ForegroundColor Green
  Write-Host "  URL: $targetUrl" -ForegroundColor Yellow
  Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
  Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host ""

  # Start the application
  & npm run app

} catch {
  Write-Host ""
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host ""
  exit 1
}
