@echo off
REM  Nombre completo: publicar-version.bat
REM  Ruta o ubicacion: scripts/publicar-version.bat
REM
REM  Funcion o funciones:
REM    - Publicar una nueva version estable de FitJeff.
REM    - Instalar dependencias, subir version, compilar Windows, preparar Android/APK y crear GitHub Release.
REM    - Confirmar antes de subir cambios a GitHub.
REM    - Dejar la app instalada lista para detectar actualizaciones automaticas.
REM
REM  Se conecta con:
REM    - package.json
REM    - scripts/version-bump.cjs
REM    - scripts/build-windows.cjs
REM    - scripts/build-android.cjs
REM    - scripts/release-github.cjs
REM    - GitHub Releases

setlocal enabledelayedexpansion

cd /d "%~dp0.."

echo ========================================
echo FitJeff - Publicar version estable
echo ========================================
echo Ruta: %CD%
echo.

if not exist "package.json" (
  echo ERROR: No se encontro package.json en la raiz del proyecto.
  pause
  exit /b 1
)

echo Revisando herramientas...
call npm run tools:check
if errorlevel 1 (
  echo.
  echo ERROR: Faltan herramientas obligatorias.
  pause
  exit /b 1
)

echo.
echo Sincronizando con GitHub...
git pull --rebase --autostash origin main
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo sincronizar con GitHub.
  pause
  exit /b 1
)

echo.
echo Estado actual de cambios:
git status --short
echo.
set /p CONFIRMAR="Quieres publicar todos estos cambios y crear una nueva version? (S/N): "
if /I not "%CONFIRMAR%"=="S" (
  echo Publicacion cancelada por el usuario.
  pause
  exit /b 0
)

echo.
echo Instalando/verificando dependencias...
call npm install
if errorlevel 1 (
  echo.
  echo ERROR: npm install fallo.
  pause
  exit /b 1
)

echo.
echo Aumentando version automaticamente...
call npm run version:bump
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo aumentar la version.
  pause
  exit /b 1
)

for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set APP_VERSION=%%v
set APP_TAG=v%APP_VERSION%

echo.
echo Nueva version: %APP_VERSION%
echo Tag: %APP_TAG%

echo.
echo Compilando instalador Windows...
call npm run build:windows
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo compilar Windows.
  pause
  exit /b 1
)

echo.
echo Preparando Android/APK...
call npm run build:android
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo preparar Android/APK.
  pause
  exit /b 1
)

echo.
echo Guardando cambios en Git...
git add -A
git commit -m "%APP_TAG% - Actualizacion automatica de FitJeff"
if errorlevel 1 (
  echo.
  echo AVISO: No hubo cambios para commitear o Git rechazo el commit.
)

echo.
echo Subiendo cambios a GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo ERROR: No se pudieron subir cambios a GitHub.
  pause
  exit /b 1
)

echo.
echo Publicando GitHub Release...
call npm run release:github
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo publicar el release.
  pause
  exit /b 1
)

echo.
echo ========================================
echo FitJeff publicado correctamente: %APP_TAG%
echo ========================================
echo La app instalada podra detectar esta version desde GitHub Releases.
echo Android queda preparado; si existe APK real, se publica junto con Windows.
echo.
pause
endlocal
