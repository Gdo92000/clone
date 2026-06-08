# cognitive-gc.ps1 — Garbage Collection cognitivo
param(
    [switch]$Full,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$wikiPath = Join-Path $root "docs/obsidian/wiki"
$posPath = Join-Path $root "docs/obsidian/project-operating-system"

Write-Host "=== Cognitive Garbage Collection ==="
if ($DryRun) { Write-Host "(DRY RUN)" -ForegroundColor Yellow }

# 1. Truncate wiki/log.md a últimas 200 entradas
$logPath = Join-Path $wikiPath "log.md"
if (Test-Path $logPath) {
    $lines = Get-Content $logPath -Encoding UTF8
    $keep = $lines | Select-Object -First 200
    if ($lines.Count -gt 200) {
        if (-not $DryRun) {
            $keep | Set-Content $logPath -Encoding UTF8
            Write-Host "Truncated wiki/log.md to 200 entries (removed $($lines.Count-200))."
        } else {
            Write-Host "Would truncate wiki/log.md from $($lines.Count) to 200 entries."
        }
    } else {
        Write-Host "wiki/log.md já está dentro do limite."
    }
}

# 1b. Truncate .opencode/retrieval.log to last 10000 entries
$retrievalLog = Join-Path $root ".opencode/retrieval.log"
if (Test-Path $retrievalLog) {
    $lines = Get-Content $retrievalLog -Encoding UTF8
    if ($lines.Count -gt 10000) {
        if (-not $DryRun) {
            $lines[-10000..-1] | Set-Content $retrievalLog -Encoding UTF8
            Write-Host "Truncated retrieval.log to 10000 entries (removed $($lines.Count-10000))."
        } else {
            Write-Host "Would truncate retrieval.log from $($lines.Count) to 10000 entries."
        }
    } else {
        Write-Host "retrieval.log já está dentro do limite."
    }
}

# 2. Delete old evals (older than 7 days)
$evalsPath = Join-Path $posPath "00-SYSTEM/evals/workspace"
if (Test-Path $evalsPath) {
    $old = Get-ChildItem -Path $evalsPath -Recurse -Directory | Where-Object {
        $_.CreationTime -lt (Get-Date).AddDays(-7)
    }
    if ($old.Count -gt 0) {
        if (-not $DryRun) {
            foreach ($d in $old) { Remove-Item -Recurse -Force $d.FullName }
            Write-Host "Removed $($old.Count) old eval workspaces."
        } else {
            Write-Host "Would remove $($old.Count) old eval workspaces:"
            $old | ForEach-Object { Write-Host "  $($_.FullName)" }
        }
    } else {
        Write-Host "Nenhum eval antigo para remover."
    }
}

# 3. Find orphaned files (docs without inbound links)
# TODO: implement link graph scan

# 4. Archive deprecated files (status: deprecated)
# Find files with `status: deprecated` and move to archive/YYYY-MM-DD/
$allMds = Get-ChildItem -Path $posPath, $wikiPath -Recurse -Filter *.md
$deprecated = @()
foreach ($f in $allMds) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match '^status:\s*deprecated') {
        $deprecated += $f
    }
}
if ($deprecated.Count -gt 0) {
    $date = Get-Date -Format "yyyy-MM-dd"
    $archiveRoot = Join-Path $root "docs/obsidian/archive/$date"
    foreach ($f in $deprecated) {
        $rel = $f.FullName.Replace($root + '\','')
        $dest = Join-Path $archiveRoot $rel
        $destDir = Split-Path $dest -Parent
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Move-Item -Path $f.FullName -Destination $dest -Force
            Write-Host "Arquivado: $rel -> archive/$date/$rel"
        } else {
            Write-Host "Would archive: $rel -> archive/$date/$rel"
        }
    }
} else {
    Write-Host "Nenhum arquivo deprecated encontrado."
}

# Full mode: additional checks
if ($Full) {
    Write-Host "Full GC mode: additional checks..."
    # e.g., check for broken links, duplicate content, stale skills
}

Write-Host "Cognitive GC complete." -ForegroundColor Green
