# pos-test-all.ps1 — Full POS test suite
# Verifica: core + links + perfis + skills + frontmatter + config
# Usage: .\scripts\pos-test-all.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$pos = Join-Path $root "docs\obsidian\project-operating-system"
$agentsFile = Join-Path $root "AGENTS.md"
$indexFile = Join-Path $pos "_index.md"
$profileFile = Join-Path $root ".opencode\profile.json"
$err = 0
$pass = 0
$tested = 0

function Ok { $script:pass++; Write-Host "    [OK] $($args -join ' ')" }
function Fail { $script:err++; Write-Host "    [FAIL] $($args -join ' ')" }
function Test($msg, $scriptBlock) {
    $script:tested++
    Write-Host "  $msg"
    & $scriptBlock
}

Write-Host "=== POS Full Test Suite ==="
Write-Host ""

# ───── 1. CORE FILES ─────
Write-Host "--- 1/6: Core files ---"
$coreFiles = @(
    "AGENTS.md",
    "docs/obsidian/project-operating-system/_index.md",
    "docs/obsidian/project-operating-system/CURRENT_STATE.md",
    "docs/obsidian/project-operating-system/MEMORY.md",
    "docs/obsidian/project-operating-system/00-SYSTEM/SYSTEM_CONTRACT.md",
    "docs/obsidian/project-operating-system/00-SYSTEM/CONTEXT_BUDGET_GOVERNANCE.md",
    "docs/obsidian/project-operating-system/00-SYSTEM/EVENT_STREAM.md",
    "docs/obsidian/project-operating-system/00-SYSTEM/_index.md",
    ".opencode/profile.json"
)
foreach ($f in $coreFiles) {
    $path = Join-Path $root $f
    if (Test-Path $path) { Ok "file: $f" } else { Fail "file: $f" }
}

# ───── 2. AGENTS.md DELEGATED RULES ─────
Write-Host ""
Write-Host "--- 2/6: AGENTS.md delegated rules ---"

$agents = Get-Content $agentsFile -Raw -Encoding UTF8
$ruleMatches = [regex]::Matches($agents, '(?<=\|).+?(?=\|)')
$delegatedRulesFile = $null
$inTable = $false
$inDelegated = $false
$expectedLinks = @()

$lines = Get-Content $agentsFile -Encoding UTF8
$inDelegatedSection = $false
foreach ($line in $lines) {
    if ($line -match "^## Delegated rules") { $inDelegatedSection = $true; continue }
    if ($inDelegatedSection -and $line -match "^## ") { $inDelegatedSection = $false }
    if ($inDelegatedSection -and $line -match "^\|(.+)\|(.+)\|$") {
        $rulePart = $matches[1].Trim()
        $locPart = $matches[2].Trim()
        # locPart is like "`00-SYSTEM/SYSTEM_CONTRACT.md`"
        $link = $locPart -replace '`', ''
        if ($link -match '\.md$') {
            $expectedLinks += @($link)
        }
    }
}

foreach ($link in $expectedLinks) {
    $path = Join-Path $pos $link
    if (Test-Path $path) { Ok "delegated rule resolves: $link" }
    else { Fail "delegated rule broken: $link" }
}

# ───── 3. PROFILES ─────
Write-Host ""
Write-Host "--- 3/6: Profile validation ---"

$profile = Get-Content $profileFile -Raw -Encoding UTF8 | ConvertFrom-Json
$profile.profiles.PSObject.Properties | ForEach-Object {
    $pname = $_.Name
    $pval = $_.Value
    if ($pval.bootstrap) {
        $order = $pval.bootstrap
        Write-Host "    Profile: $pname -> boot: $($order -join ', ')"
        $allResolve = $true
        foreach ($step in $order) {
            $found = Test-Path (Join-Path $root $step)
            if (-not $found) {
                $allResolve = $false
                Fail "$pname profile: boot step '$step' not found"
            }
        }
        if ($allResolve) { Ok "$pname profile: all boot steps resolve" }
    }
}

# ───── 4. POS _index.md LINKS ─────
Write-Host ""
Write-Host "--- 4/6: _index.md link validation ---"

$content = Get-Content $indexFile -Raw -Encoding UTF8
# Match markdown links: [text](path)
$mdLinks = [regex]::Matches($content, '\[([^\]]+)\]\(([^)]+)\)')
$checked = @{}
foreach ($match in $mdLinks) {
    $text = $match.Groups[1].Value
    $link = $match.Groups[2].Value
    if ($checked.ContainsKey($link)) { continue }
    $checked[$link] = $true
    # Skip external / absolute / anchor-only
    if ($link -match '^https?://' -or $link -match '^#' -or $link -match '^\.\./') { continue }
    $resolved = Join-Path $pos $link
    if (Test-Path $resolved) { Ok "link: $link -> $resolved" }
    else { Fail "link broken: $link" }
}

# ───── 5. SKILL REGISTRY ─────
Write-Host ""
Write-Host "--- 5/6: Skill registry consistency ---"

$regPath = Join-Path $pos "04-AGENTS\SKILL_REGISTRY.md"
$runtimeSkillDir = Join-Path $root ".opencode\ag-kit-main\.agent\skills"
$referenceSkillDir = Join-Path $root ".opencode\skills"  # Deprecated reference (nearly empty)

if (Test-Path $regPath) {
    $regLines = Get-Content $regPath -Encoding UTF8
    $skills = @()
    foreach ($line in $regLines) {
        if ($line -match "^\|[^|]*\|[^|]*\|[^|]*\|$") {
            $parts = $line -split '\|' | ForEach-Object { $_.Trim() }
            if ($parts.Count -ge 4) {
                $skillName = $parts[1] -replace '`', '' -replace '^\*', '' -replace '\*$', ''
                if ($skillName -ne '' -and $skillName -ne 'Skill' -and $skillName -match '^[a-z]') {
                    $skills += $skillName
                }
            }
        }
    }
    if ($skills.Count -eq 0) { Fail "SKILL_REGISTRY.md has no skills parsed" }
    else { Ok "Skills parsed: $($skills.Count) entries" }

    # Mapping for registry names to directory names
    $nameToDir = @{
        "react-best-practices" = "nextjs-react-expert"
    }

    # Compare each skill to runtime directory
    foreach ($sk in $skills) {
        $dir = $sk
        if ($nameToDir.ContainsKey($sk)) { $dir = $nameToDir[$sk] }
        $runtimePath = Join-Path $runtimeSkillDir "${dir}\SKILL.md"
        if (Test-Path $runtimePath) {
            Ok "skill $sk -> runtime SKILL.md exists"
        } else {
            # Check reference (deprecated) just in case
            $refPath = Join-Path $referenceSkillDir "${dir}\SKILL.md"
            if (Test-Path $refPath) {
                Write-Host "    [WARN] skill $sk -> only in reference dir (use runtime)" -ForegroundColor Yellow
            } else {
                Write-Host "    [WARN] skill $sk -> not found in runtime (document-only?)" -ForegroundColor Yellow
            }
        }
    }
} else {
        Fail "SKILL_REGISTRY.md not found"
    }

# ───── 7. PROFILE EFFICIENCY ─────
Write-Host ""
Write-Host "--- 7/7: Profile efficiency ---"
$effValidator = Join-Path $root 'scripts\validate-profile-efficiency.ps1'
if (Test-Path $effValidator) {
    $effResult = & powershell -NoProfile -ExecutionPolicy Bypass -File $effValidator
    $effExit = $LASTEXITCODE
    if ($effExit -eq 0) { Ok "profile efficiency: within limits" }
    else { Fail "profile efficiency: some profiles exceed token limits" }
} else {
    Write-Host "    [WARN] validate-profile-efficiency.ps1 not found (skip)"
}

# Summary
Write-Host ""
Write-Host "=== Summary ==="
Write-Host "  Tests: $($pass + $err) | Pass: $pass | Errors: $err"
if ($err -gt 0) { Write-Host "  Verdict: FAIL"; exit 2 }
else { Write-Host "  Verdict: ALL OK" }
