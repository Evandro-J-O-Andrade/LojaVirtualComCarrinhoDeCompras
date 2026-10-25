param(
  [string]$DestinoRaiz = "D:\Backups\LojaVirtualComCarrinhoDeCompras"
)

$ErrorActionPreference = "Stop"

$origem = Split-Path $PSScriptRoot -Parent
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$destino = Join-Path $DestinoRaiz "backup-$timestamp"

Write-Host "Origem:  $origem"
Write-Host "Destino: $destino"
Write-Host ""

if (-not (Test-Path $DestinoRaiz)) {
  New-Item -ItemType Directory -Path $DestinoRaiz -Force | Out-Null
}
New-Item -ItemType Directory -Path $destino -Force | Out-Null

$excluirDirs = @(
  "node_modules",
  "web\node_modules",
  "web\dist",
  ".next",
  "coverage",
  ".turbo"
)

$xd = $excluirDirs -join " "

& robocopy $origem $destino /E /XJ /R:3 /W:5 /COPY:DAT /DCOPY:T /XD $excluirDirs /LOG+:$destino\backup-log.txt

$code = $LASTEXITCODE
if ($code -ge 8) {
  Write-Error "robocopy retornou código $code. Verifique backup-log.txt"
  exit $code
}

Write-Host ""
Write-Host "Cópia concluída com código robocopy: $code"
Write-Host "Log: $destino\backup-log.txt"

$arquivos = (Get-ChildItem $destino -Recurse -File | Measure-Object).Count
$pastas   = (Get-ChildItem $destino -Recurse -Directory | Measure-Object).Count
$tamanho  = [math]::Round(((Get-ChildItem $destino -Recurse -File | Measure-Object Length -Sum).Sum / 1GB), 2)

Write-Host "Arquivos: $arquivos | Pastas: $pastas | Tamanho aprox: $tamanho GB"
