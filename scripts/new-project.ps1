# new-project.ps1 — Cria um novo projeto a partir deste template
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [string]$TargetDir = ".."  # Cria no diretório pai por padrão
)

$ErrorActionPreference = 'Stop'
$templateRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$projectPath = Join-Path $TargetDir $ProjectName

if (Test-Path $projectPath) {
    Write-Error "Diretório já existe: $projectPath"
    exit 1
}

Write-Host "=== Criando projeto '$ProjectName' em $projectPath ===" -ForegroundColor Cyan

# 1. Copiar estrutura de diretórios principais
$items = @(
    "docs",
    ".opencode",
    "scripts",
    "AGENTS.md"
)
foreach ($item in $items) {
    $src = Join-Path $templateRoot $item
    $dst = Join-Path $projectPath $item
    if (Test-Path $src -PathType Container) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    } else {
        Copy-Item -Path $src -Destination $dst -Force
    }
}

# 2. Remover itens desnecessários do template no novo projeto
#   - .opencode/skills.archive/ (não necessário)
$skillsArchive = Join-Path $projectPath ".opencode\skills.archive"
if (Test-Path $skillsArchive) { Remove-Item -Recurse -Force $skillsArchive }

# 3. Preencher CURRENT_STATE.md
$csPath = Join-Path $projectPath "docs\obsidian\project-operating-system\CURRENT_STATE.md"
if (Test-Path $csPath) {
    $csContent = @"
---
phase: initialization
project_name: "$ProjectName"
description: "Projeto recém-criado a partir do template."
current_focus: "Setup inicial"
---
"@
    $csContent | Set-Content -Path $csPath -Encoding UTF8
    Write-Host "CURRENT_STATE.md preenchido." -ForegroundColor Green
}

# 4. Inicializar git
Push-Location $projectPath
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Warning "Git não encontrado; skipping git init."
    } else {
        git init
        git add .
        git commit -m "Initial project from Cognitive Vault Template"
        Write-Host "Git inicializado e commit inicial criado." -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# 5. Instalar git hooks
Write-Host "Instalando git hooks..." -ForegroundColor Cyan
Push-Location $projectPath
try {
    & "$projectPath\scripts\install-hooks.ps1"
} finally {
    Pop-Location
}

# 6. Validar instalação
Write-Host "Executando validação inicial..." -ForegroundColor Cyan
Push-Location $projectPath
try {
    $testResult = & "$projectPath\scripts\pos-test-all.ps1" 2>&1
    $exitCode = $LASTEXITCODE
    Write-Host $testResult
    if ($exitCode -eq 0) {
        Write-Host "Validação PASSED." -ForegroundColor Green
    } else {
        Write-Host "Validação FAILED com código $exitCode." -ForegroundColor Red
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Projeto '$ProjectName' criado com sucesso ===" -ForegroundColor Green
Write-Host "Próximos passos:" -ForegroundColor White
Write-Host "1. Navegue até: $projectPath" -ForegroundColor Gray
Write-Host "2. Edite docs/obsidian/project-operating-system/CURRENT_STATE.md" -ForegroundColor Gray
Write-Host "3. Use sua CLI de agente (ex: opencode) para iniciar." -ForegroundColor Gray
Write-Host "4. Consulte README.md para mais detalhes." -ForegroundColor Gray
