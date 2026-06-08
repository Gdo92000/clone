# install-hooks.ps1 — Instala git hooks do kernel
param(
    [string]$RepoRoot = "."
)

$ErrorActionPreference = 'Stop'
$repo = Resolve-Path $RepoRoot
$gitDir = Join-Path $repo ".git"
if (-not (Test-Path $gitDir)) {
    Write-Warning "Repositório git não inicializado em $repo. Hooks não instalados."
    exit 0
}
$gitHooksDir = Join-Path $gitDir "hooks"
$sourceHooks = Join-Path $PSScriptRoot "hooks"

if (-not (Test-Path $gitHooksDir)) {
    Write-Error "Diretório .git/hooks não encontrado em $repo. Tem certeza que é um repositório git?"
    exit 1
}
if (-not (Test-Path $sourceHooks)) {
    Write-Error "Hooks source não encontrado em $sourceHooks"
    exit 1
}

# Copiar cada hook (substituir)
$hookFiles = Get-ChildItem -Path $sourceHooks -File
foreach ($hook in $hookFiles) {
    $dest = Join-Path $gitHooksDir $hook.Name
    Copy-Item -Path $hook.FullName -Destination $dest -Force
    Write-Host "Instalado: $($hook.Name)"
}

Write-Host "Git hooks instalados com sucesso em $gitHooksDir" -ForegroundColor Green
Write-Host "Hooks ativos: pre-commit, pre-push" -ForegroundColor Cyan
