@echo off
REM  Nombre completo: ABRIR_FITJEFF.bat
REM  Ruta o ubicacion: ABRIR_FITJEFF.bat
REM
REM  Funcion o funciones:
REM    - Abrir FitJeff con doble clic desde la raiz del proyecto.
REM    - Ejecutar npm start usando el inicio seguro por puerto automatico.
REM    - Evitar el error de puerto 5173 ocupado.
REM
REM  Se conecta con:
REM    - package.json
REM    - scripts/start-electron-dev.cjs

setlocal
cd /d "%~dp0"

echo ========================================
echo FitJeff - Abrir app
echo ========================================
echo Ruta: %CD%
echo.

if not exist "package.json" (
  echo ERROR: No se encontro package.json.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo No existe node_modules. Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install fallo.
    pause
    exit /b 1
  )
)

call npm start

if errorlevel 1 (
  echo.
  echo ERROR: FitJeff no pudo abrirse.
  pause
  exit /b 1
)

endlocal
