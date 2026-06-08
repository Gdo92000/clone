# simulate-retrieval.ps1 — Simulates agent task execution with instrumentation
param(
    [Parameter(Mandatory=$true)]
    [string]$TaskType,
    
    [Parameter(Mandatory=$true)]
    [string]$TaskPrompt,
    
    [int]$Runs = 5
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logPath = Join-Path $root ".opencode\retrieval.log"

function Reset-RetrievalLog {
    if (Test-Path $logPath) {
        Clear-Content $logPath
    }
}

function Get-CapabilityForTask {
    param($prompt)
    
    # Simple classifier based on keywords
    $keywords = @{
        'frontend' = @('componente','React','UI','tela','interface','botão','formulário','CSS','Tailwind')
        'backend' = @('API','server','endpoint','controller','serviço','rota','middleware','banco')
        'testing' = @('teste','test','spec','coverage','Jest','Vitest','Playwright','E2E')
        'architecture' = @('arquitetura','estrutura','ADR','decisão','trade-off','padrão')
        'debugging' = @('debug','bug','erro','crash','falha','diagnóstico','log')
        'security' = @('segurança','vulnerabilidade','SQL','XSS','CSRF','auth')
    }
    
    foreach ($cap in $keywords.Keys) {
        foreach ($kw in $keywords[$cap]) {
            if ($prompt -match $kw) {
                return $cap
            }
        }
    }
    return 'general'
}

function Invoke-TaskSimulation {
    param($TaskType, $Prompt)
    
    # Reset log to get clean measurement
    Reset-RetrievalLog
    
    # Determine capability
    $capability = Get-CapabilityForTask -prompt $Prompt
    
    # Load manifest
    $manifestPath = Join-Path $root ".opencode/capabilities/$capability.manifest.json"
    if (-not (Test-Path $manifestPath)) {
        Write-Warning "No manifest for capability '$capability'. Using general."
        $manifestPath = Join-Path $root ".opencode/capabilities/frontend.manifest.json" # default
    }
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    
    # Simulate retrieval: count allowed docs that would be loaded
    $retrievedFiles = @()
    $totalTokens = 0
    
    # 1. Check which allowed docs actually exist and would be retrieved
    foreach ($pattern in $manifest.allowed_docs_patterns) {
        # Convert wildcard pattern to actual files
        $globPattern = $pattern -replace '\*\*', '*' -replace '\.md$', '*.md'
        # Simple glob matching
        if ($pattern -like '*\*\*') {
            # Recursive
            $files = Get-ChildItem -Path $root -Filter *.md -Recurse -ErrorAction SilentlyContinue
        } else {
            # Non-recursive pattern - extract path
            $pathPart = Split-Path $pattern -Parent
            if ($pathPart) {
                $files = Get-ChildItem -Path (Join-Path $root $pathPart) -Filter *.md -ErrorAction SilentlyContinue
            } else {
                $files = Get-ChildItem -Path $root -Filter *.md -ErrorAction SilentlyContinue
            }
        }
        
        foreach ($file in $files) {
            $rel = $file.FullName.Replace($root + '\','')
            # Check if matches pattern using simple -like with wildcard conversion
            $likePattern = $pattern -replace '\*', '*' -replace '\?', '?' # already in Windows wildcard
            if ($rel -like $likePattern) {
                $retrievedFiles += $rel
                $chars = ($file.Length)
                $totalTokens += [math]::Ceiling($chars / 4)
            }
        }
    }
    
    # 2. Add skills (would be loaded via load-skill.ps1)
    foreach ($skill in $manifest.allowed_skills) {
        $skillFile = Join-Path $root ".opencode/ag-kit-main/.agent/skills/$skill/SKILL.md"
        if (Test-Path $skillFile) {
            $retrievedFiles += $skillFile.Replace($root + '\','')
            $chars = (Get-Content $skillFile -Raw).Length
            $totalTokens += [math]::Ceiling($chars / 4)
        }
    }
    
    # 3. Remove duplicates
    $retrievedFiles = $retrievedFiles | Sort-Object -Unique
    $uniqueTokens = 0
    foreach ($file in $retrievedFiles) {
        $full = Join-Path $root $file
        if (Test-Path $full) {
            $chars = (Get-Content $full -Raw).Length
            $uniqueTokens += [math]::Ceiling($chars / 4)
        }
    }
    
    # Detect irrelevant retrieval (would need actual retrieval.log; approximate using forbidden patterns)
    $irrelevantFiles = @()
    foreach ($forbidden in $manifest.forbidden_docs_patterns) {
        foreach ($file in $retrievedFiles) {
            if ($file -like $forbidden) {
                $irrelevantFiles += $file
            }
        }
    }
    foreach ($forbiddenSkill in $manifest.forbidden_skills) {
        foreach ($skill in $manifest.allowed_skills) {
            if ($skill -eq $forbiddenSkill) {
                # Should not happen if manifest consistent, but check
                Write-Warning "Skill $skill is both allowed and forbidden!"
            }
        }
    }
    
    $irrelevantCount = $irrelevantFiles.Count
    $pollutionPct = if ($retrievedFiles.Count -gt 0) { [math]::Round($irrelevantCount / $retrievedFiles.Count * 100, 1) } else { 0 }
    
    return @{
        TaskType = $TaskType
        Capability = $capability
        RetrievedFiles = $retrievedFiles
        RetrievedCount = $retrievedFiles.Count
        IrrelevantFiles = $irrelevantFiles
        IrrelevantCount = $irrelevantCount
        TotalTokens = $totalTokens
        UniqueTokens = $uniqueTokens
        PollutionPct = $pollutionPct
    }
}

# Run simulations
$allResults = @()
for ($i=1; $i -le $Runs; $i++) {
    Write-Host "Run $i/$Runs for $TaskType..."
    $result = Invoke-TaskSimulation -TaskType $TaskType -Prompt $TaskPrompt
    $allResults += $result
}

# Aggregate
$avgTokens = [math]::Round(($allResults | Measure-Object TotalTokens -Average).Average, 1)
$avgFiles = [math]::Round(($allResults | Measure-Object RetrievedCount -Average).Average, 1)
$avgPollution = [math]::Round(($allResults | Measure-Object PollutionPct -Average).Average, 1)
$maxTokens = ($allResults | Measure-Object TotalTokens -Maximum).Maximum

Write-Host "Simulation complete for $TaskType." -ForegroundColor Green
Write-Host "Avg tokens: $avgTokens"
Write-Host "Avg files: $avgFiles"
Write-Host "Avg pollution: $avgPollution%"
Write-Host "Max tokens: $maxTokens"

# Output JSON for aggregation
$summary = @{
    TaskType = $TaskType
    Runs = $Runs
    AvgTokens = $avgTokens
    AvgFiles = $avgFiles
    AvgPollution = $avgPollution
    MaxTokens = $maxTokens
    AllResults = $allResults
} | ConvertTo-Json -Depth 10

$outFile = Join-Path $logPath "simulation-$TaskType-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$summary | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Simulation log: $outFile"
