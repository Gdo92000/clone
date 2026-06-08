# POS Pre-Commit Hook — protege AGENTS.md, docs/ e memory/ de regressão
# Invocado via .githooks/pre-commit (wrapper sh) → powershell/pwsh

$changed = git diff --cached --name-only
$targetPaths = @('AGENTS.md', 'opencode.json', 'docs/', '.opencode/memory/')
$shouldCheck = $false

foreach ($file in $changed) {
    foreach ($target in $targetPaths) {
        if ($file.StartsWith($target)) {
            $shouldCheck = $true
            break
        }
    }
    if ($shouldCheck) { break }
}

if (-not $shouldCheck) { exit 0 }

Write-Host "`n[POS HOOK] Alterações detectadas em: AGENTS.md, opencode.json, docs/ ou .opencode/memory/" -ForegroundColor Yellow
Write-Host "[POS HOOK] 1/3 Verificando drift de memory (phases.jsonl → STATE_ACTIVA/CURRENT_STATE)..." -ForegroundColor Yellow

$memoryCheck = npm run --silent memory:check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[POS HOOK] FAIL - Drift detectado em STATE_ACTIVA.md ou CURRENT_STATE.md." -ForegroundColor Red
    Write-Host "[POS HOOK] Rode: npm run memory:derive" -ForegroundColor Red
    Write-Host "[POS HOOK] $memoryCheck" -ForegroundColor Red
    exit 1
}
Write-Host "[POS HOOK] OK - sem drift de memory." -ForegroundColor Green

Write-Host "[POS HOOK] 2/3 Validando manifests de capabilities (memory:lint)..." -ForegroundColor Yellow

$memoryLint = npm run --silent memory:lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[POS HOOK] FAIL - Erros em manifests de capabilities." -ForegroundColor Red
    Write-Host "[POS HOOK] Rode: npm run memory:lint (warnings são info, errors bloqueiam)" -ForegroundColor Red
    Write-Host "[POS HOOK] $memoryLint" -ForegroundColor Red
    exit 1
}
Write-Host "[POS HOOK] OK - manifests validos." -ForegroundColor Green

Write-Host "[POS HOOK] 3/3 Executando pos-test-all.ps1..." -ForegroundColor Yellow

$suite = Join-Path (Split-Path $PSScriptRoot -Parent) "scripts/pos/pos-test-all.ps1"
& $suite

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[POS HOOK] FAIL - Commits que tocam docs/ ou AGENTS.md exigem POS integrity." -ForegroundColor Red
    Write-Host "[POS HOOK] Corrija os erros acima e tente novamente." -ForegroundColor Red
    exit 1
}

Write-Host "[POS HOOK] PASS - POS integridade verificada com sucesso." -ForegroundColor Green
exit 0
