#!/usr/bin/env powershell
# pre-push hook — run full POS test suite
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tests = Join-Path $root 'scripts\pos-test-all.ps1'
if (-not (Test-Path $tests)) {
    Write-Host "POS test suite not found at $tests" -ForegroundColor Yellow
    exit 0
}
Write-Host "Running pre-push validation..." -ForegroundColor Cyan
& powershell -NoProfile -ExecutionPolicy Bypass -File $tests
$exit = $LASTEXITCODE
if ($exit -ne 0) {
    Write-Host "Pre-push hook failed: POS tests did not pass." -ForegroundColor Red
    exit 1
}
Write-Host "Pre-push validation passed." -ForegroundColor Green
exit 0
