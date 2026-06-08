# load-skill.ps1 — Lazy skill loader with manifest enforcement
param(
    [Parameter(Mandatory=$true)]
    [string]$SkillName
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Determine current capability from env or task context
$capability = $env:TASK_CAPABILITY
if (-not $capability) {
    Write-Error "Environment variable TASK_CAPABILITY not set. Use Set-TaskContext.ps1 first or set manually."
    exit 1
}

# Load manifest
$manifestPath = Join-Path $root ".opencode/capabilities/$capability.manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "Manifest not found for capability: $capability at $manifestPath"
    exit 1
}
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# Check if skill is allowed
if ($manifest.allowed_skills -notcontains $SkillName) {
    Write-Error "Skill '$SkillName' is NOT allowed for capability '$capability' per manifest."
    Write-Host "Allowed skills: $($manifest.allowed_skills -join ', ')" -ForegroundColor Yellow
    exit 1
}

# Locate skill in runtime directory
$skillDir = Join-Path $root ".opencode/ag-kit-main/.agent/skills/$SkillName"
$skillFile = Join-Path $skillDir "SKILL.md"
if (-not (Test-Path $skillFile)) {
    # Try reference dir as fallback (deprecated)
    $skillDirRef = Join-Path $root ".opencode/skills/$SkillName"
    $skillFileRef = Join-Path $skillDirRef "SKILL.md"
    if (Test-Path $skillFileRef) {
        $skillFile = $skillFileRef
        Write-Warning "Using skill from reference directory (use runtime path)."
    } else {
        Write-Error "Skill file not found: $skillFile"
        exit 1
    }
}

# Read content and estimate tokens
$content = Get-Content $skillFile -Raw -Encoding UTF8
$chars = $content.Length
$tokens = [math]::Ceiling($chars / 4)

# Log retrieval
$logEntry = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    file = $skillFile.Replace($root + '\','')
    tokens = $tokens
    capability = $capability
    skill = $SkillName
} | ConvertTo-Json -Compress
Add-Content -Path (Join-Path $root ".opencode/retrieval.log") -Value $logEntry -Encoding UTF8

# Output content to stdout for agent to consume
Write-Output $content
