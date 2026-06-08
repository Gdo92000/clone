$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$skills = @(
    'react-best-practices','frontend-design','tailwind-patterns',
    'api-patterns','nodejs-best-practices','testing-patterns',
    'architecture','database-design','systematic-debugging','vulnerability-scanner'
)
foreach ($s in $skills) {
    $f = Join-Path $root ".opencode/ag-kit-main/.agent/skills/$s/SKILL.md"
    if (Test-Path $f) {
        $chars = (Get-Content $f -Raw).Length
        $tokens = [math]::Ceiling($chars / 4)
        Write-Output "$s`: $tokens tokens"
    }
}
