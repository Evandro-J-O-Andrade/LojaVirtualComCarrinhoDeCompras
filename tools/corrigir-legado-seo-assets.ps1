param([string]$Root = "D:\LojaVirtualComCarrinhoDeCompras")

# Correcoes pontuais no legado: dominio SEO morto, og:url de dominio
# inexistente, canonical apontando para pagina inexistente e referencias de
# midia para arquivos que nunca existiram. Nao altera estrutura nem conteudo.

$erros = 0
function Trocar([string]$arquivo, [string]$velho, [string]$novo) {
  if (-not (Test-Path -LiteralPath $arquivo)) { Write-Output "  [SKIP] $arquivo"; return }
  $c = [System.IO.File]::ReadAllText($arquivo)
  if (-not $c.Contains($velho)) { return }
  $n = ([regex]::Matches($c, [regex]::Escape($velho))).Count
  $c = $c.Replace($velho, $novo)
  [System.IO.File]::WriteAllText($arquivo, $c, (New-Object System.Text.UTF8Encoding $false))
  Write-Output ("  {0,-34} x{1,-3} {2} -> {3}" -f (Split-Path $arquivo -Leaf), $n, $velho, $novo)
}

Write-Output '== 1. Dominio SEO (angelcosmeticos.netlify.app responde 404) =='
foreach ($f in @('index.html','assets/html/eventos.html','assets/html/pdf.html','assets/html/produtos.html','assets/html/contato.html','assets/html/empresa.html','assets/html/ver-produtos.html')) {
  Trocar (Join-Path $Root $f) 'angelcosmeticos.netlify.app' 'angelconsmeticos.netlify.app'
}
Write-Output '== 2. Dominio inexistente (angelcosmeticos.com.br nao resolve) =='
Trocar (Join-Path $Root 'assets/html/ver-produtos.html') 'angelcosmeticos.com.br/eventos.html' 'angelconsmeticos.netlify.app/assets/html/ver-produtos.html'
Write-Output '== 3. Canonical para pagina inexistente =='
Trocar (Join-Path $Root 'assets/html/pdf.html') 'angelconsmeticos.netlify.app/catalogos.html' 'angelconsmeticos.netlify.app/assets/html/pdf.html'
Write-Output '== 4. Referencias de midia inexistentes -> arquivos reais =='
Trocar (Join-Path $Root 'index.html') '/assets/img/favicon-96x96.png' '/assets/img/interface/favicon-32x32.png'
Trocar (Join-Path $Root 'index.html') '/assets/img/android-icon-192x192.png' '/assets/img/interface/android-chrome-192x192.png'
Trocar (Join-Path $Root 'assets/html/eventos.html') '/assets/img/favicon-96x96.png' '/assets/img/interface/favicon-32x32.png'
Trocar (Join-Path $Root 'assets/html/eventos.html') '/assets/img/favicon.png' '/assets/img/interface/favicon-32x32.png'
Trocar (Join-Path $Root 'assets/html/pdf.html') '/assets/img/android-icon.png' '/assets/img/interface/android-chrome-192x192.png'
Trocar (Join-Path $Root 'assets/html/produtos.html') '/assets/img/eventos-banner.jpg' '/assets/img/banners/banner-1.png'
Trocar (Join-Path $Root 'assets/html/ver-produtos.html') '/assets/img/eventos-banner.jpg' '/assets/img/banners/banner-1.png'
Trocar (Join-Path $Root 'assets/html/ver-produtos.html') '/assets/img/og-produto.jpg' '/assets/img/produtos/produto-1.jpg'
