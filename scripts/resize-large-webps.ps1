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

$maxWidth = 1600
$totalBefore = 0
$totalAfter = 0
$resized = 0

foreach ($dir in $dirs) {
    $fullDir = Join-Path 'd:\Sarees' $dir
    if (-not (Test-Path $fullDir)) { continue }

    $files = Get-ChildItem -Path $fullDir -File -Filter *.webp | Where-Object { $_.Length -gt 400000 }

    foreach ($file in $files) {
        $dimsLine = & ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $file.FullName 2>&1
        $parts = $dimsLine -split ','
        if ($parts.Length -lt 2) { continue }
        $w = [int]$parts[0]
        $h = [int]$parts[1]
        if ($w -le $maxWidth) { continue }

        $tmpPath = $file.FullName + '.tmp.webp'
        $newH = [math]::Round($h * $maxWidth / $w)
        # libwebp requires even dimensions in some pipelines; use scale filter that auto-handles
        & ffmpeg -y -loglevel error -i $file.FullName -vf "scale=${maxWidth}:-1" -c:v libwebp -quality 82 -compression_level 6 -preset photo $tmpPath 2>&1 | Out-Null

        if (Test-Path $tmpPath) {
            $before = $file.Length
            $after = (Get-Item $tmpPath).Length
            Move-Item -Force -Path $tmpPath -Destination $file.FullName
            $totalBefore += $before
            $totalAfter += $after
            $resized++
            $pct = [math]::Round((1 - $after / $before) * 100, 0)
            Write-Output ("{0,-50} {1,4}x{2,-4} -> {3,4}x{4,-4}  {5,6:N0} KB -> {6,6:N0} KB ({7}% smaller)" -f $file.Name, $w, $h, $maxWidth, $newH, ($before/1024), ($after/1024), $pct)
        }
    }
}

Write-Output ""
Write-Output ("Resized: {0} files" -f $resized)
Write-Output ("Before: {0:N1} MB  After: {1:N1} MB" -f ($totalBefore/1MB), ($totalAfter/1MB))
