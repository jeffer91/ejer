/* =========================================================
Nombre completo: fit-electron-main.cjs
Ruta o ubicación: electron/fit-electron-main.cjs
Función o funciones:
- Iniciar la app de escritorio con Electron.
- Cargar el archivo principal src/index.html.
- Mantener una ventana segura con contextIsolation activado.
Con qué se conecta:
- electron/fit-electron-preload.cjs
- src/index.html
========================================================= */
const { app, BrowserWindow } = require('electron');
const path = require('path');

let ventanaPrincipal = null;

function crearVentanaPrincipal() {
  ventanaPrincipal = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 980,
    minHeight: 640,
    title: 'Fitness Jeff',
    backgroundColor: '#f4f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'fit-electron-preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  ventanaPrincipal.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

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
