$ErrorActionPreference = 'Stop'

$dirs = @(
    'public\photos',
    'public\Byweaves',
    'public\product',
    'public\story',
    'public\bestsellers',
    'public\homebanner',
    'public\newarrivals',
    'public\images',
    'public\brand'
)

$totalOrig = 0
$totalNew = 0
$converted = 0
$skipped = 0

foreach ($dir in $dirs) {
    $fullDir = Join-Path 'd:\Sarees' $dir
    if (-not (Test-Path $fullDir)) { continue }

    $files = Get-ChildItem -Path $fullDir -File | Where-Object {
        $_.Extension -match '^\.(png|jpg|jpeg)$' -and $_.Length -gt 200000
    }

    foreach ($file in $files) {
        $outPath = [System.IO.Path]::ChangeExtension($file.FullName, '.webp')
        if (Test-Path $outPath) {
            $skipped++
            continue
        }

        $hasAlpha = $file.Extension -eq '.png'
        $quality = if ($hasAlpha) { '85' } else { '82' }

        & ffmpeg -y -loglevel error -i $file.FullName -c:v libwebp -quality $quality -compression_level 6 -preset photo $outPath 2>&1 | Out-Null

        if (Test-Path $outPath) {
            $newSize = (Get-Item $outPath).Length
            $totalOrig += $file.Length
            $totalNew += $newSize
            $converted++
            $pct = [math]::Round((1 - $newSize / $file.Length) * 100, 0)
            Write-Output ("{0,-50} {1,6:N0} KB -> {2,6:N0} KB ({3}% smaller)" -f $file.Name, ($file.Length/1024), ($newSize/1024), $pct)
        }
    }
}

Write-Output ""
Write-Output "=== SUMMARY ==="
Write-Output ("Converted: {0} files  Skipped: {1}" -f $converted, $skipped)
Write-Output ("Original total: {0:N1} MB" -f ($totalOrig/1MB))
Write-Output ("WebP total:     {0:N1} MB" -f ($totalNew/1MB))
if ($totalOrig -gt 0) {
    Write-Output ("Savings:        {0:N0}%" -f ((1 - $totalNew/$totalOrig) * 100))
}
