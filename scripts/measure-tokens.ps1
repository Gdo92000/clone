# measure-tokens.ps1 — Estima tokens de um arquivo (chars/4)
param(
    [Parameter(Mandatory=$true)]
    [string]$Path
)

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$full = Join-Path $root $Path
if (-not (Test-Path $full)) {
    Write-Error "File not found: $full"
    exit 1
}
$chars = (Get-Content $full -Raw).Length
$tokens = [math]::Ceiling($chars / 4)
Write-Output $tokens
