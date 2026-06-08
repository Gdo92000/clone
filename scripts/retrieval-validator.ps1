# retrieval-validator.ps1 — Valida se retrieval respeita capability manifests
param()

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logPath = Join-Path $root ".opencode\retrieval.log"
$manifestsDir = Join-Path $root ".opencode\capabilities"

if (-not (Test-Path $logPath)) {
    Write-Host "No retrieval log found at $logPath" -ForegroundColor Yellow
    exit 0
}
if (-not (Test-Path $manifestsDir)) {
    Write-Error "Capabilities directory not found: $manifestsDir"
    exit 1
}

$lines = Get-Content $logPath -Encoding UTF8
$events = @()
foreach ($line in $lines) {
    try {
        $obj = $line | ConvertFrom-Json
        $events += $obj
    } catch {
        # skip malformed
    }
}

if ($events.Count -eq 0) {
    Write-Host "No valid retrieval events." -ForegroundColor Yellow
    exit 0
}

$violations = @()
$manifests = @{}

foreach ($event in $events) {
    $cap = $event.capability
    if (-not $manifests.ContainsKey($cap)) {
        $manifestPath = Join-Path $manifestsDir "$cap.manifest.json"
        if (-not (Test-Path $manifestPath)) {
            Write-Warning "Manifest not found for capability: $cap (skipping)"
            $manifests[$cap] = $null
            continue
        }
        $manifests[$cap] = Get-Content $manifestPath -Raw | ConvertFrom-Json
    }
    $manifest = $manifests[$cap]
    if (-not $manifest) { continue }

    $file = $event.file
    $allowed = $false

    # Check allowed patterns
    foreach ($pattern in $manifest.allowed_docs_patterns) {
        # Convert simple glob to regex-like; use -like for wildcard
        # -like uses wildcard (*, ?, [])
        if ($file -like $pattern) {
            $allowed = $true
            break
        }
    }

    # Also check explicit forbidden patterns
    $forbidden = $false
    foreach ($pattern in $manifest.forbidden_docs_patterns) {
        if ($file -like $pattern) {
            $forbidden = $true
            break
        }
    }

    if ($forbidden) {
        $violations += "Forbidden retrieval: capability=$cap, file=$file (matches forbidden pattern)"
    } elseif (-not $allowed) {
        $violations += "Unapproved retrieval: capability=$cap, file=$file (no allowed pattern match)"
    }
}

if ($violations.Count -gt 0) {
    Write-Host "=== Retrieval Validation FAILED ===" -ForegroundColor Red
    foreach ($v in $violations) {
        Write-Host "  [VIOLATION] $v" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "=== Retrieval Validation PASSED ===" -ForegroundColor Green
    Write-Host "All $($events.Count) retrieval events comply with capability manifests."
    exit 0
}
