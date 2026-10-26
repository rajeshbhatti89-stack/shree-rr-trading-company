$jsPath = "d:\project\shree_rr_trading_company\public\payroll\payroll.js"
$jsDir = "d:\project\shree_rr_trading_company\public\payroll\js"
$htmlPath = "d:\project\shree_rr_trading_company\public\payroll\index.html"

if (-not (Test-Path -Path $jsDir)) {
    New-Item -ItemType Directory -Path $jsDir | Out-Null
}

$lines = Get-Content -Path $jsPath
$currentSection = "00-globals"
$sections = @{}
$sections[$currentSection] = @()

foreach ($line in $lines) {
    if ($line -match "^// (\d+)\.\s+(.*)$") {
        $num = $matches[1].PadLeft(2, '0')
        $name = $matches[2].ToLower() -replace "[^a-z0-9]+", "-" -replace "^-", "" -replace "-$", ""
        $currentSection = "$num-$name"
        $sections[$currentSection] = @($line)
    } else {
        $sections[$currentSection] += $line
    }
}

$scriptTags = @()
$keys = $sections.Keys | Sort-Object
foreach ($key in $keys) {
    $filename = "$key.js"
    $filepath = Join-Path $jsDir $filename
    $sections[$key] | Set-Content -Path $filepath -Encoding UTF8
    Write-Host "Created $filename"
    $scriptTags += "<script src=`"js/$filename`"></script>"
}

Rename-Item -Path $jsPath -NewName "payroll.js.backup"

$htmlContent = Get-Content -Path $htmlPath -Raw
$scriptTagsStr = $scriptTags -join "`n  "
$htmlContent = $htmlContent -replace '<script src="payroll\.js".*?></script>', $scriptTagsStr
$htmlContent | Set-Content -Path $htmlPath -Encoding UTF8
Write-Host "Updated index.html"
