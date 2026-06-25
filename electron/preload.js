/*
  Nombre completo: preload.js
  Ruta o ubicación: electron/preload.js

  Función o funciones:
    - Exponer funciones seguras desde Electron hacia la app web.
    - Confirmar si FitJeff está corriendo como escritorio.
    - Pedir información básica de la app sin activar nodeIntegration.

  Se conecta con:
    - electron/main.js
    - electron/electron-ipc.service.js
    - src/app/app.bootstrap.js
*/

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("fitJeffDesktop", {
  isElectron: true,
  platform: process.platform,
  getAppInfo: () => ipcRenderer.invoke("fitjeff:get-app-info"),
  openExternal: (url) => ipcRenderer.invoke("fitjeff:open-external", url)
});
