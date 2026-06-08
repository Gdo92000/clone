# setup-template.ps1 — Integração automática do Cognitive Vault Template em projeto existente

param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$posDir = Join-Path $root "docs/obsidian/project-operating-system"
$currentStatePath = Join-Path $posDir "CURRENT_STATE.md"

Write-Host "=== INTEGRAÇÃO AUTOMÁTICA DO TEMPLATE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se estamos em repositório git
$gitDir = Join-Path $root ".git"
if (-not (Test-Path $gitDir)) {
    Write-Warning "Repositório git não encontrado. Inicialize com 'git init' antes de continuar."
    $continue = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($continue -notmatch '^[sS]') { exit 0 }
}

# 2. Determinar nome do projeto
$defaultName = Split-Path -Leaf $root
$projectName = Read-Host "Nome do projeto [$defaultName]"
if ([string]::IsNullOrWhiteSpace($projectName)) { $projectName = $defaultName }

$description = Read-Host "Descrição curta do projeto (ex: API Node.js com React)"

# 3. Atualizar CURRENT_STATE.md
if (Test-Path $currentStatePath) {
    $content = Get-Content $currentStatePath -Raw
    # Replace frontmatter fields if present, or append
    if ($content -match '---') {
        # Update existing frontmatter
        $lines = $content -split "`n"
        $inFrontmatter = $false
        $newLines = @()
        foreach ($line in $lines) {
            if ($line -eq '---') {
                $inFrontmatter = -not $inFrontmatter
                $newLines += $line
                continue
            }
            if ($inFrontmatter) {
                if ($line -match '^project:') {
                    $newLines += "project: $projectName"
                } elseif ($line -match '^description:') {
                    $newLines += "description: $description"
                } else {
                    $newLines += $line
                }
            } else {
                $newLines += $line
            }
        }
        $newContent = $newLines -join "`n"
    } else {
        # Prepend frontmatter
        $newContent = @"
---
project: $projectName
description: $description
status: active
created_at: $(Get-Date -Format 'yyyy-MM-dd')
updated_at: $(Get-Date -Format 'yyyy-MM-dd')
---

$content
"@
    }
    $newContent | Out-File -FilePath $currentStatePath -Encoding UTF8
    Write-Host "CURRENT_STATE.md atualizado com nome e descrição." -ForegroundColor Green
} else {
    Write-Warning "CURRENT_STATE.md não encontrado. Pulando atualização."
}

# 4. Instalar git hooks
Write-Host "`nInstalando git hooks..."
.\scripts\install-hooks.ps1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Git hooks instalados." -ForegroundColor Green
} else {
    Write-Host "Falha ao instalar git hooks." -ForegroundColor Red
}

# 5. Analisar skills existentes no projeto
$runtimeSkillsDir = Join-Path $root ".opencode\ag-kit-main\.agent\skills"
if (Test-Path $runtimeSkillsDir) {
    $existingSkills = Get-ChildItem -Path $runtimeSkillsDir -Directory | Select-Object -ExpandProperty Name
    Write-Host "`nSkills encontradas no runtime: $($existingSkills.Count)"
    $existingSkills | ForEach-Object { Write-Host "  - $_" }
    
    # Verificar se Skill Registry existe e está sincronizado
    $skillRegistryPath = Join-Path $posDir "04-AGENTS/SKILL_REGISTRY.md"
    if (Test-Path $skillRegistryPath) {
        $registryContent = Get-Content $skillRegistryPath -Raw
        # Parse da tabela: | Skill | ... |
        $registered = @()
        $lines = $registryContent -split "`n"
        foreach ($line in $lines) {
            if ($line -match '^\|.*\|.*\|.*\|') {
                $parts = $line -split '\|' | ForEach-Object { $_.Trim() }
                if ($parts.Count -ge 4 -and $parts[1] -notmatch 'Skill') {
                    $skillName = $parts[1] -replace '`','' -replace '^\*','' -replace '\*$',''
                    if ($skillName -match '^[a-z]') { $registered += $skillName }
                }
            }
        }
        
        # Comparar
        $missing = $existingSkills | Where-Object { $registered -notcontains $_ }
        $extra = $registered | Where-Object { $existingSkills -notcontains $_ }
        
        if ($missing.Count -gt 0) {
            Write-Host "`n[Atenção] Skills não registradas no SKILL_REGISTRY.md:" -ForegroundColor Yellow
            $missing | ForEach-Object { Write-Host "  - $_" }
            $add = Read-Host "Adicionar automaticamente ao registry? (s/N)"
            if ($add -match '^[sS]') {
                # Add each missing skill to registry table
                $newRows = @()
                foreach ($skill in $missing) {
                    $newRows += "| `$skill` | Habilidade para $skill | - | - |"
                }
                # Insert before closing table or after header
                $skillHeaderLine = $lines | Where-Object { $_ -match '^\| *Skill *\|' }
                if ($skillHeaderLine) {
                    $insertIndex = $lines.IndexOf($skillHeaderLine) + 2
                } else {
                    $insertIndex = $lines.Count - 2
                }
                $updatedLines = $lines[0..($insertIndex-1)] + $newRows + $lines[$insertIndex..($lines.Count-1)]
                $updatedLines -join "`n" | Out-File -FilePath $skillRegistryPath -Encoding UTF8
                Write-Host "SKILL_REGISTRY.md atualizado." -ForegroundColor Green
            }
        }
        if ($extra.Count -gt 0) {
            Write-Host "`n[Info] Skills registradas mas não encontradas no runtime:" -ForegroundColor Cyan
            $extra | ForEach-Object { Write-Host "  - $_" }
            Write-Host "Isso pode ser normal se forem skills document-only."
        }
    } else {
        Write-Warning "SKILL_REGISTRY.md não encontrado em $skillRegistryPath"
    }
} else {
    Write-Warning "Diretório de skills não encontrado: $runtimeSkillsDir"
}

# 5b. Verificar se demanda-loaded architecture está habilitada
$bootRouterPath = Join-Path $posDir "BOOT_ROUTER.md"
$taskClassifierPath = Join-Path $posDir "TASK_CLASSIFIER.md"
if ((Test-Path $bootRouterPath) -and (Test-Path $taskClassifierPath)) {
    Write-Host "`nArquivos de demanda-loaded detection encontrados:" -ForegroundColor Green
    Write-Host "  - BOOT_ROUTER.md"
    Write-Host "  - TASK_CLASSIFIER.md"
} else {
    Write-Host "`n[Aviso] Arquivos de demanda-loaded não encontrados." -ForegroundColor Yellow
    Write-Host "Copie BOOT_ROUTER.md e TASK_CLASSIFIER.md do template se quiser usar essa arquitetura."
}

# 6. Executar testes de validação
Write-Host "`nExecutando validação POS (pos-test-all.ps1)..." -ForegroundColor Cyan
.\scripts\pos-test-all.ps1
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nValidação concluída com sucesso!" -ForegroundColor Green
} else {
    Write-Host "`nValidação encontrou problemas. Revise os erros acima." -ForegroundColor Red
}

# 7. Relatório final
Write-Host "`n=== INTEGRAÇÃO CONCLUÍDA ===" -ForegroundColor Cyan
Write-Host "Projeto: $projectName"
Write-Host "Descrição: $description"
Write-Host "Git hooks: instalados"
Write-Host "CURRENT_STATE.md: atualizado"
if (Test-Path $runtimeSkillsDir) { Write-Host "Skills analisadas: $($existingSkills.Count)" }
Write-Host "Próximos passos:"
Write-Host "  1. Revise .opencode/profile.json se necessário"
Write-Host "  2. Use 'git commit' normalmente - os hooks vão validar automaticamente"
Write-Host "  3. Execute .\scripts\pos-test-all.ps1 periodicamente"
Write-Host "  4. Considere rodar .\scripts\stress-test\run-all.ps1 para avaliar performance cognitiva"
Write-Host ""

# Open browser to README?
$openReadme = Read-Host "Abrir README.md? (s/N)"
if ($openReadme -match '^[sS]') {
    $readmePath = Join-Path $root "README.md"
    if (Test-Path $readmePath) {
        Start-Process $readmePath
    }
}
