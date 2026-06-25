@echo off
REM  Nombre completo: revisar-todo.bat
REM  Ruta o ubicacion: scripts/revisar-todo.bat
REM
REM  Funcion o funciones:
REM    - Ejecutar una revision completa de los bloques de actualizaciones.
REM    - Verificar que Electron, Windows, Android, GitHub Release y la pantalla visual esten conectados.
REM    - Servir como prueba rapida antes de publicar una version estable.
REM
REM  Se conecta con:
REM    - scripts/revision-actualizaciones.cjs
REM    - package.json
REM    - scripts/actualizar-todo.bat

setlocal
cd /d "%~dp0.."

echo ========================================
echo FitJeff - Revision completa
echo ========================================
echo Ruta: %CD%
echo.

if not exist "package.json" (
  echo ERROR: No se encontro package.json en la raiz del proyecto.
  pause
  exit /b 1
)

call npm run tools:check
if errorlevel 1 (
  echo.
  echo ERROR: Fallo la revision de herramientas.
  pause
  exit /b 1
)

echo.
call npm run review:updates
if errorlevel 1 (
  echo.
  echo ERROR: La revision integral encontro problemas.
  pause
  exit /b 1
)

echo.
echo ========================================
echo Revision completada sin errores criticos.
echo ========================================
pause
endlocal
