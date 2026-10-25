param(
  [string]$Root = "D:\LojaVirtualComCarrinhoDeCompras"
)

# Verifica integridade das referencias de midia do runtime.
# Resolve nomes com espaco truncando a cada espaco e testando o sufixo mais longo
# que exista de fato em assets/ ou web/public/assets/.

$srcFiles = @()
$srcFiles += Get-ChildItem "$Root\web\src" -Recurse -File -Include '*.ts', '*.tsx', '*.css' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\html" -File -Filter '*.html' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\js" -File -Filter '*.js' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\css" -File -Filter '*.css' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\web\public" -File -ErrorAction SilentlyContinue
$srcFiles += Get-Item "$Root\index.html" -ErrorAction SilentlyContinue

$raizA = "$Root\assets"
$raizB = "$Root\web\public\assets"

$existentes = @{}
foreach ($r in @($raizA, $raizB)) {
  Get-ChildItem $r -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Replace($r, '').TrimStart('\').Replace('\', '/')
    $existentes[$rel.ToLower()] = $true
  }
}

function Existe([string]$rel) {
  return $existentes.ContainsKey($rel.ToLower())
}

$quebradas = @()
$totalRefs = 0
foreach ($f in $srcFiles) {
  if (-not $f) { continue }
  $c = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
  if ($null -eq $c) { continue }
  foreach ($m in [regex]::Matches($c, '/assets/(img|video)/([^''""''`)>]+)')) {
    $totalRefs++
    $capturado = $m.Groups[2].Value.TrimEnd('.', ',', ';')
    if ($capturado -match '\$\{' -or $capturado -match '\*') { continue }

    $candidatos = @($capturado)
    $partes = $capturado -split ' '
    for ($i = 1; $i -lt $partes.Count; $i++) {
      $candidatos += ($partes[$i..($partes.Count - 1)] -join ' ')
    }
    $achou = $false
    foreach ($cd in $candidatos) {
      if (Existe "$($m.Groups[1].Value)/$cd") { $achou = $true; break }
    }
    if (-not $achou) {
      $quebradas += [PSCustomObject]@{
        Arquivo  = $f.FullName.Replace($Root, '')
        Caminho  = "$($m.Groups[1].Value)/$capturado"
        ExisteAlgumComEsseNome = ($existentes.Keys | Where-Object { $_ -like "*$($capturado.ToLower())" }).Count
      }
    }
  }
}

Write-Output "REFERENCIAS DE MIDIA VERIFICADAS: $totalRefs"
Write-Output "QUEBRADAS: $($quebradas.Count)"
$quebradas | Group-Object Caminho | Sort-Object Count -Descending | ForEach-Object {
  $g = $_.Group[0]
  $existe = if ($g.ExisteAlgumComEsseNome -gt 0) { 'EXISTE com outro caminho' } else { 'arquivo inexistente' }
  Write-Output ("  {0,-46} x{1,-3} {2}" -f $_.Name, $_.Count, $existe)
  Write-Output ("      em: {0}" -f (($_.Group | Select-Object -ExpandProperty Arquivo -Unique) -join ', '))
}
