/* =========================================================
Nombre completo: fit-electron-main.cjs
Ruta o ubicación: electron/fit-electron-main.cjs
Función o funciones:
- Iniciar la aplicación Fitness Jeff en modo Electron.
- Crear la ventana principal de escritorio.
- Cargar src/index.html como pantalla inicial.
Con qué se conecta:
- electron/fit-electron-preload.cjs
- package.json
- src/index.html
========================================================= */
const { app, BrowserWindow } = require('electron');
const path = require('path');

let ventanaPrincipal = null;

function crearVentanaPrincipal() {
  ventanaPrincipal = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 650,
    title: 'Fitness Jeff',
    backgroundColor: '#f4f7fb',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'fit-electron-preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  ventanaPrincipal.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  ventanaPrincipal.once('ready-to-show', function () {
    ventanaPrincipal.show();
  });

  ventanaPrincipal.on('closed', function () {
    ventanaPrincipal = null;
  });
}

app.whenReady().then(function () {
  crearVentanaPrincipal();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentanaPrincipal();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
