/*
  Nombre completo: electron-ipc.service.js
  Ruta o ubicación: electron/electron-ipc.service.js

  Función o funciones:
    - Registrar canales IPC seguros para FitJeff escritorio.
    - Entregar información básica de la app al preload.
    - Abrir enlaces externos solo si son http o https.
    - Conectar los canales IPC del actualizador automático.

  Se conecta con:
    - electron/main.js
    - electron/preload.cjs
    - electron/electron-path.service.js
    - electron/electron-update-ipc.service.js
    - electron/electron-updater.service.js
*/

import { app, ipcMain, shell } from "electron";
import { obtenerAppDataDir } from "./electron-path.service.js";
import { registrarIpcActualizaciones } from "./electron-update-ipc.service.js";

function urlPermitida(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

function registrarHandlerSeguro(canal, handler) {
  ipcMain.removeHandler(canal);
  ipcMain.handle(canal, handler);
}

export function registrarIpcElectron({ updateService = null } = {}) {
  registrarHandlerSeguro("fitjeff:get-app-info", () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      appDataDir: obtenerAppDataDir(),
      isElectron: true,
      isPackaged: app.isPackaged
    };
  });

  registrarHandlerSeguro("fitjeff:open-external", async (_event, url) => {
    if (!urlPermitida(url)) {
      return { ok: false, mensaje: "Enlace no permitido." };
    }

    await shell.openExternal(url);
    return { ok: true };
  });

  registrarIpcActualizaciones(updateService);
}
