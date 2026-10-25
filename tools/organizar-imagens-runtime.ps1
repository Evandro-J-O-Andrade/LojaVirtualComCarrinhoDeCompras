param(
  [switch]$Execute,
  [string]$Root = "D:\LojaVirtualComCarrinhoDeCompras"
)

$ErrorActionPreference = 'Stop'

# Taxonomia de midias do runtime: substitui as pastas chapadas assets/img e
# web/public/assets/img por pastas por linha de negocio / tipo de conteudo.
# As duas raizes compartilham o mesmo espaco de URL /assets/img/..., portanto
# uma unica regra de reescrita vale para o legado (assets/) e para o React
# (web/public/).

$roots = @(
  @{ Path = "$Root\assets\img";              Raiz = 'assets/img' },
  @{ Path = "$Root\web\public\assets\img";  Raiz = 'web/public/assets/img' }
)

$videoRoots = @(
  @{ Path = "$Root\assets\video";             Raiz = 'assets/video' },
  @{ Path = "$Root\web\public\assets\video"; Raiz = 'web/public/assets/video' }
)

# Ordem importa: a primeira regra que casar vence.
$regras = @(
  @{ Pasta = 'interface';     Padrao = '^(favicon|android-chrome|apple|apple-touch|google\.png|menu\.png|carrinho|site\.webmanifest)' }
  @{ Pasta = 'categorias';    Padrao = '^categoria' }
  @{ Pasta = 'social';        Padrao = '^(cliente-|segundoLugar|WhatsApp Image|Instagram)' }
  @{ Pasta = 'eventos';       Padrao = '^(evento|eventr|chamadaeventos)' }
  @{ Pasta = 'banners';       Padrao = '^(banner|baner-|banser|cosmetics|divulga|Intro-site-new)' }
  @{ Pasta = 'produtos';      Padrao = '^(produto-|produto_|galeria-|image_2026)' }
  @{ Pasta = 'marcas';        Padrao = '^(marca-|logomarykay)' }
  @{ Pasta = 'casa';          Padrao = '(cama|mesa|banho|toalha|edredom|lencol|frontalha)' }
  @{ Pasta = 'moda';          Padrao = '(lingerie|moda|vestido|blusa|calca|saia|regata|bolsa|sandalia|sapato|roupa|meia|moda)' }
  @{ Pasta = 'beleza';        Padrao = '(AVON|EUDORA|HINODE|MARY_KAY|marykay|mary-kay|base_|eudora_|batom|baton|creme|gel|shampoo|condicionador|perfume|serum|mascara|protetor|creme|creme|demaquilante|corretivo|luminaria|batom|reme)' }
  @{ Pasta = 'marca';         Padrao = '^(logo|Logo|logosem|grasi|Grasi|grase|cinematic)' }
  @{ Pasta = 'institucional'; Padrao = '(apresen|certificado|Chamda|Chatbot|capa|pexe?ls|theLook|rostosemfundo|woman-|Captura|Capturar|Screenshot|lototeste|site\.webmanifest)' }
  @{ Pasta = 'outros';        Padrao = '.*' }
)

$regrasVideo = @(
  @{ Pasta = 'sessao-maquiagem'; Padrao = '(sess.oMaquiagem|maquiagem)' }
  @{ Pasta = 'skincare';         Padrao = '(skincare|skinCare)' }
  @{ Pasta = 'outros';           Padrao = '.*' }
)

function Classificar([string]$nome, $tabela) {
  foreach ($r in $tabela) {
    if ($nome -match $r.Padrao) { return $r.Pasta }
  }
  return 'outros'
}

# ---------------------------------------------------------------- 1. plano
$plano = @()

foreach ($r in $roots) {
  if (-not (Test-Path -LiteralPath $r.Path)) { continue }
  foreach ($f in Get-ChildItem -LiteralPath $r.Path -File) {
    $cat = Classificar $f.Name $regras
    $plano += [PSCustomObject]@{
      Tipo        = 'imagem'
      Raiz        = $r.Raiz
      Origem      = $f.FullName
      Nome        = $f.Name
      Pasta       = $cat
      Destino     = Join-Path $r.Path $cat $f.Name
      Bytes       = $f.Length
      Confianca   = if ($cat -eq 'outros') { 'baixa' } else { 'media' }
    }
  }
}

foreach ($r in $videoRoots) {
  if (-not (Test-Path -LiteralPath $r.Path)) { continue }
  foreach ($f in Get-ChildItem -LiteralPath $r.Path -File) {
    $cat = Classificar $f.Name $regrasVideo
    $plano += [PSCustomObject]@{
      Tipo        = 'video'
      Raiz        = $r.Raiz
      Origem      = $f.FullName
      Nome        = $f.Name
      Pasta       = $cat
      Destino     = Join-Path $r.Path $cat $f.Name
      Bytes       = $f.Length
      Confianca   = if ($cat -eq 'outros') { 'baixa' } else { 'media' }
    }
  }
}

Write-Output "PLANO: $($plano.Count) arquivos"
$plano | Group-Object Tipo, Pasta | Sort-Object Name | ForEach-Object {
  $bytes = ($_.Group | Measure-Object Bytes -Sum).Sum
  Write-Output ("  {0,-34} {1,4} arquivos  {2,9:N1} MB" -f $_.Name, $_.Count, ($bytes/1MB))
}

if (-not $Execute) {
  Write-Output ''
  Write-Output 'DRY-RUN: nenhuma alteracao aplicada. Use -Execute para mover e reescrever referencias.'
  $plano | Export-Csv -Path "$Root\docs\manifesto-imagens-runtime.csv" -NoTypeInformation -Encoding UTF8
  exit 0
}

# ------------------------------------------------- 2. mover os arquivos
foreach ($p in $plano) {
  if (Test-Path -LiteralPath $p.Origem) {
    $destDir = Split-Path $p.Destino -Parent
    if (-not (Test-Path -LiteralPath $destDir)) {
      New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    if (Test-Path -LiteralPath $p.Destino) {
      Remove-Item -LiteralPath $p.Destino -Force
    }
    Move-Item -LiteralPath $p.Origem -Destination $p.Destino -Force
  }
}

# ------------------------------------------------- 3. reescrever referencias
$srcFiles = @()
$srcFiles += Get-ChildItem "$Root\web\src" -Recurse -File -Include '*.ts', '*.tsx', '*.css' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\html" -File -Filter '*.html' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\js" -File -Filter '*.js' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\assets\css" -File -Filter '*.css' -ErrorAction SilentlyContinue
$srcFiles += Get-ChildItem "$Root\web\public" -File -ErrorAction SilentlyContinue
$srcFiles += Get-Item "$Root\index.html" -ErrorAction SilentlyContinue

$mapa = @{}
foreach ($p in $plano) {
  $prefixo = if ($p.Raiz -eq 'assets/img') { '/assets/img/' } else { '/assets/img/' }
  if ($p.Raiz -eq 'assets/video') { $prefixo = '/assets/video/' }
  if ($p.Raiz -eq 'web/public/assets/video') { $prefixo = '/assets/video/' }
  $mapa["$prefixo$($p.Nome)"] = "$prefixo$($p.Pasta)/$($p.Nome)"
}

$alterados = 0
$subs = 0
foreach ($f in $srcFiles) {
  if (-not $f) { continue }
  $conteudo = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
  if ($null -eq $conteudo) { continue }
  $novo = $conteudo
  foreach ($k in $mapa.Keys) {
    if ($novo.Contains($k)) {
      $n = ([regex]::Matches($novo, [regex]::Escape($k))).Count
      $novo = $novo.Replace($k, $mapa[$k])
      $subs += $n
    }
  }
  if ($novo -ne $conteudo) {
    $enc = if ($f.Extension -eq '.json') { 'utf8' } else { 'utf8' }
    [System.IO.File]::WriteAllText($f.FullName, $novo, (New-Object System.Text.UTF8Encoding $false))
    $alterados++
  }
}

Write-Output ''
Write-Output "MOVIDOS: $($plano.Count) | REFERENCIAS REESCRITAS: $subs em $alterados arquivos"

# ------------------------------------------------- 4. verificacao
$quebradas = @()
foreach ($f in $srcFiles) {
  if (-not $f) { continue }
  $c = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
  if ($null -eq $c) { continue }
  foreach ($m in [regex]::Matches($c, '/assets/(img|video)/([^''""''\)\s>`]+)')) {
    $rel = $m.Groups[1].Value + '/' + $m.Groups[2].Value
    if ($rel -match '\$\{') { continue }
    $p1 = Join-Path "$Root\assets" ($rel -replace '/', '\')
    $p2 = Join-Path "$Root\web\public\assets" ($rel -replace '/', '\')
    if (-not (Test-Path -LiteralPath $p1) -and -not (Test-Path -LiteralPath $p2)) {
      $quebradas += [PSCustomObject]@{ Arquivo = $f.Name; Caminho = $rel }
    }
  }
}
Write-Output "REFERENCIAS QUEBRADAS APOS MOVER: $($quebradas.Count)"
$quebradas | Group-Object Caminho | Sort-Object Count -Descending | Select-Object -First 25 | ForEach-Object {
  Write-Output ("  {0,-52} x{1}" -f $_.Name, $_.Count)
}

$plano | Export-Csv -Path "$Root\docs\manifesto-imagens-runtime.csv" -NoTypeInformation -Encoding UTF8
Write-Output 'MANIFESTO: docs/manifesto-imagens-runtime.csv'
