# pos-check.ps1 — POS Integrity Check
# Usage: .\scripts\pos-check.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$pos = Join-Path $root "docs\obsidian\project-operating-system"
$wiki = Join-Path $root "docs\obsidian\wiki"
$err = 0
$warn = 0
$pass = 0

function Check($path) {
    if (Test-Path $path) { $script:pass++; Write-Host "  [OK] $path" }
    else { $script:err++; Write-Host "  [FAIL] $path - NOT FOUND" }
}

function Fm($file, $field) {
    $lines = Get-Content $file -TotalCount 15 -ErrorAction SilentlyContinue
    $ok = $false
    foreach ($l in $lines) { if ($l -match "^${field}:") { $ok = $true; break } }
    if (-not $ok) { $script:warn++; Write-Host "  [WARN] $(Split-Path -Leaf $file): missing '$field'" }
}

function Broken($file) {
    $dir = Split-Path -Parent $file
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    $rx = [regex]::new('\]\(\.\/[^)]+\)')
    foreach ($m in $rx.Matches($content)) {
        $link = $m.Value.Substring(3, $m.Value.Length - 4)
        $target = Join-Path $dir $link
        if (-not (Test-Path $target -ErrorAction SilentlyContinue)) {
            $script:err++; Write-Host "  [FAIL] broken link in $(Split-Path -Leaf $file): $link"
        }
    }
}

Write-Host "=== POS Integrity Check ==="
Write-Host ""
Write-Host "--- Core Files ---"
Check (Join-Path $root "AGENTS.md")
Check (Join-Path $pos "_index.md")
Check (Join-Path $pos "CURRENT_STATE.md")
Check (Join-Path $pos "MEMORY.md")
Check (Join-Path $pos "00-SYSTEM\SYSTEM_CONTRACT.md")
Check (Join-Path $pos "00-SYSTEM\CONTEXT_BUDGET_GOVERNANCE.md")
Check (Join-Path $pos "00-SYSTEM\EVENT_STREAM.md")
Check (Join-Path $pos "00-SYSTEM\_index.md")
Check (Join-Path $root ".opencode\profile.json")
Write-Host ""

Write-Host "--- Frontmatter ---"
$files = @((Join-Path $pos "_index.md"),(Join-Path $pos "CURRENT_STATE.md"),(Join-Path $pos "MEMORY.md"),
           (Join-Path $pos "00-SYSTEM\SYSTEM_CONTRACT.md"),(Join-Path $pos "00-SYSTEM\CONTEXT_BUDGET_GOVERNANCE.md"),
           (Join-Path $pos "00-SYSTEM\EVENT_STREAM.md"))
foreach ($f in $files) { Fm $f "type"; Fm $f "status"; Fm $f "domain" }
Write-Host ""

Write-Host "--- Broken Links ---"
Get-ChildItem $pos -Recurse -Filter "*.md" | Where-Object { $_.FullName -notmatch "99-TEMPLATES" } | ForEach-Object { Broken $_.FullName }
Write-Host ""

Write-Host "--- State Health ---"
$cs = Get-Content (Join-Path $pos "CURRENT_STATE.md") -Raw
if ($cs -match "Project Initialized") { Write-Host "  [INFO] CURRENT_STATE: template (ok for new projects)" }
else { Write-Host "  [OK] CURRENT_STATE: customized" }
$mem = Get-Content (Join-Path $pos "MEMORY.md") -Raw
if ($mem -match "Operational Memory") { Write-Host "  [INFO] MEMORY: template (ok for new projects)" }
else { Write-Host "  [OK] MEMORY: customized" }
Write-Host ""

Write-Host "--- Wiki Health ---"
if (Test-Path $wiki) {
    Write-Host "  [OK] wiki/ exists"
    foreach ($s in @("index.md","log.md","sources","patterns","decisions","operations")) {
        $p = Join-Path $wiki $s; if (Test-Path $p) { Write-Host "  [OK] wiki/$s" }
    }
} else { Write-Host "  [INFO] No wiki/ (optional)" }
Write-Host ""

Write-Host "=== Summary ==="
Write-Host "  Pass: $pass | Warnings: $warn | Errors: $err"
if ($err -gt 0) { Write-Host "  Status: FAIL"; exit 2 }
elseif ($warn -gt 0) { Write-Host "  Status: WARNINGS"; exit 1 }
else { Write-Host "  Status: OK"; exit 0 }
