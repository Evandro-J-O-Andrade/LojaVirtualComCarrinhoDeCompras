param([switch]$Execute)
$root = "D:\LojaVirtualComCarrinhoDeCompras"
$base = "$root\assets-importacao\catalogo"
$inv = Import-Csv "$root\docs\inventario-midias.csv"
$log = @()
$i = 0
foreach ($r in $inv) {
  $src = $r.Path
  if (-not (Test-Path -LiteralPath $src)) { continue }
  $ext = $r.Ext
  $folder = "$base\outros"
  if ($ext -in '.mp4','.mov','.avi','.webm') { $folder = "$base\banners" }
  elseif ($r.Name -match 'banner') { $folder = "$base\banners" }
  elseif ($r.Name -match 'categ') { $folder = "$base\categorias" }
  elseif ($r.Name -match 'logo|marca') { $folder = "$base\fornecedores" }
  else { $folder = "$base\produtos\sem-fornecedor" }
  New-Item -ItemType Directory -Path $folder -Force | Out-Null
  $slug = ($r.Name -replace '[^a-zA-Z0-9]','_').ToLower()
  $slug = $slug -replace '_+','_'
  $destName = "$($r.Hash.Substring(0,8))_$slug$ext"
  $dest = "$folder\$destName"
  $j = 1
  while (Test-Path -LiteralPath $dest) { $dest = "$folder\$($r.Hash.Substring(0,8))_${j}_$slug$ext"; $j++ }
  $origHash = (Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash
  if ($Execute) {
    Copy-Item -LiteralPath $src -Destination $dest -Force
    $newHash = (Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash
    $status = if ($newHash -eq $origHash) { "ok" } else { "hash_mismatch" }
  } else {
    $newHash = ""
    $status = "dry-run"
  }
  $log += [PSCustomObject]@{
    SHA256Original = $origHash
    CaminhoOriginal = $src
    NovoCaminho = $dest
    Tipo = (Split-Path $folder -Leaf)
    Confianca = "baixa"
    Status = $status
  }
  $i++
}
$log | Export-Csv -Path "$root\docs\manifesto-organizacao.csv" -NoTypeInformation -Encoding UTF8
Write-Output "processed $i; execute=$Execute"
