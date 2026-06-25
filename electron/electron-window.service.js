/*
  Nombre completo: electron-window.service.js
  Ruta o ubicación: electron/electron-window.service.js

  Función o funciones:
    - Crear la ventana principal de FitJeff en escritorio.
    - Cargar Vite en desarrollo y dist en producción.
    - Mantener configuración segura: sin nodeIntegration y con preload.
    - Abrir enlaces externos en el navegador del sistema.

  Se conecta con:
    - electron/main.js
    - electron/electron-path.service.js
    - electron/preload.cjs
*/

import { BrowserWindow, shell } from "electron";
import { estaEnDesarrolloElectron, obtenerDevUrl, obtenerDistIndexPath, obtenerPreloadPath } from "./electron-path.service.js";

export function crearVentanaPrincipal() {
  const ventana = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "FitJeff",
    backgroundColor: "#f6f7fb",
    show: false,
    webPreferences: {
      preload: obtenerPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  ventana.once("ready-to-show", () => {
    ventana.show();
  });

  ventana.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  if (estaEnDesarrolloElectron()) {
    ventana.loadURL(obtenerDevUrl());
  } else {
    ventana.loadFile(obtenerDistIndexPath());
  }

  return ventana;
}
