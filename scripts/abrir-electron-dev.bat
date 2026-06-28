@echo off
REM  Nombre completo: abrir-electron-dev.bat
REM  Ruta o ubicacion: scripts/abrir-electron-dev.bat
REM
REM  Funcion o funciones:
REM    - Abrir FitJeff en modo Electron de desarrollo.
REM    - Revisar herramientas antes de iniciar.
REM    - Instalar dependencias si node_modules no existe.
REM    - Usar npm start seguro para evitar error por puerto 5173 ocupado.
REM
REM  Se conecta con:
REM    - package.json
REM    - scripts/start-electron-dev.cjs
REM    - scripts/check-tools.cjs
REM    - electron/main.js
REM    - electron/preload.cjs

setlocal

cd /d "%~dp0.."

echo ========================================
echo FitJeff - Abrir Electron desarrollo
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
  echo ERROR: Revisa las herramientas faltantes antes de abrir Electron.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo.
  echo No existe node_modules. Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install fallo. Revisa tu conexion o la configuracion de npm.
    pause
    exit /b 1
  )
)

echo.
echo Abriendo FitJeff en modo Electron con npm start seguro...
call npm start

if errorlevel 1 (
  echo.
  echo ERROR: Electron no pudo iniciar correctamente.
  pause
  exit /b 1
)

endlocal
