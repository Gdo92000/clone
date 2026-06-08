# retrieval-telemetry.ps1 — Coleta métricas de retrieval cognitivo
param()

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logPath = Join-Path $root ".opencode\retrieval.log"

if (-not (Test-Path $logPath)) {
    Write-Host "No retrieval log found at $logPath" -ForegroundColor Yellow
    exit 0
}

$lines = Get-Content $logPath -Encoding UTF8
$events = @()
foreach ($line in $lines) {
    try {
        $obj = $line | ConvertFrom-Json
        $events += $obj
    } catch {
        # skip malformed lines
    }
}

if ($events.Count -eq 0) {
    Write-Host "No valid retrieval events." -ForegroundColor Yellow
    exit 0
}

Write-Host "=== Retrieval Telemetry ==="
Write-Host "Total events: $($events.Count)"

# Stats by capability
$byCap = $events | Group-Object capability
foreach ($group in $byCap) {
    $cap = $group.Name
    $count = $group.Count
    $tokens = ($group.Group | Measure-Object tokens -Sum).Sum
    $avg = [math]::Round($tokens / $count, 1)
    $uniqueFiles = ($group.Group.file | Sort-Object -Unique).Count
    $duplicatePct = [math]::Round((1 - $uniqueFiles / $count) * 100, 1)
    Write-Host "`nCapability: $cap"
    Write-Host "  Retrievals: $count"
    Write-Host "  Total tokens: $tokens"
    Write-Host "  Avg per retrieval: $avg"
    Write-Host "  Unique files: $uniqueFiles"
    Write-Host "  Duplicate %: $duplicatePct%"
}

# Overall unused retrieval estimation (if task includes many files not re-referenced)
# We cannot accurately determine without task context; placeholder.

Write-Host "`n=== Summary ==="
$totalTokens = ($events | Measure-Object tokens -Sum).Sum
Write-Host "All tasks total tokens: $totalTokens"

# Exit 0 always (telemetry only)
