<#
.SYNOPSIS
    PC Fixit production server launcher with standalone asset synchronization,
    process lifecycle tracking, health probe verification, and Cloudflare tunnel ergonomics.
.PARAMETER Port
    Application port (default: 3000)
.PARAMETER HostAddress
    Host binding address (default: 127.0.0.1)
.PARAMETER SkipTunnel
    Launch local server only without creating a Cloudflare tunnel
.PARAMETER ForceKillPort
    Automatically terminate any process occupying the target port before starting
#>
[CmdletBinding()]
param(
    [int]$Port = 3000,
    [string]$HostAddress = "127.0.0.1",
    [switch]$SkipTunnel,
    [switch]$ForceKillPort
)

$Host.UI.RawUI.WindowTitle = "PC Fixit Server"
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " PC Fixit - Production Server Launcher" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Preflight Port Conflict Check
# ------------------------------------------------------------------------------
$activeConn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($activeConn) {
    $conflictingPid = $activeConn.OwningProcess
    $procName = (Get-Process -Id $conflictingPid -ErrorAction SilentlyContinue).ProcessName
    if ($ForceKillPort) {
        Write-Host "Port $Port is occupied by PID $conflictingPid ($procName). Force killing..." -ForegroundColor Yellow
        Stop-Process -Id $conflictingPid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "ERROR: Port $Port is already in use by PID $conflictingPid ($procName)." -ForegroundColor Red
        Write-Host "Stop the existing process or run with -ForceKillPort to terminate it." -ForegroundColor Yellow
        exit 1
    }
}

# ------------------------------------------------------------------------------
# 2. Standalone Asset Synchronization
# ------------------------------------------------------------------------------
if (!(Test-Path ".next")) {
    Write-Host "ERROR: Build directory '.next' not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

$hasStandalone = Test-Path ".next\standalone\server.js"
if ($hasStandalone) {
    Write-Host "Syncing static build assets to standalone package..." -ForegroundColor Cyan
    $standaloneNextDir = ".next\standalone\.next"
    if (!(Test-Path $standaloneNextDir)) {
        New-Item -ItemType Directory -Path $standaloneNextDir -Force | Out-Null
    }

    if (Test-Path ".next\static") {
        Copy-Item -Path ".next\static" -Destination $standaloneNextDir -Recurse -Force
    }

    if (Test-Path "public") {
        Copy-Item -Path "public" -Destination ".next\standalone" -Recurse -Force
    }
    Write-Host "[OK] Standalone assets synchronized." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 3. Process Management & Launch
# ------------------------------------------------------------------------------
$env:PORT = "$Port"
$env:HOSTNAME = "$HostAddress"

$serverProcess = $null
$tunnelProcess = $null

try {
    if ($hasStandalone) {
        Write-Host "Starting standalone Node.js production server on http://${HostAddress}:${Port}..." -ForegroundColor Green
        $nodeExe = (Get-Command node).Source
        $serverScript = (Resolve-Path ".next\standalone\server.js").Path
        $serverProcess = Start-Process -FilePath $nodeExe -ArgumentList "`"$serverScript`"" -PassThru
    } else {
        Write-Host "Starting Next.js production server via npx on http://${HostAddress}:${Port}..." -ForegroundColor Green
        $serverProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "next start -p $Port -H $HostAddress" -PassThru
    }

    # --------------------------------------------------------------------------
    # 4. Readiness Health Probe (Polling /api/health)
    # --------------------------------------------------------------------------
    Write-Host "Probing server health at http://${HostAddress}:${Port}/api/health..." -ForegroundColor Yellow
    $maxAttempts = 30
    $isHealthy = $false

    for ($i = 1; $i -le $maxAttempts; $i++) {
        Start-Sleep -Milliseconds 500

        if ($serverProcess.HasExited) {
            Write-Host "ERROR: Server process exited prematurely with exit code $($serverProcess.ExitCode)." -ForegroundColor Red
            exit 1
        }

        try {
            $health = Invoke-RestMethod -Uri "http://${HostAddress}:${Port}/api/health" -Method Get -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($health -and ($health.status -eq "ok" -or $health.status -eq "degraded")) {
                $isHealthy = $true
                $dbStatus = if ($health.services.database) { $health.services.database.status } else { "unknown" }
                Write-Host "[OK] Server is ready! (Status: $($health.status), Database: $dbStatus)" -ForegroundColor Green
                break
            }
        } catch {
            # Continue polling until max attempts
        }
    }

    if (!$isHealthy) {
        Write-Host "WARNING: Server readiness probe timed out after 15 seconds. Proceeding..." -ForegroundColor Yellow
    }

    # --------------------------------------------------------------------------
    # 5. Cloudflare Tunnel Ergonomics
    # --------------------------------------------------------------------------
    if ($SkipTunnel) {
        Write-Host "Tunnel skipped (-SkipTunnel). Server is active at http://${HostAddress}:${Port}" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Cyan
        Wait-Process -Id $serverProcess.Id
    } else {
        $cloudflaredCmd = $null
        if (Test-Path "bin\cloudflared.exe") {
            $cloudflaredCmd = (Resolve-Path "bin\cloudflared.exe").Path
        } else {
            $systemCmd = Get-Command cloudflared -ErrorAction SilentlyContinue
            if ($systemCmd) {
                $cloudflaredCmd = $systemCmd.Source
            }
        }

        if ($cloudflaredCmd) {
            Write-Host "==========================================" -ForegroundColor Cyan
            Write-Host " Starting Cloudflare Public Tunnel" -ForegroundColor Cyan
            Write-Host " Tunnel Target: http://${HostAddress}:${Port}" -ForegroundColor Cyan
            Write-Host " Press Ctrl+C at any time to cleanly stop server and tunnel" -ForegroundColor Yellow
            Write-Host "==========================================" -ForegroundColor Cyan

            & $cloudflaredCmd tunnel --url "http://${HostAddress}:${Port}"
        } else {
            Write-Host "Notice: cloudflared binary not found in bin\ or system PATH." -ForegroundColor Yellow
            Write-Host "Server running locally at http://${HostAddress}:${Port}" -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Cyan
            Wait-Process -Id $serverProcess.Id
        }
    }
} finally {
    Write-Host "`nShutting down PC Fixit processes..." -ForegroundColor Yellow
    if ($serverProcess -and !$serverProcess.HasExited) {
        Write-Host "Stopping server process (PID: $($serverProcess.Id))..." -ForegroundColor DarkGray
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($tunnelProcess -and !$tunnelProcess.HasExited) {
        Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[OK] Clean shutdown complete." -ForegroundColor Green
}
