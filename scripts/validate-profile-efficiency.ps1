# validate-profile-efficiency.ps1 — Valida efficiency dos perfis
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$profilePath = Join-Path $root ".opencode\profile.json"

if (-not (Test-Path $profilePath)) {
    Write-Error "profile.json não encontrado em $profilePath"
    exit 1
}

$profile = Get-Content $profilePath -Raw -Encoding UTF8 | ConvertFrom-Json

# Token limits — lidos do profile.json (single source of truth)
$profileLimits = @{}
foreach ($pname in $profile.profiles.PSObject.Properties.Name) {
    $p = $profile.profiles.$pname
    if ($p.max_init_tokens) {
        $profileLimits[$pname] = $p.max_init_tokens
    }
}
$limits = $profileLimits

function Get-FileTokens($path) {
    $full = Join-Path $root $path
    if (Test-Path $full) {
        $chars = (Get-Content $full -Raw).Length
        return [math]::Ceiling($chars / 4)
    }
    return 0
}

Write-Host "=== Profile Efficiency Validation ==="
$overallOk = $true

foreach ($pname in $profile.profiles.PSObject.Properties.Name) {
    $p = $profile.profiles.$pname
    if (-not $p.bootstrap) { continue }
    $total = 0
    Write-Host "Profile: $pname"
    foreach ($step in $p.bootstrap) {
        $tokens = Get-FileTokens $step
        $total += $tokens
        Write-Host "  $step : ~$tokens tokens"
    }
    $limit = $limits[$pname]
    if (-not $limit) { $limit = 5000 }
    if ($total -gt $limit) {
        Write-Host "  [FAIL] Total ~$total tokens exceeds limit $limit" -ForegroundColor Red
        $overallOk = $false
    } else {
        Write-Host "  [OK] Total ~$total tokens within limit $limit" -ForegroundColor Green
    }
}

if ($overallOk) {
    Write-Host "All profiles are efficient."
    exit 0
} else {
    Write-Host "Some profiles exceed token limits. Refine bootstrap arrays." -ForegroundColor Red
    exit 1
}
