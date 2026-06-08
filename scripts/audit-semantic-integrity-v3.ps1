# Semantic Integrity Audit - ASCII only

Write-Host "=== SEMANTIC INTEGRITY AUDIT ===" -ForegroundColor Cyan

# 1. Load agents
$agents = Get-Content ".opencode/ag-kit-main/web/src/services/agents.json" | ConvertFrom-Json
Write-Host "`n1. AGENTS DEFINED:" $agents.Count -ForegroundColor Yellow
$agents | ForEach-Object { Write-Host "  $($_.name): $($_.description)" }

# 2. Load profile
$profile = Get-Content ".opencode/profile.json" | ConvertFrom-Json
Write-Host "`n2. PROFILES:" -ForegroundColor Yellow
foreach ($profName in $profile.profiles.PSObject.Properties.Name) {
    $p = $profile.profiles.$profName
    $count = $p.agent_count
    Write-Host "  - $profName : $count agents"
}

# 3. Skills list
$skills = Get-ChildItem ".opencode/skills" -Directory | Select-Object -ExpandProperty Name
Write-Host "`n3. AVAILABLE SKILLS:" $skills.Count -ForegroundColor Yellow

# 4. Skill references in agents
Write-Host "`n4. SKILL REFERENCES:" -ForegroundColor Yellow
$allRefs = @()
$agents | ForEach-Object {
    $aname = $_.name
    Write-Host "  $aname :"
    if ($_.skills.Count -eq 0) {
        Write-Host "    ORPHAN AGENT (no skills)" -ForegroundColor Red
    } else {
        $_.skills | ForEach-Object {
            $skill = $_
            $allRefs += $skill
            $exists = $skills -contains $skill
            if (-not $exists) {
                Write-Host "    MISSING: $skill" -ForegroundColor Red
            }
        }
    }
}

# 5. Skill overlap
Write-Host "`n5. SKILL OVERAP (shared by >1 agent):" -ForegroundColor Yellow
$usage = @{}
$allRefs | Where-Object { $_ } | ForEach-Object {
    if ($usage.ContainsKey($_)) { $usage[$_]++ } else { $usage[$_] = 1 }
}
$shared = $usage.GetEnumerator() | Where-Object { $_.Value -gt 1 } | Sort-Object Value -Descending
if ($shared.Count -gt 0) {
    $shared | ForEach-Object { Write-Host "  $($_.Key) : $($_.Value) agents" }
} else {
    Write-Host "  No overlap detected" -ForegroundColor Green
}

# 6. Orphan skills
Write-Host "`n6. ORPHAN SKILLS (not referenced):" -ForegroundColor Yellow
$orphans = $skills | Where-Object { -not $usage.ContainsKey($_) }
if ($orphans.Count -gt 0) {
    $orphans | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "  All skills referenced" -ForegroundColor Green
}

# 7. Profile agent validation
Write-Host "`n7. PROFILE AGENT VALIDATION:" -ForegroundColor Yellow
$agentNames = $agents.name
foreach ($profName in $profile.profiles.PSObject.Properties.Name) {
    $p = $profile.profiles.$profName
    foreach ($aref in $p.agents) {
        if ($agentNames -notcontains $aref) {
            Write-Host "  Profile $profName -> missing agent: $aref" -ForegroundColor Red
        }
    }
}

# 8. Registry path
Write-Host "`n8. REGISTRY PATH:" -ForegroundColor Yellow
$reg = $profile.loading_rules.agent_routing.registry
Write-Host "  Configured: $reg"
if (Test-Path $reg) {
    Write-Host "  EXISTS" -ForegroundColor Green
} else {
    Write-Host "  MISSING (dead-end route)" -ForegroundColor Red
}

# 9. Intents
Write-Host "`n9. INTENTS (from AGENTS.md):" -ForegroundColor Yellow
$lines = Get-Content "AGENTS.md"
$inSection = $false
$intents = @()
foreach ($line in $lines) {
    if ($line -match '^\| \*\*Intenção\*\*') { $inSection = $true; continue }
    if ($inSection -and $line -match '^\| (\w+)\s+\|') {
        $intents += $matches[1]
    }
    if ($inSection -and $line -match '^\s*$') { $inSection = $false }
}
Write-Host "  " ($intents -join ', ')

# 10. Keyword conflicts
Write-Host "`n10. KEYWORD CONFLICTS:" -ForegroundColor Yellow
$kwMap = @{}
foreach ($line in $lines) {
    if ($line -match '^\| (\w+)\s+\| (.+?)\s+\|') {
        $intent = $matches[1]
        $kws = $matches[2] -split ',\s*'
        foreach ($kw in $kws) {
            if ($kwMap.ContainsKey($kw)) {
                $kwMap[$kw] += ",$intent"
            } else {
                $kwMap[$kw] = $intent
            }
        }
    }
}
$conflicts = $kwMap.GetEnumerator() | Where-Object { $_.Value -match ',' }
if ($conflicts.Count -gt 0) {
    $conflicts | ForEach-Object { Write-Host "  $($_.Key) : $($_.Value)" }
} else {
    Write-Host "  No keyword conflicts" -ForegroundColor Green
}

# 11. POS structure
Write-Host "`n11. POS STRUCTURE:" -ForegroundColor Yellow
$posIdx = "docs/obsidian/project-operating-system/_index.md"
if (Test-Path $posIdx) {
    Write-Host "  POS _index.md exists"
    $pos = Get-Content $posIdx
    if ($pos -match '99-TEMPLATES/') {
        Write-Host "  Cold storage configured" -ForegroundColor Green
    }
} else {
    Write-Host "  POS _index.md MISSING" -ForegroundColor Red
}

Write-Host "`n=== AUDIT DONE ===" -ForegroundColor Cyan
