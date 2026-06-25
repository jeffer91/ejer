/*
  Nombre completo: preload.cjs
  Ruta o ubicación: electron/preload.cjs

  Función o funciones:
    - Exponer funciones seguras desde Electron hacia la app web.
    - Confirmar si FitJeff está corriendo como escritorio.
    - Pedir información básica de la app sin activar nodeIntegration.
    - Exponer controles seguros del actualizador automático.
    - Usar CommonJS para evitar conflictos con preload y type module.

  Se conecta con:
    - electron/main.js
    - electron/electron-ipc.service.js
    - electron/electron-update-ipc.service.js
    - electron/electron-path.service.js
    - src/app/app.bootstrap.js
    - src/modules/actualizaciones/actualizaciones.service.js
*/

const { contextBridge, ipcRenderer } = require("electron");

const UPDATE_CHANNELS = Object.freeze({
  EVENT: "fitjeff:update:event",
  GET_STATUS: "fitjeff:update:get-status",
  CHECK: "fitjeff:update:check",
  DOWNLOAD: "fitjeff:update:download",
  QUIT_AND_INSTALL: "fitjeff:update:quit-and-install"
});

function crearSuscripcionActualizaciones(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  const listener = (_event, payload) => {
    callback(payload);
  };

  ipcRenderer.on(UPDATE_CHANNELS.EVENT, listener);

  return () => {
    ipcRenderer.removeListener(UPDATE_CHANNELS.EVENT, listener);
  };
}

contextBridge.exposeInMainWorld("fitJeffDesktop", {
  isElectron: true,
  platform: process.platform,
  getAppInfo: () => ipcRenderer.invoke("fitjeff:get-app-info"),
  openExternal: (url) => ipcRenderer.invoke("fitjeff:open-external", url),
  updates: {
    getStatus: () => ipcRenderer.invoke(UPDATE_CHANNELS.GET_STATUS),
    check: () => ipcRenderer.invoke(UPDATE_CHANNELS.CHECK),
    download: () => ipcRenderer.invoke(UPDATE_CHANNELS.DOWNLOAD),
    quitAndInstall: () => ipcRenderer.invoke(UPDATE_CHANNELS.QUIT_AND_INSTALL),
    onEvent: crearSuscripcionActualizaciones
  }
});
