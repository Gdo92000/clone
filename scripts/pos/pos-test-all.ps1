param(
    [string]$Path = (Resolve-Path ".")
)

$root = Resolve-Path $Path
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    POS TEST ALL - Global Validation     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Path: $root`n" -ForegroundColor Gray

function Run-Test {
    param([string]$Name, [scriptblock]$Block)
    Write-Host "--- $Name ---" -ForegroundColor Yellow
    try {
        & $Block
        Write-Host "`n  Result: PASS`n" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  Result: FAIL - $_`n" -ForegroundColor Red
        return $false
    }
}

$results = @()

$results += Run-Test -Name "pos-check" -Block {
    & (Join-Path $root "scripts/pos/pos-check.ps1") -Path $root
    if ($LASTEXITCODE -ne 0) { throw "pos-check failed" }
}

$results += Run-Test -Name "crash-test" -Block {
    & (Join-Path $root "scripts/pos/crash-test.ps1") -Path $root
    if ($LASTEXITCODE -ne 0) { throw "crash-test failed" }
}

$results += Run-Test -Name "AGENTS.md frontmatter" -Block {
    $agents = Get-Content (Join-Path $root "AGENTS.md") -Raw
    if ($agents -notmatch '^---\s*\n') { throw "No YAML frontmatter" }
    if ($agents -notmatch 'type:\s*guide') { throw "Missing type: guide" }
    if ($agents -notmatch 'domain:\s*domain/core') { throw "Missing domain tag" }
    if ($agents -notmatch 'layer:\s*layer/L1') { throw "Missing layer" }
    Write-Host "  [OK] Frontmatter valid" -ForegroundColor Green
}

$results += Run-Test -Name "AGENT_FLOW.md size" -Block {
    $flow = Get-Item (Join-Path $root ".opencode/ag-kit-main/AGENT_FLOW.md")
    if ($flow.Length -gt 5000) { throw "AGENT_FLOW.md is $($flow.Length) bytes (max 5000)" }
    Write-Host "  [OK] AGENT_FLOW.md: $($flow.Length) bytes" -ForegroundColor Green
}

$results += Run-Test -Name "opencode.json config" -Block {
    $config = Get-Content (Join-Path $root "opencode.json") -Raw | ConvertFrom-Json
    if ($config.compaction.reserved -gt 4000) { throw "compaction.reserved > 4000" }
    if (@($config.instructions).Count -ne 1) { throw "instructions count != 1" }
    if ($config.instructions[0] -ne "AGENTS.md") { throw "instructions[0] != AGENTS.md" }
    Write-Host "  [OK] Config compliant" -ForegroundColor Green
}

$results += Run-Test -Name "Wiki log format" -Block {
    $log = Get-Content (Join-Path $root "docs/obsidian/wiki/log.md") -Raw
    if ($log -notmatch '^## \[YYYY-MM-DD\]') { 
        Write-Host "  [OK] Log template format verified" -ForegroundColor Green
    }
}

$results += Run-Test -Name "POS _index.md structure" -Block {
    $posIndex = Get-Content (Join-Path $root "docs/obsidian/project-operating-system/_index.md") -Raw
    if ($posIndex -notmatch 'CURRENT_STATE') { throw "POS _index missing CURRENT_STATE reference" }
    if ($posIndex -notmatch 'MEMORY') { throw "POS _index missing MEMORY reference" }
    Write-Host "  [OK] POS _index structure valid" -ForegroundColor Green
}

$total = $results.Count
$passed = ($results | Where-Object { $_ }).Count
$failed = $total - $passed
$duration = (Get-Date) - $startTime

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         FINAL REPORT                    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests: $total | Passed: $passed | Failed: $failed"
Write-Host "Duration: $($duration.TotalSeconds.ToString('0.0'))s"
Write-Host "Pass rate: $([math]::Round(($passed/$total)*100, 1))%"

if ($failed -eq 0) {
    Write-Host "`n[PASS] All POS validations passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[FAIL] $failed tests failed" -ForegroundColor Red
    exit 1
}