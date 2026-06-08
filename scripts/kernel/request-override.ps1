# request-override.ps1 — cria um pedido de override para arquivo imutável
param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,

    [Parameter(Mandatory=$true)]
    [string]$Reason
)

$ErrorActionPreference = 'Stop'

# Determinar raiz do projeto (dois níveis acima deste script)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDir = Split-Path -Parent $scriptDir
$root = Split-Path -Parent $toolsDir

$kernelPath = Join-Path $root 'docs\obsidian\kernel'
$overridesDir = Join-Path $kernelPath 'overrides'
$immutableRegistry = Join-Path $kernelPath 'IMMUTABLE_KERNEL.md'

# Normalizar caminho relativo
if ($FilePath.StartsWith($root)) {
    $relPath = $FilePath.Substring($root.Length + 1)
} else {
    $relPath = $FilePath
}

# Verificar se arquivo existe
$fullPath = Join-Path $root $relPath
if (-not (Test-Path $fullPath)) {
    Write-Error "Arquivo não encontrado: $fullPath"
    exit 1
}

# Verificar se arquivo está no registry imutável (warning only)
$registryEntry = $null
$lines = Get-Content $immutableRegistry -Encoding UTF8
foreach ($line in $lines) {
    if ($line -match '^\|.*\|') {
        $parts = $line -split '\|' | ForEach-Object { $_.Trim() }
        if ($parts.Count -ge 4 -and $parts[1] -eq $relPath) {
            $registryEntry = $parts
            break
        }
    }
}
if (-not $registryEntry) {
    Write-Warning "Arquivo $relPath não encontrado no IMMUTABLE_KERNEL.md. Override ainda assim será criado, mas é recomendável registrar o hash primeiro."
}

# Obter hash atual (não utilizado no override, mas pode ser útil)
function Get-FileHashSHA256($filePath) {
    $stream = [System.IO.File]::OpenRead($filePath)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stream)
    $stream.Close()
    return ([BitConverter]::ToString($hash).Replace('-','')).ToLower()
}
$currentHash = Get-FileHashSHA256 $fullPath

# Obter diff se houver git (não falhar se não houver repositório ou commits)
$diffLines = @()
try {
    $gitOutput = git diff HEAD -- $relPath 2>$null
    if ($gitOutput) {
        $diffLines = $gitOutput -split "`n"
    }
} catch {
    # Silently ignore git errors (no repo, no commits, etc.)
}

# Gerar nome do arquivo de override
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$slug = ($Reason -replace '\s+','_' -replace '[^a-zA-Z0-9_]','') -replace '_+','_'
$overrideFileName = "$timestamp`_$slug.md"
$overridePath = Join-Path $overridesDir $overrideFileName

# Obter author
$author = git config user.name 2>$null
if (-not $author) { $author = $env:USERNAME }

# Construir conteúdo linha a linha
$content = "---`n"
$content += "title: `"Override: $Reason`"`n"
$content += "date: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')`n"
$content += "author: $author`n"
$content += "status: PENDING`n"
$content += "files:`n"
$content += "  - path: $relPath`n"
$content += "    reason: `"$Reason`"`n"
$content += "impact: []`n"
$content += "rollback: []`n"
$content += "diff:`n"

if ($diffLines.Count -gt 0) {
    foreach ($line in $diffLines) {
        $escaped = $line -replace '`','``'
        $content += "  - ``" + $escaped + "``" + "`n"
    }
} else {
    $content += "  - (no diff detected; file may not be modified yet)`n"
}

$content += "`n<!--`n"
$content += "Após aprovação, altere status para APPROVED e registre em kernel/log.md.`n"
$content += "Para aplicar, modifique o arquivo conforme necessário.`n"
$content += "-->`n"

# Criar diretório se necessário
if (-not (Test-Path $overridesDir)) {
    New-Item -ItemType Directory -Force -Path $overridesDir | Out-Null
}

# Salvar override
$content | Out-File -FilePath $overridePath -Encoding UTF8
Write-Host "Override request created: $overridePath" -ForegroundColor Cyan

# Perguntar aprovação
$approve = Read-Host "Aprovar este override agora? (s/N)"
if ($approve -eq 's' -or $approve -eq 'S') {
    # Atualizar status no arquivo
    (Get-Content $overridePath) -replace 'status: PENDING', 'status: APPROVED' | Set-Content $overridePath -Encoding UTF8
    Write-Host "Override aprovado. Status atualizado." -ForegroundColor Green

    # Registrar no log
    $logPath = Join-Path $kernelPath 'log.md'
    $logEntry = "## [$(Get-Date -Format 'yyyy-MM-dd HH:mm')] OVERRIDE_APPROVED | $relPath | $Reason"
    Add-Content -Path $logPath -Value $logEntry -Encoding UTF8
    Write-Host "Log atualizado: $logPath"
} else {
    Write-Host "Override mantido como PENDING. Você pode aprovar mais tarde editando o arquivo." -ForegroundColor Yellow
}

Write-Host "`nPróximos passos:" -ForegroundColor White
Write-Host "1. Se ainda não modificou, edite $relPath conforme necessário." -ForegroundColor Gray
Write-Host "2. Rode .\scripts\validate-kernel.ps1 para verificar." -ForegroundColor Gray
Write-Host "3. Commit suas mudanças (git commit)." -ForegroundColor Gray
