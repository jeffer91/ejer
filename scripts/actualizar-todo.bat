@echo off
REM  Nombre completo: actualizar-todo.bat
REM  Ruta o ubicacion: scripts/actualizar-todo.bat
REM
REM  Funcion o funciones:
REM    - Dar un menu simple para trabajar, revisar y publicar FitJeff.
REM    - Ejecutar la publicacion completa de Windows + Android preparado con un solo clic.
REM    - Abrir Electron en desarrollo cuando solo se quiera probar.
REM    - Ejecutar revision integral antes de publicar.
REM
REM  Se conecta con:
REM    - scripts/publicar-version.bat
REM    - scripts/abrir-electron-dev.bat
REM    - scripts/check-tools.cjs
REM    - scripts/build-android.cjs
REM    - scripts/revisar-todo.bat
REM    - package.json

setlocal
cd /d "%~dp0.."

:MENU
cls
echo ========================================
echo FitJeff - Actualizar todo
echo ========================================
echo 1. Publicar version estable Windows + Android preparado + GitHub Release
echo 2. Abrir Electron en desarrollo
echo 3. Revisar herramientas
echo 4. Ver estado de Git
echo 5. Preparar Android/APK solamente
echo 6. Revision completa de actualizaciones
echo 0. Salir
echo ========================================
echo Nota: Ejecuta la opcion 6 antes de publicar una version estable.
echo.
set /p OPCION="Elige una opcion: "

if "%OPCION%"=="1" goto PUBLICAR
if "%OPCION%"=="2" goto ELECTRON_DEV
if "%OPCION%"=="3" goto HERRAMIENTAS
if "%OPCION%"=="4" goto ESTADO_GIT
if "%OPCION%"=="5" goto ANDROID
if "%OPCION%"=="6" goto REVISION
if "%OPCION%"=="0" goto SALIR

echo.
echo Opcion no valida.
pause
goto MENU

:PUBLICAR
call "%~dp0publicar-version.bat"
pause
goto MENU

:ELECTRON_DEV
call "%~dp0abrir-electron-dev.bat"
pause
goto MENU

:HERRAMIENTAS
call npm run tools:check
pause
goto MENU

:ESTADO_GIT
git status
pause
goto MENU

:ANDROID
call npm run build:android
pause
goto MENU

:REVISION
call "%~dp0revisar-todo.bat"
pause
goto MENU

:SALIR
echo Cerrando FitJeff updater...
endlocal
exit /b 0
