# crash-test.ps1 — Simula crash/recovery e valida fluxo de retomada
# Usage: .\scripts\crash-test.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$pos = Join-Path $root "docs\obsidian\project-operating-system"
$stateFile = Join-Path $pos "CURRENT_STATE.md"
$memFile = Join-Path $pos "MEMORY.md"
$agentsFile = Join-Path $root "AGENTS.md"
$indexFile = Join-Path $pos "_index.md"
$profileFile = Join-Path $root ".opencode\profile.json"
$err = 0
$pass = 0

function Ok { $script:pass++; Write-Host "  [OK] $($args -join ' ')" }
function Fail { $script:err++; Write-Host "  [FAIL] $($args -join ' ')" }

Write-Host "=== POS Crash Recovery Test ==="
Write-Host ""

# --- Phase 1: Backup + write mid-work state ---
Write-Host "--- Phase 1: Simulating mid-work state ---"

$backupState = Get-Content $stateFile -Raw -Encoding UTF8
$backupMem = Get-Content $memFile -Raw -Encoding UTF8

$midworkLines = @(
"---",
"type: state",
"status: active",
"domain: core",
"aliases:",
"  - Current State",
"created_at: 2026-05-27",
"updated_at: 2026-05-27",
"---",
"",
"# CURRENT STATE",
"",
"## Phase: Building admin frontend",
"",
"**Started**: 2026-05-27 14:30",
"**Last update**: 2026-05-27 14:45",
"",
"## Progress",
"",
"| Task | Status | % |",
"|------|--------|---|",
"| Login page | Done | 100 |",
"| Dashboard layout | In progress | 60 |",
"| User table component | Pending | 0 |",
"| Settings page | Pending | 0 |",
"",
"## Next step",
"",
"Finalizar DashboardLayout (src/components/admin/DashboardLayout.tsx):",
"- Sidebar com navegacao (Links prontos)",
"- Header com user avatar (Componente criado, falta integrar)",
"- Main content slot (OK)",
"",
"## Decisions",
"",
"- DashboardLayout usa CSS Grid (nao Flexbox) para responsividade consistente",
"- Sidebar collapsible em mobile via media query",
"",
"## Blockers",
"",
"- Nenhum"
)
$midwork = $midworkLines -join "`r`n"

$midworkMemLines = @(
"---",
"type: memory",
"status: active",
"domain: core",
"aliases:",
"  - Memory",
"created_at: 2026-05-27",
"updated_at: 2026-05-27",
"---",
"",
"# OPERATIONAL MEMORY",
"",
"## Architecture Decisions",
"",
"- CSS Grid para layouts principais",
"- Componentes em src/components/admin/",
"- Tipagem compartilhada em src/types/admin.ts",
"",
"## Known Pitfalls",
"",
"- overflow: hidden no body quebra sidebar collapsible - usar overflow: clip"
)
$midworkMem = $midworkMemLines -join "`r`n"

Set-Content -Path $stateFile -Value $midwork -Encoding UTF8
Set-Content -Path $memFile -Value $midworkMem -Encoding UTF8
Start-Sleep -Milliseconds 100
Ok "Mid-work state written to CURRENT_STATE.md"
Ok "Mid-work memory written to MEMORY.md"

# --- Phase 2: Simulate crash ---
Write-Host ""
Write-Host "--- Phase 2: Simulating CRASH / power loss ---"
Write-Host "  [CONTEXT LOST] New session starts cold"
Write-Host "  Loading bootstrap..."
Write-Host ""

# --- Phase 3: Recovery chain validation ---
Write-Host "--- Phase 3: Recovery chain validation ---"

if (Test-Path $agentsFile) { Ok "AGENTS.md found - kernel loaded" }
else { Fail "AGENTS.md missing - bootstrap fails" }

$bootstrapLinks = @(
    @("docs/obsidian/project-operating-system/_index.md", "_index.md (POS router)"),
    @(".opencode/profile.json", "profile.json (profile config)"),
    @("docs/obsidian/project-operating-system/CURRENT_STATE.md", "CURRENT_STATE.md (session state)"),
    @("docs/obsidian/project-operating-system/MEMORY.md", "MEMORY.md (operational memory)")
)
foreach ($link in $bootstrapLinks) {
    $path = Join-Path $root $link[0]
    if (Test-Path $path) { Ok "$($link[1]) found" }
    else { Fail "$($link[1]) missing - chain broken" }
}

$cs = Get-Content $stateFile -Raw -Encoding UTF8

if ($cs -match "Phase:") { Ok "Phase field found - work identified" }
else { Fail "No Phase - agent cannot know what was being done" }

$phaseLine = @(($cs -split "`n") | Where-Object { $_ -match "Phase:" })
if ($phaseLine.Count -gt 0) {
    Write-Host "   Phase detected: $($phaseLine[0].Trim())"
} else {
    Write-Host "   Phase detected: (none)"
}

if ($cs -match "Next step") { Ok "Next step section found - actionable" }
else { Fail "No Next step - agent cannot resume" }

if ($cs -match "\|\s*\d+\s*\|") { Ok "Progress percentages found - measurable" }
else { Fail "No progress data - agent cannot track completion" }

if ($cs -match "Blockers") { Ok "Blockers section found" }
else { Fail "No Blockers section" }

$mem = Get-Content $memFile -Raw -Encoding UTF8
if ($mem -match "Architecture Decisions") { Ok "MEMORY has architecture decisions - context preserved" }
else { Fail "MEMORY missing decisions - agent loses context" }
if ($mem -match "Known Pitfalls") { Ok "MEMORY has pitfalls - avoids regression" }
else { Fail "MEMORY missing pitfalls - risks repeating bugs" }

# --- Phase 4: Bootstrap resolution ---
Write-Host ""
Write-Host "--- Phase 4: Bootstrap resolution ---"

$index = Get-Content $indexFile -Raw -Encoding UTF8
if ($index -match "CURRENT_STATE") { Ok "_index.md references CURRENT_STATE" }
else { Fail "_index.md does not reference CURRENT_STATE" }

$profile = Get-Content $profileFile -Raw -Encoding UTF8
if ($profile -match "express") { Ok "Profile 'express' available (minimal boot)" }
else { Fail "Profile 'express' missing" }

# --- Phase 5: Restore ---
Write-Host ""
Write-Host "--- Phase 5: Cleanup (restore template) ---"
Start-Sleep -Milliseconds 100
Set-Content -Path $stateFile -Value $backupState -Encoding UTF8
Set-Content -Path $memFile -Value $backupMem -Encoding UTF8
Ok "CURRENT_STATE.md restored"
Ok "MEMORY.md restored"

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "  Pass: $pass | Errors: $err"
if ($err -gt 0) { Write-Host "  Verdict: RECOVERY FAIL - chain broken"; exit 2 }
else { Write-Host "  Verdict: RECOVERY OK - agent can resume after crash" }
