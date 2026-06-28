@echo off
REM  Nombre completo: ACTUALIZAR_VERSION_FITJEFF.bat
REM  Ruta o ubicacion: ACTUALIZAR_VERSION_FITJEFF.bat
REM
REM  Funcion o funciones:
REM    - Ejecutar la actualizacion automatica de version con doble clic.
REM    - Compilar instalador Windows y preparar Android/APK.
REM    - Publicar GitHub Release para que el instalador detecte actualizaciones.
REM
REM  Se conecta con:
REM    - scripts/publicar-version-automatica.bat
REM    - package.json
REM    - release/latest.yml
REM    - release/latest-android.json

setlocal
cd /d "%~dp0"

if not exist "scripts\publicar-version-automatica.bat" (
  echo ERROR: No existe scripts\publicar-version-automatica.bat
  pause
  exit /b 1
)

call "scripts\publicar-version-automatica.bat"
endlocal
