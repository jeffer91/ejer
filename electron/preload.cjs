/*
  Nombre completo: preload.cjs
  Ruta o ubicación: electron/preload.cjs

  Función o funciones:
    - Exponer funciones seguras desde Electron hacia la app web.
    - Confirmar si FitJeff está corriendo como escritorio.
    - Pedir información básica de la app sin activar nodeIntegration.
    - Usar CommonJS para evitar conflictos con preload y type module.

  Se conecta con:
    - electron/main.js
    - electron/electron-ipc.service.js
    - electron/electron-path.service.js
    - src/app/app.bootstrap.js
*/

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fitJeffDesktop", {
  isElectron: true,
  platform: process.platform,
  getAppInfo: () => ipcRenderer.invoke("fitjeff:get-app-info"),
  openExternal: (url) => ipcRenderer.invoke("fitjeff:open-external", url)
});
