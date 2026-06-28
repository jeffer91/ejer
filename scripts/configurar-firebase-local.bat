@echo off
REM  Nombre completo: configurar-firebase-local.bat
REM  Ruta o ubicacion: scripts/configurar-firebase-local.bat
REM
REM  Funcion o funciones:
REM    - Crear o reemplazar .env.local desde preguntas simples.
REM    - Evitar que el usuario escriba variables como comandos en PowerShell.
REM    - Activar Firebase localmente para que FitJeff restaure datos antes de mostrar Inicio.
REM    - Mantener .env.local fuera de GitHub.
REM
REM  Se conecta con:
REM    - CONFIGURAR_FIREBASE_FITJEFF.bat
REM    - .env.example
REM    - .gitignore
REM    - src/core/config/firebase.config.js

setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo ========================================
echo FitJeff - Configurar Firebase local
echo ========================================
echo.
echo IMPORTANTE:
echo No escribas VITE_FIREBASE_API_KEY como comando en PowerShell.
echo Este asistente creara el archivo .env.local por ti.
echo.

if exist ".env.local" (
  echo Ya existe .env.local.
  set /p REEMPLAZAR="Deseas reemplazarlo? Escribe SI para continuar: "
  if /I not "!REEMPLAZAR!"=="SI" (
    echo Cancelado. No se modifico .env.local.
    pause
    exit /b 0
  )
)

set /p FIREBASE_API_KEY="Pega VITE_FIREBASE_API_KEY: "
set /p FIREBASE_AUTH_DOMAIN="Pega VITE_FIREBASE_AUTH_DOMAIN: "
set /p FIREBASE_PROJECT_ID="Pega VITE_FIREBASE_PROJECT_ID: "
set /p FIREBASE_STORAGE_BUCKET="Pega VITE_FIREBASE_STORAGE_BUCKET: "
set /p FIREBASE_MESSAGING_SENDER_ID="Pega VITE_FIREBASE_MESSAGING_SENDER_ID: "
set /p FIREBASE_APP_ID="Pega VITE_FIREBASE_APP_ID: "

if "%FIREBASE_API_KEY%"=="" goto FALTA_DATO
if "%FIREBASE_PROJECT_ID%"=="" goto FALTA_DATO
if "%FIREBASE_APP_ID%"=="" goto FALTA_DATO

(
  echo # FitJeff - Firebase local
  echo # Archivo generado por scripts\configurar-firebase-local.bat
  echo # No subir a GitHub. .gitignore ya protege .env.local.
  echo.
  echo VITE_FIREBASE_ENABLED=true
  echo VITE_FIREBASE_API_KEY=%FIREBASE_API_KEY%
  echo VITE_FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN%
  echo VITE_FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID%
  echo VITE_FIREBASE_STORAGE_BUCKET=%FIREBASE_STORAGE_BUCKET%
  echo VITE_FIREBASE_MESSAGING_SENDER_ID=%FIREBASE_MESSAGING_SENDER_ID%
  echo VITE_FIREBASE_APP_ID=%FIREBASE_APP_ID%
  echo.
  echo VITE_FIREBASE_COLLECTION=fitjeff
  echo VITE_FIREBASE_USER_DOCUMENT=jeff
  echo VITE_FIREBASE_REGISTROS_SUBCOLLECTION=registros
  echo VITE_FIREBASE_STATUS_DOCUMENT=status
) > ".env.local"

echo.
echo ========================================
echo .env.local creado correctamente.
echo ========================================
echo Ahora cierra FitJeff si esta abierto y ejecuta:
echo npm start
echo.
pause
endlocal
exit /b 0

:FALTA_DATO
echo.
echo ERROR: Faltan datos obligatorios.
echo Minimo debes llenar API_KEY, PROJECT_ID y APP_ID.
echo No se creo .env.local.
echo.
pause
endlocal
exit /b 1
