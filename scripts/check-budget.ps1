# check-budget.ps1 — Verifica se o orçamento de tokens permite operação
param(
    [Parameter(Mandatory=$true)]
    [int]$CurrentTokens,

    [Parameter(Mandatory=$true)]
    [int]$AdditionalTokens
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$capability = $env:TASK_CAPABILITY
if (-not $capability) {
    Write-Error "TASK_CAPABILITY environment variable not set."
    exit 1
}

$manifestPath = Join-Path $root ".opencode/capabilities/$capability.manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "Manifest not found for capability: $capability"
    exit 1
}
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

$maxWorking = $manifest.max_working_tokens
if (-not $maxWorking) {
    # Default fallback
    $maxWorking = 8000
}

$proposed = $CurrentTokens + $AdditionalTokens
if ($proposed -gt $maxWorking) {
    Write-Host "Budget exceeded: $CurrentTokens + $AdditionalTokens = $proposed > limit $maxWorking" -ForegroundColor Red
    # Provide suggestion for compaction or emergency override
    Write-Host "Recommend: compact context, drop less relevant files, or request emergency expansion if critical." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "Budget OK: $proposed / $maxWorking tokens" -ForegroundColor Green
    exit 0
}
