<#
.SYNOPSIS
  PyBridge DevOS 2.0 - Ultimate One-Shot Installer & Launcher

.DESCRIPTION
  This script performs a complete automated setup:
  1. Auto-discovers or downloads the project
  2. Installs to D:\PyBridge (or custom location)
  3. Installs Node.js if needed (via winget)
  4. Installs all dependencies
  5. Builds the entire system (MCP server + Web app + AI Agent)
  6. Starts the AI-powered development system
  7. Opens the web interface automatically

  NO MANUAL STEPS REQUIRED!

.PARAMETER InstallPath
  Installation directory (default: D:\PyBridge)

.PARAMETER SkipNodeInstall
  Skip automatic Node.js installation

.PARAMETER CleanInstall
  Remove existing installation and start fresh

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File oneshot-install.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File oneshot-install.ps1 -InstallPath "C:\Dev\PyBridge"

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File oneshot-install.ps1 -CleanInstall
#>

[CmdletBinding()]
param(
  [string]$InstallPath = "D:\PyBridge",
  [switch]$SkipNodeInstall,
  [switch]$CleanInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ============================================
# Configuration
# ============================================
$GITHUB_REPO = "https://github.com/whitneysumner61-coder/anything"
$PROJECT_NAME = "pybridge-devos"
$REQUIRED_NODE_MAJOR = 18
$PORT = 3000
$WS_PORT = 3001

# ============================================
# Utility Functions
# ============================================

function Write-Banner {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🚀 PyBridge DevOS 2.0 - AI Development System" -ForegroundColor Green
    Write-Host "  Ultimate One-Shot Installer & Launcher" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step([string]$msg) {
    Write-Host "[SETUP] " -NoNewline -ForegroundColor Cyan
    Write-Host $msg
}

function Write-Success([string]$msg) {
    Write-Host "✓ " -NoNewline -ForegroundColor Green
    Write-Host $msg -ForegroundColor White
}

function Write-Warn([string]$msg) {
    Write-Warning "[SETUP] $msg"
}

function Test-NodeInstalled {
    try {
        $version = (& node --version 2>$null)
        if ($version) {
            $major = [int]($version.TrimStart('v').Split('.')[0])
            return $major
        }
    } catch {}
    return 0
}

function Install-NodeJS {
    Write-Step "Node.js not found or version too old. Installing Node.js LTS..."

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget not found. Please install Node.js manually from https://nodejs.org/ and rerun this script."
    }

    try {
        & winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent | Out-Null

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")

        Write-Success "Node.js installed"
    } catch {
        throw "Failed to install Node.js automatically. Please install manually from https://nodejs.org/"
    }
}

function Find-ProjectSource {
    Write-Step "Searching for existing project..."

    $searchPaths = @(
        "$env:USERPROFILE\.claude-worktrees",
        "$env:USERPROFILE\source",
        "$env:USERPROFILE\Documents",
        "$env:USERPROFILE\Desktop",
        "$env:USERPROFILE\Downloads"
    )

    foreach ($root in $searchPaths) {
        if (-not (Test-Path $root)) { continue }

        $found = Get-ChildItem -Path $root -Recurse -Filter "package.json" -Depth 4 -ErrorAction SilentlyContinue |
            Where-Object {
                try {
                    $content = Get-Content $_.FullName -Raw -ErrorAction Stop
                    $json = $content | ConvertFrom-Json -ErrorAction Stop
                    return $json.name -eq $PROJECT_NAME
                } catch {
                    return $false
                }
            } | Select-Object -First 1

        if ($found) {
            $projectPath = Split-Path $found.FullName -Parent
            Write-Success "Found existing project at: $projectPath"
            return $projectPath
        }
    }

    return $null
}

function Install-FromGit {
    param([string]$targetPath)

    Write-Step "Downloading project from GitHub..."

    if (Get-Command git -ErrorAction SilentlyContinue) {
        # Use git clone
        & git clone $GITHUB_REPO $targetPath 2>&1 | Out-Null
        Write-Success "Project cloned via git"
    } else {
        # Download ZIP
        Write-Step "Git not found, downloading ZIP archive..."

        $zipUrl = "$GITHUB_REPO/archive/refs/heads/main.zip"
        $zipPath = Join-Path $env:TEMP "pybridge-devos.zip"

        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

        Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force

        # Move extracted folder
        $extractedPath = Join-Path $env:TEMP "anything-main"
        if (Test-Path $extractedPath) {
            Move-Item -Path $extractedPath -Destination $targetPath -Force
        }

        Remove-Item $zipPath -Force
        Write-Success "Project downloaded and extracted"
    }
}

function Copy-ProjectTo([string]$source, [string]$destination) {
    Write-Step "Copying project to $destination..."

    if (Test-Path $destination) {
        if ($CleanInstall) {
            Write-Warn "Removing existing installation..."
            Remove-Item -Path $destination -Recurse -Force
        } else {
            Write-Warn "Installation directory exists. Using existing installation."
            return
        }
    }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null

    # Use robocopy for efficient copying
    $exclude = @("node_modules", "dist", "build", ".git", ".next")
    $xd = $exclude | ForEach-Object { "/XD", $_ }

    & robocopy $source $destination /MIR /R:1 /W:1 /NFL /NDL @xd | Out-Null

    Write-Success "Project copied to installation directory"
}

# ============================================
# Main Installation
# ============================================

try {
    Write-Banner

    # Step 1: Check/Install Node.js
    Write-Step "Checking Node.js installation..."
    $nodeMajor = Test-NodeInstalled

    if ($nodeMajor -lt $REQUIRED_NODE_MAJOR -and -not $SkipNodeInstall) {
        Install-NodeJS
        $nodeMajor = Test-NodeInstalled

        if ($nodeMajor -lt $REQUIRED_NODE_MAJOR) {
            throw "Node.js installation failed. Please close this terminal, open a new one, and rerun."
        }
    }

    Write-Success "Node.js v$nodeMajor detected"

    # Step 2: Find or Download Project
    $sourcePath = Find-ProjectSource

    if (-not $sourcePath) {
        Write-Step "Project not found locally. Downloading from GitHub..."

        $tempPath = Join-Path $env:TEMP "pybridge-devos-download"
        Install-FromGit -targetPath $tempPath
        $sourcePath = $tempPath
    }

    # Step 3: Copy to Installation Directory
    if ($sourcePath -ne $InstallPath) {
        Copy-ProjectTo -source $sourcePath -destination $InstallPath
    }

    # Step 4: Navigate to Installation
    Set-Location $InstallPath
    Write-Success "Working directory: $InstallPath"

    # Step 5: Install Dependencies
    Write-Step "Installing dependencies (this may take a minute)..."
    & npm install --silent
    Write-Success "Dependencies installed"

    # Step 6: Build Everything
    Write-Step "Building MCP server..."
    & npm run build --silent
    Write-Success "MCP server built"

    Write-Step "Building web application..."
    & npm run build:app --silent
    Write-Success "Web application built"

    Write-Step "Building AI agent system..."
    & npm run build:agent --silent
    Write-Success "AI agent built"

    # Step 7: Check for API Key
    if (-not $env:ANTHROPIC_API_KEY -and -not $env:CLAUDE_API_KEY) {
        Write-Host ""
        Write-Warn "No AI API key detected. The system will run in template mode."
        Write-Host ""
        Write-Host "For full AI capabilities, set one of these environment variables:" -ForegroundColor Yellow
        Write-Host "  - ANTHROPIC_API_KEY" -ForegroundColor Yellow
        Write-Host "  - CLAUDE_API_KEY" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You can get an API key from: https://console.anthropic.com/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To set it for this session:" -ForegroundColor Cyan
        Write-Host '  $env:ANTHROPIC_API_KEY = "your-api-key-here"' -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Success "AI API key detected - full capabilities enabled"
    }

    # Step 8: Set State Root Environment Variable
    $env:STATE_ROOT = $InstallPath
    $env:PORT = $PORT
    $env:WS_PORT = $WS_PORT

    # Step 9: Start the System
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✨ Installation Complete!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "  📂 Installation: $InstallPath" -ForegroundColor Yellow
    Write-Host "  💾 State/Projects: $InstallPath\projects" -ForegroundColor Yellow
    Write-Host "  🌐 Web Interface: http://localhost:$PORT/agent.html" -ForegroundColor Yellow
    Write-Host "  🔌 WebSocket: ws://localhost:$WS_PORT" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Starting AI Agent System..." -ForegroundColor Cyan
    Write-Host ""

    # Open browser after a delay
    Start-Job -ScriptBlock {
        param($url)
        Start-Sleep -Seconds 4
        Start-Process $url
    } -ArgumentList "http://localhost:$PORT/agent.html" | Out-Null

    # Start the agent
    & npm run agent

} catch {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ERROR: Installation Failed" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""

    exit 1
}
