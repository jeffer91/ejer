/*
  Nombre completo: electron-ipc.service.js
  Ruta o ubicación: electron/electron-ipc.service.js

  Función o funciones:
    - Registrar canales IPC seguros para FitJeff escritorio.
    - Entregar información básica de la app al preload.
    - Abrir enlaces externos solo si son http o https.

  Se conecta con:
    - electron/main.js
    - electron/preload.js
    - electron/electron-path.service.js
*/

import { app, ipcMain, shell } from "electron";
import { obtenerAppDataDir } from "./electron-path.service.js";

function urlPermitida(url) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

export function registrarIpcElectron() {
  ipcMain.handle("fitjeff:get-app-info", () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      appDataDir: obtenerAppDataDir(),
      isElectron: true
    };
  });

  ipcMain.handle("fitjeff:open-external", async (_event, url) => {
    if (!urlPermitida(url)) {
      return { ok: false, mensaje: "Enlace no permitido." };
    }

    await shell.openExternal(url);
    return { ok: true };
  });
}
