param(
    [string]$Path = (Resolve-Path "."),
    [int]$IntervalMs = 2000
)

$root = Resolve-Path $Path
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $root
$watcher.Filter = "*"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::DirectoryName

$posCheck = Join-Path $root "scripts/pos/pos-check.ps1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  POS WATCH - Sentinel em execução       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Monitorando: AGENTS.md, opencode.json, docs/"
Write-Host "Intervalo: ${IntervalMs}ms`n" -ForegroundColor Gray

$lastEvent = [DateTime]::MinValue
$changeDebounce = [TimeSpan]::FromMilliseconds($IntervalMs)

while ($true) {
    $result = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::All, 1000)
    if (-not $result.TimedOut) {
        $relPath = [System.IO.Path]::GetRelativePath($root, $result.FullPath)
        $isTarget = ($relPath -eq "AGENTS.md") -or
                     ($relPath -eq "opencode.json") -or
                     $relPath.StartsWith("docs/")

        if ($isTarget) {
            $now = Get-Date
            if (($now - $lastEvent) -gt $changeDebounce) {
                $lastEvent = $now
                $timestamp = $now.ToString("HH:mm:ss")
                Write-Host "[$timestamp] Alteração detectada: $relPath ($($result.ChangeType))" -ForegroundColor Yellow
                Write-Host "  Executando pos-check.ps1..." -ForegroundColor Gray

                & $posCheck -Path $root
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [PASS] POS integridade OK" -ForegroundColor Green
                } else {
                    Write-Host "  [FAIL] POS integridade VIOLADA" -ForegroundColor Red
                }
                Write-Host ""
            }
        }
    }
}
