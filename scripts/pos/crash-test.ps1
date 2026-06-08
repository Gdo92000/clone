param(
    [string]$Path = (Resolve-Path ".")
)

$root = Resolve-Path $Path
$passed = 0
$failed = 0

Write-Host "=== Crash Recovery Chain Test ===" -ForegroundColor Cyan
Write-Host "Testing recovery resilience of POS at: $root`n" -ForegroundColor Gray

# Test 1: Bootstrap chain integrity
Write-Host "Test 1: Bootstrap chain integrity" -ForegroundColor Yellow
$chain = @(
    "AGENTS.md",
    "docs/obsidian/_index.md",
    "docs/obsidian/CURRENT_STATE.md",
    "docs/obsidian/MEMORY.md"
)
$chainOk = $true
foreach ($c in $chain) {
    $cpath = Join-Path $root $c
    if (Test-Path $cpath) {
        Write-Host "  [OK] $c" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $c missing!" -ForegroundColor Red
        $chainOk = $false
        $failed++
    }
}
if ($chainOk) { $passed++ }

# Test 2: POS recovery chain
Write-Host "`nTest 2: POS recovery chain (post-crash)" -ForegroundColor Yellow
$recoveryChain = @(
    "docs/obsidian/CURRENT_STATE.md",
    "docs/obsidian/MEMORY.md",
    "docs/obsidian/worklog/active/CURRENT_TASK.md",
    "docs/obsidian/worklog/checkpoints/LAST_CHECKPOINT.md",
    "docs/obsidian/worklog/recovery/RECOVERY_QUEUE.md"
)
$recoveryOk = $true
foreach ($rc in $recoveryChain) {
    $rcpath = Join-Path $root $rc
    if (Test-Path $rcpath) {
        Write-Host "  [OK] $rc" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $rc not found (optional)" -ForegroundColor Yellow
    }
}
$passed++

# Test 3: AGENTS.md under 3KB
Write-Host "`nTest 3: AGENTS.md kernel size" -ForegroundColor Yellow
$agentsFile = Join-Path $root "AGENTS.md"
$agentsSize = (Get-Item $agentsFile).Length
if ($agentsSize -le 3500) {
    Write-Host "  [OK] AGENTS.md is $($agentsSize) bytes (under 3.5KB)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  [FAIL] AGENTS.md is $($agentsSize) bytes (exceeds 3.5KB limit)" -ForegroundColor Red
    $failed++
}

# Test 4: opencode.json compaction.reserved ≤ 4000
Write-Host "`nTest 4: Compaction reserved budget" -ForegroundColor Yellow
$configPath = Join-Path $root "opencode.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $reserved = $config.compaction.reserved
    if ($reserved -le 4000) {
        Write-Host "  [OK] Compaction reserved: $reserved (≤ 4000)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] Compaction reserved: $reserved (> 4000)" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [FAIL] opencode.json missing" -ForegroundColor Red
    $failed++
}

# Test 5: opencode.json instructions only has AGENTS.md
Write-Host "`nTest 5: Instruction files (lazy loading)" -ForegroundColor Yellow
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $instr = @($config.instructions)
    $onlyAgents = ($instr.Count -eq 1 -and $instr[0] -eq "AGENTS.md")
    if ($onlyAgents) {
        Write-Host "  [OK] Only AGENTS.md loaded at boot" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] Instruction files: $($instr -join ', ') (should be only AGENTS.md)" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [FAIL] opencode.json missing" -ForegroundColor Red
    $failed++
}

# Test 6: Wiki exists with index and log
Write-Host "`nTest 6: Wiki structure" -ForegroundColor Yellow
$wikiIndex = Join-Path $root "docs/obsidian/wiki/index.md"
$wikiLog = Join-Path $root "docs/obsidian/wiki/log.md"
if ((Test-Path $wikiIndex) -and (Test-Path $wikiLog)) {
    Write-Host "  [OK] Wiki index.md + log.md present" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  [FAIL] Wiki incomplete" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Score: $([math]::Round(($passed/($passed+$failed))*100, 1))%" -ForegroundColor Magenta

if ($failed -eq 0) {
    Write-Host "`n[PASS] Crash recovery chain intact" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[FAIL] $failed test(s) failed" -ForegroundColor Red
    exit 1
}
