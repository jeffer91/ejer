/*
  Nombre completo: electron-window.service.js
  Ruta o ubicación: electron/electron-window.service.js

  Función o funciones:
    - Crear la ventana principal de FitJeff en escritorio.
    - Cargar Vite en desarrollo y dist en producción.
    - Mantener configuración segura: sin nodeIntegration y con preload.
    - Abrir enlaces externos en el navegador del sistema.
    - Mostrar errores reales cuando Electron no logra cargar la app.

  Se conecta con:
    - electron/main.js
    - electron/electron-path.service.js
    - electron/preload.cjs
*/

import { BrowserWindow, shell } from "electron";
import {
  estaEnDesarrolloElectron,
  obtenerDevUrl,
  obtenerDistIndexPath,
  obtenerPreloadPath
} from "./electron-path.service.js";

function configurarEventosDeCarga(ventana) {
  ventana.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("[FitJeff Electron] Error al cargar ventana:", {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  ventana.webContents.on("render-process-gone", (_event, detalles) => {
    console.error("[FitJeff Electron] El proceso de render se cerró:", detalles);
  });

  ventana.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log("[FitJeff Renderer]", {
      level,
      message,
      line,
      sourceId
    });
  });
}

async function cargarContenido(ventana) {
  if (estaEnDesarrolloElectron()) {
    const url = obtenerDevUrl();
    console.log(`[FitJeff Electron] Cargando modo desarrollo: ${url}`);
    await ventana.loadURL(url);

// ventana.webContents.openDevTools({
//   mode: "detach"
// });

    return;
  }

  const indexPath = obtenerDistIndexPath();
  console.log(`[FitJeff Electron] Cargando modo producción: ${indexPath}`);
  await ventana.loadFile(indexPath);
}

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

  configurarEventosDeCarga(ventana);

  ventana.once("ready-to-show", () => {
    ventana.show();
  });

  ventana.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  cargarContenido(ventana).catch((error) => {
    console.error("[FitJeff Electron] No se pudo cargar la ventana principal:", error);
    ventana.show();
  });

  return ventana;
}