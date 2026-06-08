$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$patternsDir = Join-Path $root "docs/obsidian/wiki/patterns"
if (Test-Path $patternsDir) {
    $files = Get-ChildItem -Path $patternsDir -Filter *.md -Recurse
    $totalTokens = 0
    foreach ($f in $files) {
        $totalTokens += [math]::Ceiling($f.Length / 4)
    }
    Write-Output "Patterns: $($files.Count) files, $totalTokens tokens"
} else {
    Write-Output "Patterns dir not found"
}

$decisionsDir = Join-Path $root "docs/obsidian/wiki/decisions"
if (Test-Path $decisionsDir) {
    $files = Get-ChildItem -Path $decisionsDir -Filter *.md -Recurse
    $totalTokens = 0
    foreach ($f in $files) {
        $totalTokens += [math]::Ceiling($f.Length / 4)
    }
    Write-Output "Decisions: $($files.Count) files, $totalTokens tokens"
}
