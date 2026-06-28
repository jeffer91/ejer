@echo off
REM  Nombre completo: publicar-version-automatica.bat
REM  Ruta o ubicacion: scripts/publicar-version-automatica.bat
REM
REM  Funcion o funciones:
REM    - Actualizar FitJeff con doble clic.
REM    - Sincronizar con GitHub, instalar dependencias, revisar, subir version, compilar Windows y preparar Android/APK.
REM    - Ejecutar revision final de artefactos antes de publicar.
REM    - Subir cambios y publicar GitHub Release para que el instalador pueda detectar actualizaciones.
REM    - Mantener Windows y Android usando la misma version de package.json.
REM
REM  Se conecta con:
REM    - package.json
REM    - scripts/version-bump.cjs
REM    - scripts/build-windows.cjs
REM    - scripts/build-android.cjs
REM    - scripts/revision-release-final.cjs
REM    - scripts/release-github.cjs
REM    - ACTUALIZAR_VERSION_FITJEFF.bat

setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo ========================================
echo FitJeff - Actualizacion automatica
echo ========================================
echo Ruta: %CD%
echo.

if not exist "package.json" (
  echo ERROR: No se encontro package.json en la raiz del proyecto.
  pause
  exit /b 1
)

echo [1/10] Revisando herramientas...
call npm run tools:check
if errorlevel 1 goto ERROR_FINAL

echo.
echo [2/10] Sincronizando con GitHub...
git pull --rebase --autostash origin main
if errorlevel 1 goto ERROR_FINAL

echo.
echo [3/10] Instalando/verificando dependencias...
call npm install
if errorlevel 1 goto ERROR_FINAL

echo.
echo [4/10] Revision local antes de publicar...
call npm run check:local
if errorlevel 1 goto ERROR_FINAL

echo.
echo [5/10] Aumentando version automaticamente...
call npm run version:bump
if errorlevel 1 goto ERROR_FINAL

for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set APP_VERSION=%%v
set APP_TAG=v%APP_VERSION%

echo.
echo Nueva version: %APP_VERSION%
echo Tag: %APP_TAG%

echo.
echo [6/10] Compilando instalador Windows...
call npm run build:windows
if errorlevel 1 goto ERROR_FINAL

echo.
echo [7/10] Preparando Android/APK...
call npm run build:android
if errorlevel 1 goto ERROR_FINAL

echo.
echo [8/10] Revision final de instalador y Android...
call npm run release:check:built
if errorlevel 1 goto ERROR_FINAL

echo.
echo [9/10] Guardando y subiendo cambios a GitHub...
git add -A
git commit -m "%APP_TAG% - Actualizacion automatica FitJeff"
if errorlevel 1 (
  echo AVISO: No hubo cambios para commitear o Git rechazo el commit.
)
git push origin main
if errorlevel 1 goto ERROR_FINAL

echo.
echo [10/10] Publicando GitHub Release...
call npm run release:github
if errorlevel 1 goto ERROR_FINAL

echo.
echo ========================================
echo FitJeff actualizado correctamente: %APP_TAG%
echo ========================================
echo Windows: instalador y latest.yml publicados.
echo Android: APK publicada si existe proyecto Android; si no, manifiesto preparado.
echo.
pause
endlocal
exit /b 0

:ERROR_FINAL
echo.
echo ========================================
echo ERROR: La actualizacion automatica se detuvo.
echo ========================================
echo Copia la consola desde el paso que fallo para corregirlo.
echo.
pause
endlocal
exit /b 1
