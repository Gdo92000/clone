$posPath = Join-Path $PSScriptRoot '..\docs\obsidian\project-operating-system' -Resolve
$files = Get-ChildItem -LiteralPath $posPath -Recurse -File -Filter '*.md'
$results = @()

foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    if ($null -eq $c) { $c = '' }
    $t = [math]::Ceiling($c.Length / 4)
    $rel = $f.FullName.Replace($posPath + '\', '')
    $results += [PSCustomObject]@{File=$rel; Tokens=$t; Chars=$c.Length}
}

$results | Sort-Object Tokens -Descending | Format-Table -AutoSize

Write-Host "=== COGNITION COST REPORT ==="
$total = ($results | Measure-Object -Property Tokens -Sum).Sum
$totalChars = ($results | Measure-Object -Property Chars -Sum).Sum
Write-Host "Total: $($results.Count) files, $totalChars chars, ~$total tokens"

$domains = $results | ForEach-Object {
    $parts = $_.File.Split('\')
    $domain = if ($parts.Count -gt 1) { $parts[0] } else { 'root' }
    [PSCustomObject]@{Domain=$domain; Tokens=$_.Tokens; Chars=$_.Chars}
} | Group-Object Domain | ForEach-Object {
    [PSCustomObject]@{Domain=$_.Name; Files=$_.Count; Tokens=($_.Group | Measure-Object -Property Tokens -Sum).Sum; Chars=($_.Group | Measure-Object -Property Chars -Sum).Sum}
} | Sort-Object Tokens -Descending

Write-Host ""
Write-Host "=== BY DOMAIN ==="
$domains | Format-Table -AutoSize

$bootExpress = @('root\_index.md','root\CURRENT_STATE.md')
$bootFull = $bootExpress + @('root\MEMORY.md')

$expressTokens = 0
$fullTokens = 0
foreach ($b in $bootExpress) {
    $match = $results | Where-Object { $_.File -like "*$($b -replace 'root\\\\','')*" }
    if ($match) { $expressTokens += ($match | Measure-Object -Property Tokens -Sum).Sum }
}
foreach ($b in $bootFull) {
    $match = $results | Where-Object { $_.File -like "*$($b -replace 'root\\\\','')*" }
    if ($match) { $fullTokens += ($match | Measure-Object -Property Tokens -Sum).Sum }
}

Write-Host "=== BOOT COST ==="
$agentsTokens = (Get-Content (Join-Path $PSScriptRoot '..\AGENTS.md') -Raw).Length / 4
Write-Host "AGENTS.md: ~$([math]::Ceiling($agentsTokens)) tokens"
Write-Host "POS _index.md: ~$($results | Where-Object {$_.File -eq '_index.md'} | Select-Object -ExpandProperty Tokens) tokens"
Write-Host "CURRENT_STATE.md: ~$($results | Where-Object {$_.File -eq 'CURRENT_STATE.md'} | Select-Object -ExpandProperty Tokens) tokens"
Write-Host "MEMORY.md: ~$($results | Where-Object {$_.File -eq 'MEMORY.md'} | Select-Object -ExpandProperty Tokens) tokens"
Write-Host ""
$idxTokens = ($results | Where-Object {$_.File -eq '_index.md'}).Tokens
$csTokens = ($results | Where-Object {$_.File -eq 'CURRENT_STATE.md'}).Tokens
$memTokens = ($results | Where-Object {$_.File -eq 'MEMORY.md'}).Tokens
$expressTotal = [math]::Ceiling($agentsTokens) + $idxTokens + $csTokens
$fullTotal = $expressTotal + $memTokens
Write-Host "Express boot: ~$expressTotal tokens"
Write-Host "Full boot: ~$fullTotal tokens"

$top10 = $results | Sort-Object Tokens -Descending | Select-Object -First 10
Write-Host ""
Write-Host "=== TOP 10 MOST EXPENSIVE FILES ==="
$top10 | Format-Table -AutoSize

$idxFiles = $results | Where-Object { $_.File -like '*_index.md' }
$idxTotal = ($idxFiles | Measure-Object -Property Tokens -Sum).Sum
$idxPct = [math]::Round(($idxTotal / $total) * 100, 1)
Write-Host "=== INDEX EFFICIENCY ==="
Write-Host "Index files: $($idxFiles.Count), ~$idxTotal tokens ($idxPct% of total)"
Write-Host "Content files: $($results.Count - $idxFiles.Count), ~$($total - $idxTotal) tokens ($([math]::Round(100 - $idxPct, 1))% of total)"
