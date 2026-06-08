# compact-memory.ps1 — Compacta MEMORY.md mantendo últimas entradas
param(
    [int]$MaxEntries = 50,
    [string]$MemoryPath = "docs/obsidian/project-operating-system/MEMORY.md"
)

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$fullPath = Join-Path $root $MemoryPath

if (-not (Test-Path $fullPath)) {
    Write-Host "MEMORY.md não encontrado em $fullPath"
    exit 0
}

$content = Get-Content $fullPath -Raw -Encoding UTF8
$lines = $content -split "`n"

# Seção: Decision Log (entradas começam com ## [date] ...)
$decisionLines = @()
$inDecisions = $false
foreach ($line in $lines) {
    if ($line -match '^## \[') {
        $inDecisions = $true
        $decisionLines = @($line) + $decisionLines  # prepend para manter ordem cronológica reversa
    } elseif ($inDecisions) {
        $decisionLines += $line
    }
}

if ($decisionLines.Count -le $MaxEntries) {
    Write-Host "MEMORY já compacto ($($decisionLines.Count) entradas)."
    exit 0
}

# Manter apenas as últimas MaxEntries (mais recentes no topo)
$keep = $decisionLines[0..($MaxEntries-1)]
$resto = $lines | Where-Object { $_ -notin $decisionLines }

# Reconstruir arquivo
$newContent = @()
$newContent += $resto
$newContent += $keep
$newContent | Set-Content -Path $fullPath -Encoding UTF8

Write-Host "MEMORY compactado: mantidas $MaxEntries entradas, removidas $($decisionLines.Count - $MaxEntries)." -ForegroundColor Cyan
