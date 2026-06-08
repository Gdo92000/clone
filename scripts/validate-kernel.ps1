# validate-kernel.ps1 — Kernel Integrity Validation
# Verifica arquivos imutáveis contra registry e overrides
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$kernelPath = Join-Path $root 'docs\obsidian\kernel'
$immutableRegistry = Join-Path $kernelPath 'IMMUTABLE_KERNEL.md'

# Função: parse frontmatter YAML-like (linhas entre ---)
function Get-Frontmatter($filePath) {
    $lines = Get-Content $filePath -Encoding UTF8
    $inBlock = $false
    $dict = @{}
    foreach ($line in $lines) {
        if ($line -match '^---\s*$') {
            if (-not $inBlock) { $inBlock = $true; continue }
            else { break } # fim do frontmatter
        }
        if ($inBlock) {
            if ($line -match '^\s*([^:]+):\s*(.*)$') {
                $key = $Matches[1].Trim()
                $value = $Matches[2].Trim()
                $dict[$key] = $value
            }
        }
    }
    return $dict
}

# Função: calcular SHA256 de arquivo
function Get-FileHashSHA256($filePath) {
    $stream = [System.IO.File]::OpenRead($filePath)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stream)
    $stream.Close()
    return ([BitConverter]::ToString($hash).Replace('-','')).ToLower()
}

# Carregar registry de hashes de IMMUTABLE_KERNEL.md
$registry = @{}
$registryPath = $immutableRegistry
if (Test-Path $registryPath) {
    $lines = Get-Content $registryPath -Encoding UTF8
    foreach ($line in $lines) {
        if ($line -match '^\|.*\|') {
            # markdown table row: | file | hash | last | invariants |
            $parts = $line -split '\|' | ForEach-Object { $_.Trim() }
            if ($parts.Count -ge 4) {
                $file = $parts[1]
                $hash = $parts[2]
                if ($hash -ne 'SHA-256 (preencher pelo validator)') {
                    $registry[$file] = $hash
                }
            }
        }
    }
}

# Encontrar todos arquivos .md com immutable: true
$allMarkdown = Get-ChildItem -Path $root -Recurse -File -Filter *.md -ErrorAction SilentlyContinue
$immutableFiles = @()
foreach ($f in $allMarkdown) {
    $fm = Get-Frontmatter $f.FullName
    if ($fm.ContainsKey('immutable') -and $fm['immutable'] -eq 'true') {
        $rel = $f.FullName.Replace($root + '\','')
        $immutableFiles += $rel
    }
}

Write-Host "=== KERNEL INTEGRITY VALIDATION ==="
Write-Host "Total arquivos imutáveis encontrados: $($immutableFiles.Count)"
Write-Host "Registry entries: $($registry.Count)"
Write-Host ""

$breaches = @()
$newFiles = @()
$okFiles = @()
$overrideApproved = @()

$immutableKernelRelative = 'docs\obsidian\kernel\IMMUTABLE_KERNEL.md'
foreach ($file in $immutableFiles) {
    # Skip self-validation for the registry file itself
    if ($file -eq $immutableKernelRelative) {
        Write-Host "[SKIP] $file (self-validation)"
        continue
    }
    $fullPath = Join-Path $root $file
    if (-not (Test-Path $fullPath)) {
        Write-Warning "Arquivo imutável não encontrado: $file (removido?)"
        continue
    }
    $currentHash = Get-FileHashSHA256 $fullPath
    if (-not $registry.ContainsKey($file)) {
        $newFiles += $file
        Write-Warning "NOVO imutável não registrado: $file"
        continue
    }
    $registeredHash = $registry[$file]
    if ($currentHash -eq $registeredHash) {
        $okFiles += $file
        Write-Host "[OK] $file"
    } else {
        # Procurar override aprovado
        $overridesDir = Join-Path $kernelPath 'overrides'
        $overrideFound = $false
        if (Test-Path $overridesDir) {
            $overrideFiles = Get-ChildItem -Path $overridesDir -Filter *.md
            foreach ($ov in $overrideFiles) {
                $ovFm = Get-Frontmatter $ov.FullName
                if ($ovFm.ContainsKey('status') -and $ovFm['status'] -eq 'APPROVED') {
                    $affected = $ovFm['affected_files']
                    if ($affected) {
                        $list = $affected -split '\s*,\s*'
                        if ($list -contains $file) {
                            $overrideFound = $true
                            $overrideApproved += $file
                            Write-Host "[OVERRIDE] $file -> coberto por $($ov.Name)"
                            break
                        }
                    }
                }
            }
        }
        if (-not $overrideFound) {
            $breaches += $file
            Write-Host "[BREACH] $file (hash alterado, sem override)"
        }
    }
}

Write-Host ""
Write-Host "=== SUMMARY ==="
Write-Host "OK: $($okFiles.Count)"
Write-Host "OVERRIDE: $($overrideApproved.Count)"
Write-Host "Novos não registrados: $($newFiles.Count)"
Write-Host "BREACHES: $($breaches.Count)"

if ($breaches.Count -gt 0) {
    Write-Host ""
    Write-Host "!!! VIOLAÇÕES DETECTADAS !!!"
    $breaches | ForEach-Object { Write-Host "  - $_" }
    Write-Host "Consulte OVERRIDE_PROTOCOL.md para documentar e aprovar mudanças."
    exit 1
} elseif ($newFiles.Count -gt 0) {
    Write-Host ""
    Write-Host ">>> ACTION REQUIRED: Adicione os novos arquivos imutáveis em IMMUTABLE_KERNEL.md <<<"
    # Sugestão de linhas a adicionar
    $newFiles | ForEach-Object {
        $h = Get-FileHashSHA256 (Join-Path $root $_)
        Write-Host "| $_ | $h | - | - |"
    }
    exit 2
} else {
    Write-Host ""
    Write-Host "All immutable files are intact."
    exit 0
}
