$ErrorActionPreference = 'Stop'

$root = 'd:\Sarees'
$publicDir = Join-Path $root 'public'

$webpSet = @{}
Get-ChildItem -Path $publicDir -Recurse -File -Filter *.webp | ForEach-Object {
    $rel = $_.FullName.Substring($publicDir.Length).Replace('\', '/')
    $webpSet[$rel.ToLower()] = $true
}

Write-Output ("Found {0} webp files" -f $webpSet.Count)

$codeDirs = @(
    (Join-Path $root 'app'),
    (Join-Path $root 'components')
)

$codeFiles = $codeDirs | ForEach-Object {
    Get-ChildItem -Path $_ -Recurse -File -Include *.tsx,*.ts
}

$pathPattern = '(/(?:photos|Byweaves|product|story|bestsellers|homebanner|newarrivals|images|brand)/[^''")\s]+?\.)(png|jpg|jpeg)'

$filesChanged = 0
$refsChanged = 0

foreach ($file in $codeFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ([string]::IsNullOrEmpty($content)) { continue }

    $newContent = [regex]::Replace($content, $pathPattern, {
        param($m)
        $webpPath = ($m.Groups[1].Value + 'webp')
        $checkPath = [Uri]::UnescapeDataString($webpPath).ToLower()
        if ($webpSet.ContainsKey($checkPath)) {
            $script:refsChanged++
            return $webpPath
        }
        return $m.Value
    })

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
        $filesChanged++
        Write-Output ("  updated: {0}" -f $file.FullName.Substring($root.Length + 1))
    }
}

Write-Output ""
Write-Output ("Files changed: {0}" -f $filesChanged)
Write-Output ("References rewritten: {0}" -f $refsChanged)
