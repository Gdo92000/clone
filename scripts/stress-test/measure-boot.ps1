# measure-boot.ps1 — Measures actual bootstrap token consumption
param()

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$profilePath = Join-Path $root ".opencode/profile.json"

$profile = Get-Content $profilePath -Raw | ConvertFrom-Json
$activeProfile = $profile.profile

$bootFiles = $profile.profiles.$activeProfile.bootstrap

Write-Host "=== BOOT TOKEN MEASUREMENT ==="
Write-Host "Profile: $activeProfile"
Write-Host ""

$totalTokens = 0
$fileDetails = @()

foreach ($file in $bootFiles) {
    $path = Join-Path $root $file
    if (Test-Path $path) {
        $chars = (Get-Content $path -Raw).Length
        $tokens = [math]::Ceiling($chars / 4)
        $totalTokens += $tokens
        $fileDetails += [PSCustomObject]@{
            File = $file
            Chars = $chars
            Tokens = $tokens
        }
        Write-Host "$file`: $tokens tokens ($chars chars)"
    } else {
        Write-Host "$file`: MISSING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total bootstrap tokens: $totalTokens"

# Compare to limit
$limit = $profile.profiles.$activeProfile.max_init_tokens
if ($limit) {
    $pct = [math]::Round($totalTokens / $limit * 100, 1)
    Write-Host "Profile limit: $limit tokens ($pct% used)"
    if ($totalTokens -gt $limit) {
        Write-Host "[FAIL] Exceeds limit!" -ForegroundColor Red
        exit 1
    }
}

$result = [PSCustomObject]@{
    Profile = $activeProfile
    TotalTokens = $totalTokens
    Limit = $limit
    Files = $fileDetails
} | ConvertTo-Json -Depth 3

$outDir = Join-Path $root "reports\cognitive-stress-test"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir "boot-measurement-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$result | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Results saved to: $outFile"
