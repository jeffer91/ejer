<# =========================================================
Nombre completo: fit-auditoria-lineas.ps1
Ruta o ubicación: scripts/fit-auditoria-lineas.ps1
Función o funciones:
- Contar líneas de archivos del proyecto Fitness Jeff.
- Detectar archivos que superen 600 líneas.
- Generar un reporte local en docs/03-REPORTE-LINEAS-GENERADO.txt.
Con qué se conecta:
- docs/03-AUDITORIA-VARIABLES-CARPETAS-LINEAS.md
========================================================= #>

$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")
$limite = 600
$salida = Join-Path $raiz "docs/03-REPORTE-LINEAS-GENERADO.txt"
$excluirCarpetas = @(".git", "node_modules", "android", "dist", "build", ".capacitor")
$extensiones = @(".html", ".css", ".js", ".json", ".cjs", ".md", ".gs", ".ps1")

function EstaExcluido($rutaCompleta) {
  foreach ($carpeta in $excluirCarpetas) {
    if ($rutaCompleta -like "*$([IO.Path]::DirectorySeparatorChar)$carpeta$([IO.Path]::DirectorySeparatorChar)*") {
      return $true
    }
  }
  return $false
}

$archivos = Get-ChildItem -Path $raiz -Recurse -File | Where-Object {
  ($extensiones -contains $_.Extension.ToLower()) -and (-not (EstaExcluido $_.FullName))
}

$resultados = foreach ($archivo in $archivos) {
  $lineas = (Get-Content -LiteralPath $archivo.FullName -ErrorAction Stop | Measure-Object -Line).Lines
  [PSCustomObject]@{
    Lineas = $lineas
    Estado = if ($lineas -gt $limite) { "SUPERAR_LIMITE" } else { "OK" }
    Archivo = $archivo.FullName.Replace($raiz.Path + [IO.Path]::DirectorySeparatorChar, "")
  }
}

$resultadosOrdenados = $resultados | Sort-Object Lineas -Descending
$fueraLimite = $resultadosOrdenados | Where-Object { $_.Lineas -gt $limite }

$contenido = @()
$contenido += "Auditoría de líneas - Fitness Jeff"
$contenido += "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$contenido += "Límite permitido: $limite líneas"
$contenido += "Total de archivos revisados: $($resultadosOrdenados.Count)"
$contenido += "Archivos sobre el límite: $($fueraLimite.Count)"
$contenido += ""
$contenido += "Top de archivos más grandes:"
$contenido += ($resultadosOrdenados | Select-Object -First 30 | Format-Table -AutoSize | Out-String)

if ($fueraLimite.Count -gt 0) {
  $contenido += ""
  $contenido += "Archivos que deben dividirse:"
  $contenido += ($fueraLimite | Format-Table -AutoSize | Out-String)
} else {
  $contenido += ""
  $contenido += "Resultado: ningún archivo revisado supera el límite de 600 líneas."
}

$contenido | Set-Content -LiteralPath $salida -Encoding UTF8

Write-Host "Auditoría terminada."
Write-Host "Reporte: $salida"
Write-Host "Archivos sobre el límite: $($fueraLimite.Count)"

if ($fueraLimite.Count -gt 0) {
  exit 1
}
