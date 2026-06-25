/*
  Nombre completo: main.js
  Ruta o ubicación: electron/main.js

  Función o funciones:
    - Iniciar FitJeff como aplicación de escritorio con Electron.
    - Crear una sola instancia de la app.
    - Cargar Vite en desarrollo y dist en producción.
    - Registrar menú, IPC seguros y actualizador automático.
    - Limpiar la referencia de ventana al cerrar.

  Se conecta con:
    - electron/electron-window.service.js
    - electron/electron-menu.service.js
    - electron/electron-ipc.service.js
    - electron/electron-updater.service.js
    - electron/preload.cjs
    - package.json
*/

import { app } from "electron";
import { instalarMenuAplicacion } from "./electron-menu.service.js";
import { crearVentanaPrincipal } from "./electron-window.service.js";
import { registrarIpcElectron } from "./electron-ipc.service.js";
import { crearElectronUpdaterService } from "./electron-updater.service.js";

let mainWindow = null;
let updateService = null;

const bloqueoInstancia = app.requestSingleInstanceLock();

if (!bloqueoInstancia) {
  app.quit();
}

function obtenerVentanaPrincipal() {
  return mainWindow;
}

function crearYGuardarVentanaPrincipal() {
  mainWindow = crearVentanaPrincipal();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

async function iniciarElectron() {
  updateService = crearElectronUpdaterService({ obtenerVentanaPrincipal });

  registrarIpcElectron({ updateService });
  instalarMenuAplicacion();
  crearYGuardarVentanaPrincipal();

  updateService.iniciar().catch((error) => {
    console.error("[FitJeff Electron] No se pudo iniciar el actualizador:", error);
  });
}

app.whenReady().then(iniciarElectron);

app.on("second-instance", () => {
  if (!mainWindow) {
    crearYGuardarVentanaPrincipal();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
});

app.on("activate", () => {
  if (mainWindow === null) {
    crearYGuardarVentanaPrincipal();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
