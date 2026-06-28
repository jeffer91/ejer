@echo off
REM  Nombre completo: CONFIGURAR_FIREBASE_FITJEFF.bat
REM  Ruta o ubicacion: CONFIGURAR_FIREBASE_FITJEFF.bat
REM
REM  Funcion o funciones:
REM    - Configurar Firebase con doble clic desde la raiz del proyecto.
REM    - Crear .env.local sin escribir variables como comandos en PowerShell.
REM    - Permitir que FitJeff restaure Firebase antes de mostrar la pantalla inicial.
REM
REM  Se conecta con:
REM    - scripts\configurar-firebase-local.bat
REM    - src\core\config\firebase.config.js
REM    - src\core\bootstrap\app-data-hydration.service.js

setlocal
cd /d "%~dp0"

if not exist "scripts\configurar-firebase-local.bat" (
  echo ERROR: No existe scripts\configurar-firebase-local.bat
  pause
  exit /b 1
)

call "scripts\configurar-firebase-local.bat"
endlocal
