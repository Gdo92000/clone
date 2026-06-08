param(
    [string]$Path = (Resolve-Path ".")
)

$root = Resolve-Path $Path
$errors = @()
$warnings = @()

Write-Host "=== POS Integrity Check ===" -ForegroundColor Cyan
Write-Host "Scanning: $root`n" -ForegroundColor Gray

# 1. Check AGENTS.md exists at root
$agents = Join-Path $root "AGENTS.md"
if (Test-Path $agents) {
    Write-Host "  [OK] AGENTS.md found" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] AGENTS.md missing from project root!" -ForegroundColor Red
    $errors += "AGENTS.md missing from project root"
}

# 2. Verify POS structure
$posDir = Join-Path $root "docs\obsidian\project-operating-system"
$posIndex = Join-Path $posDir "_index.md"
if (Test-Path $posIndex) {
    Write-Host "  [OK] POS _index.md found" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] POS _index.md missing!" -ForegroundColor Red
    $errors += "POS _index.md missing"
}

# 3. Check CURRENT_STATE.md exists (both root obsidian and POS)
$csRoot = Join-Path $root "docs\obsidian\CURRENT_STATE.md"
$csPos = Join-Path $posDir "CURRENT_STATE.md"
if ((Test-Path $csRoot) -and (Test-Path $csPos)) {
    Write-Host "  [OK] CURRENT_STATE.md found in both obsidian/ and POS" -ForegroundColor Green
} else {
    Write-Host "  [WARN] One or more CURRENT_STATE.md missing" -ForegroundColor Yellow
    $warnings += "CURRENT_STATE.md missing"
}

# 4. Check MEMORY.md exists
$memRoot = Join-Path $root "docs\obsidian\MEMORY.md"
$memPos = Join-Path $posDir "MEMORY.md"
if ((Test-Path $memRoot) -and (Test-Path $memPos)) {
    Write-Host "  [OK] MEMORY.md found in both obsidian/ and POS" -ForegroundColor Green
} else {
    Write-Host "  [WARN] One or more MEMORY.md missing" -ForegroundColor Yellow
    $warnings += "MEMORY.md missing"
}

# 5. Verify wiki structure
$wikiIndex = Join-Path $root "docs\obsidian\wiki\index.md"
$wikiLog = Join-Path $root "docs\obsidian\wiki\log.md"
$wikiPatterns = Join-Path $root "docs\obsidian\wiki\patterns"
$wikiDecisions = Join-Path $root "docs\obsidian\wiki\decisions"
$wikiSources = Join-Path $root "docs\obsidian\wiki\sources"

if ((Test-Path $wikiIndex) -and (Test-Path $wikiLog)) {
    Write-Host "  [OK] Wiki index.md + log.md found" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Wiki core files missing!" -ForegroundColor Red
    $errors += "Wiki core files missing"
}
if (Test-Path $wikiPatterns) { Write-Host "  [OK] wiki/patterns/ exists" -ForegroundColor Green }
if (Test-Path $wikiDecisions) { Write-Host "  [OK] wiki/decisions/ exists" -ForegroundColor Green }
if (Test-Path $wikiSources) { Write-Host "  [OK] wiki/sources/ exists" -ForegroundColor Green }

# 6. Verify YAML frontmatter in markdown files
$mdFiles = Get-ChildItem -Path (Join-Path $root "docs") -Recurse -Filter "*.md" -File
$badFrontmatter = 0
foreach ($f in $mdFiles) {
    $content = Get-Content -Path $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    if ($content -match '^---\s*\n') {
        $end = $content.IndexOf('---', 3)
        if ($end -lt 0) {
            Write-Host "  [FAIL] Unclosed YAML frontmatter: $($f.Name)" -ForegroundColor Red
            $badFrontmatter++
            $errors += "Unclosed YAML frontmatter in $($f.Name)"
        }
    }
}

if ($badFrontmatter -eq 0) {
    Write-Host "  [OK] All $($mdFiles.Count) markdown files have valid frontmatter" -ForegroundColor Green
}

# 7. Check opencode.json config
$opencodeJson = Join-Path $root "opencode.json"
if (Test-Path $opencodeJson) {
    $config = Get-Content $opencodeJson -Raw | ConvertFrom-Json
    $instrCount = @($config.instructions).Count
    if ($instrCount -le 2) {
        Write-Host "  [OK] opencode.json: $instrCount instruction file(s)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] opencode.json: $instrCount instruction files (should be lean)" -ForegroundColor Yellow
        $warnings += "opencode.json has $instrCount instruction files"
    }
    if ($config.compaction.reserved -le 5000) {
        Write-Host "  [OK] Compaction reserved: $($config.compaction.reserved) tokens" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Compaction reserved: $($config.compaction.reserved) (recommend ≤5000)" -ForegroundColor Yellow
        $warnings += "Compaction reserved too high"
    }
}

# 8. Verify recovery chain files
$recoveryFiles = @(
    "docs\obsidian\worklog\active\CURRENT_TASK.md",
    "docs\obsidian\worklog\checkpoints\LAST_CHECKPOINT.md",
    "docs\obsidian\worklog\recovery\RECOVERY_QUEUE.md"
)
$missingRecovery = 0
foreach ($rf in $recoveryFiles) {
    $rpath = Join-Path $root $rf
    if (-not (Test-Path $rpath)) {
        Write-Host "  [WARN] Recovery file missing: $rf" -ForegroundColor Yellow
        $missingRecovery++
        $warnings += "Recovery file missing: $rf"
    }
}
if ($missingRecovery -eq 0) {
    Write-Host "  [OK] All recovery chain files present" -ForegroundColor Green
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "Errors: $($errors.Count) (PASS)" -ForegroundColor Green
} else {
    Write-Host "Errors: $($errors.Count) (FAIL)" -ForegroundColor Red
    foreach ($e in $errors) { Write-Host "  - $e" -ForegroundColor Red }
}
Write-Host "Warnings: $($warnings.Count)" -ForegroundColor Yellow
foreach ($w in $warnings) { Write-Host "  - $w" -ForegroundColor Yellow }

if ($errors.Count -eq 0) { exit 0 } else { exit 1 }
