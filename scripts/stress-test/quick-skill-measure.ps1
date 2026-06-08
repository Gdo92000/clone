$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$skills = @(
    'react-best-practices','frontend-design','tailwind-patterns',
    'api-patterns','nodejs-best-practices','database-design',
    'testing-patterns','webapp-testing','tdd-workflow',
    'architecture','systematic-debugging','lint-and-validate',
    'vulnerability-scanner','red-team-tactics','code-review-checklist'
)
$totals = @{}
foreach ($s in $skills) {
    $f = "$root\.opencode\ag-kit-main\.agent\skills\$s\SKILL.md"
    if (Test-Path $f) {
        $chars = (Get-Content $f -Raw).Length
        $tokens = [math]::Ceiling($chars / 4)
        $totals[$s] = $tokens
        Write-Output "$s`: $tokens"
    } else {
        Write-Output "$s`: MISSING"
    }
}
$totalSum = ($totals.Values | Measure-Object -Sum).Sum
Write-Output "SUM of measured skills: $totalSum"
