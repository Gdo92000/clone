# cognition-cost-total.ps1 — Medição consolidada de todos os conhecimentos
$root = Split-Path -Parent $PSScriptRoot

# Função para medir diretório .md
function Measure-Markdown($path, $name) {
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -File -Filter '*.md'
        $chars = ($files | Measure-Object -Property Length -Sum).Sum
        $tokens = [math]::Ceiling($chars/4)
        Write-Host "$name`: $($files.Count) .md files, $chars chars, ~$tokens tokens"
        return [PSCustomObject]@{Name=$name; Files=$files.Count; Chars=$chars; Tokens=$tokens}
    } else {
        Write-Host "$name`: path not found"
        return $null
    }
}

# Função para medir arquivos específicos (não .md)
function Measure-Files($path, $name, $filter = '*.*') {
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -File -Filter $filter
        $chars = ($files | Measure-Object -Property Length -Sum).Sum
        $tokens = [math]::Ceiling($chars/4)
        Write-Host "$name`: $($files.Count) files, $chars chars, ~$tokens tokens"
        return [PSCustomObject]@{Name=$name; Files=$files.Count; Chars=$chars; Tokens=$tokens}
    } else {
        Write-Host "$name`: path not found"
        return $null
    }
}

# Coletar medidas
$measurements = @()

# POS
$pos = Measure-Markdown (Join-Path $root 'docs\obsidian\project-operating-system') 'POS'
if ($pos) { $measurements += $pos }

# Wiki verdadeira
$wiki = Measure-Markdown (Join-Path $root 'docs\obsidian\wiki') 'Wiki'
if ($wiki) { $measurements += $wiki }

# Skills canônicas (runtime)
$skills = Measure-Markdown (Join-Path $root '.opencode\ag-kit-main\.agent\skills') 'Skills (canonical)'
if ($skills) { $measurements += $skills }

# Scripts .ps1
$scripts = Measure-Files (Join-Path $root 'scripts') 'Scripts (.ps1)' '*.ps1'
if ($scripts) { $measurements += $scripts }

# AGENTS.md
$agentsPath = Join-Path $root 'AGENTS.md'
if (Test-Path $agentsPath) {
    $agents = Get-Content $agentsPath -Raw
    $agentsTokens = [math]::Ceiling($agents.Length/4)
    Write-Host "AGENTS.md: $($agents.Length) chars, ~$agentsTokens tokens"
    $measurements += [PSCustomObject]@{Name='AGENTS.md'; Files=1; Chars=$agents.Length; Tokens=$agentsTokens}
}

# profile.json
$profilePath = Join-Path $root '.opencode\profile.json'
if (Test-Path $profilePath) {
    $profile = Get-Content $profilePath -Raw
    $profileTokens = [math]::Ceiling($profile.Length/4)
    Write-Host "profile.json: $($profile.Length) chars, ~$profileTokens tokens"
    $measurements += [PSCustomObject]@{Name='profile.json'; Files=1; Chars=$profile.Length; Tokens=$profileTokens}
}

# opencode.json
$opencodePath = Join-Path $root 'opencode.json'
if (Test-Path $opencodePath) {
    $opencode = Get-Content $opencodePath -Raw
    $opencodeTokens = [math]::Ceiling($opencode.Length/4)
    Write-Host "opencode.json: $($opencode.Length) chars, ~$opencodeTokens tokens"
    $measurements += [PSCustomObject]@{Name='opencode.json'; Files=1; Chars=$opencode.Length; Tokens=$opencodeTokens}
}

# Total
$totalTokens = ($measurements | Measure-Object -Property Tokens -Sum).Sum
$totalChars = ($measurements | Measure-Object -Property Chars -Sum).Sum
$totalFiles = ($measurements | Measure-Object -Property Files -Sum).Sum

Write-Host ""
Write-Host "=== CONSOLIDATED KNOWLEDGE COST ==="
$measurements | Format-Table -AutoSize
Write-Host "TOTAL FILES: $totalFiles"
Write-Host "TOTAL CHARS: $totalChars"
Write-Host "TOTAL TOKENS: ~$totalTokens"
Write-Host ""

# Comparação com limpeza (estimativa anterior)
$preCleanupEstimate = 522682
$economy = $preCleanupEstimate - $totalTokens
$economyPct = [math]::Round(($economy / $preCleanupEstimate) * 100, 1)
Write-Host "=== ECONOMY vs PRE-CLEANUP (estimated $preCleanupEstimate tokens) ==="
Write-Host "Tokens freed: ~$economy"
Write-Host "Reduction: ~$economyPct%"
Write-Host ""

# Boot cost: medir arquivos específicos de boot
$posPath = Join-Path $root 'docs\obsidian\project-operating-system'
$idxTokens = 0; $csTokens = 0; $memTokens = 0
$idxFile = Join-Path $posPath '_index.md'
$csFile = Join-Path $posPath 'CURRENT_STATE.md'
$memFile = Join-Path $posPath 'MEMORY.md'
if (Test-Path $idxFile) { $idxTokens = [math]::Ceiling((Get-Content $idxFile -Raw).Length/4) }
if (Test-Path $csFile) { $csTokens = [math]::Ceiling((Get-Content $csFile -Raw).Length/4) }
if (Test-Path $memFile) { $memTokens = [math]::Ceiling((Get-Content $memFile -Raw).Length/4) }
$bootAgents = [math]::Ceiling($agents.Length/4)
$bootExpress = $bootAgents + $idxTokens + $csTokens
$bootFull = $bootExpress + $memTokens
$pctBoot = [math]::Round(($bootFull / $totalTokens) * 100, 1)
Write-Host ""
Write-Host "=== BOOT COST (express) ==="
Write-Host "AGENTS.md: ~$bootAgents tokens"
Write-Host "_index.md: ~$idxTokens tokens"
Write-Host "CURRENT_STATE.md: ~$csTokens tokens"
Write-Host "MEMORY.md: ~$memTokens tokens"
Write-Host "Express boot: ~$bootExpress tokens (AGENTS + _index + CURRENT_STATE)"
Write-Host "Full boot: ~$bootFull tokens (Express + MEMORY)"
Write-Host "Full boot vs total: $pctBoot% (target < 15%)"
Write-Host ""
Write-Host "=== INDEX EFFICIENCY ==="
$allIdx = Get-ChildItem -Path $posPath -Recurse -File -Filter '*_index.md'
$idxSumTokens = 0; foreach ($f in $allIdx) { $idxSumTokens += [math]::Ceiling($f.Length/4) }
$idxPct = [math]::Round(($idxSumTokens / $totalTokens) * 100, 1)
Write-Host "Total index files in POS: $($allIdx.Count), ~$idxSumTokens tokens ($idxPct% of total)"
Write-Host "Target: < 25%"
