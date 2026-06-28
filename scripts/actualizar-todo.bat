@echo off
REM  Nombre completo: actualizar-todo.bat
REM  Ruta o ubicacion: scripts/actualizar-todo.bat
REM
REM  Funcion o funciones:
REM    - Dar un menu simple para trabajar, revisar y publicar FitJeff.
REM    - Ejecutar publicacion completa automatica de Windows + Android preparado con un solo clic.
REM    - Abrir Electron en desarrollo con npm start seguro.
REM    - Ejecutar revision integral y revision final release antes de publicar.
REM
REM  Se conecta con:
REM    - scripts/publicar-version-automatica.bat
REM    - scripts/publicar-version.bat
REM    - scripts/abrir-electron-dev.bat
REM    - scripts/check-tools.cjs
REM    - scripts/build-android.cjs
REM    - scripts/revision-release-final.cjs
REM    - scripts/revisar-todo.bat
REM    - package.json

setlocal
cd /d "%~dp0.."

:MENU
cls
echo ========================================
echo FitJeff - Actualizar todo
echo ========================================
echo 1. Actualizar version automaticamente Windows + Android + GitHub Release
echo 2. Publicar version con confirmacion manual
echo 3. Abrir Electron en desarrollo con npm start seguro
echo 4. Revisar herramientas
echo 5. Ver estado de Git
echo 6. Preparar Android/APK solamente
echo 7. Revision completa + release preflight
echo 8. Revision final de release solamente
echo 0. Salir
echo ========================================
echo Nota: La opcion 1 aumenta version, compila instalador, revisa artefactos y publica release.
echo.
set /p OPCION="Elige una opcion: "

if "%OPCION%"=="1" goto PUBLICAR_AUTO
if "%OPCION%"=="2" goto PUBLICAR_MANUAL
if "%OPCION%"=="3" goto ELECTRON_DEV
if "%OPCION%"=="4" goto HERRAMIENTAS
if "%OPCION%"=="5" goto ESTADO_GIT
if "%OPCION%"=="6" goto ANDROID
if "%OPCION%"=="7" goto REVISION
if "%OPCION%"=="8" goto REVISION_RELEASE
if "%OPCION%"=="0" goto SALIR

echo.
echo Opcion no valida.
pause
goto MENU

:PUBLICAR_AUTO
call "%~dp0publicar-version-automatica.bat"
pause
goto MENU

:PUBLICAR_MANUAL
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

:REVISION_RELEASE
call npm run release:check
pause
goto MENU

:SALIR
echo Cerrando FitJeff updater...
endlocal
exit /b 0
