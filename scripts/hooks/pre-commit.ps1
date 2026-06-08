#!/usr/bin/env powershell
# pre-commit hook — validate kernel integrity
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$validator = Join-Path $root 'scripts\validate-kernel.ps1'
if (-not (Test-Path $validator)) {
    Write-Host "Kernel validator not found at $validator" -ForegroundColor Yellow
    exit 0
}
& powershell -NoProfile -ExecutionPolicy Bypass -File $validator
$exit = $LASTEXITCODE
if ($exit -ne 0) {
    Write-Host "Pre-commit hook failed: kernel integrity violation or missing registry." -ForegroundColor Red
    Write-Host "Fix the issue or use an override if intentional." -ForegroundColor Yellow
    exit 1
}
exit 0
