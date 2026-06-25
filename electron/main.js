/*
  Nombre completo: main.js
  Ruta o ubicación: electron/main.js

  Función o funciones:
    - Iniciar FitJeff como aplicación de escritorio con Electron.
    - Crear una sola instancia de la app.
    - Cargar Vite en desarrollo y dist en producción.
    - Registrar menú e IPC seguros.

  Se conecta con:
    - electron/electron-window.service.js
    - electron/electron-menu.service.js
    - electron/electron-ipc.service.js
    - electron/preload.js
    - package.json
*/

import { app } from "electron";
import { instalarMenuAplicacion } from "./electron-menu.service.js";
import { crearVentanaPrincipal } from "./electron-window.service.js";
import { registrarIpcElectron } from "./electron-ipc.service.js";

let mainWindow = null;

const bloqueoInstancia = app.requestSingleInstanceLock();

if (!bloqueoInstancia) {
  app.quit();
}

async function iniciarElectron() {
  registrarIpcElectron();
  instalarMenuAplicacion();
  mainWindow = crearVentanaPrincipal();
}

app.whenReady().then(iniciarElectron);

app.on("second-instance", () => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
});

app.on("activate", () => {
  if (mainWindow === null) {
    mainWindow = crearVentanaPrincipal();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
