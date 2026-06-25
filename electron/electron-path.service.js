/*
  Nombre completo: electron-path.service.js
  Ruta o ubicación: electron/electron-path.service.js

  Función o funciones:
    - Resolver rutas internas de FitJeff en modo Electron.
    - Diferenciar carga de Vite en desarrollo y dist en producción.
    - Entregar la ruta segura del preload y del index construido.

  Se conecta con:
    - electron/main.js
    - electron/electron-window.service.js
    - electron/preload.cjs
*/

import path from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "electron";

const electronFile = fileURLToPath(import.meta.url);
const electronDir = path.dirname(electronFile);
const rootDir = path.resolve(electronDir, "..");

export function obtenerRootDir() {
  return rootDir;
}

export function obtenerElectronDir() {
  return electronDir;
}

export function obtenerPreloadPath() {
  return path.join(electronDir, "preload.cjs");
}

export function obtenerDistIndexPath() {
  return path.join(rootDir, "dist", "index.html");
}

export function obtenerDevUrl() {
  return "http://127.0.0.1:5173";
}

export function estaEnDesarrolloElectron() {
  return process.env.FITJEFF_ELECTRON_DEV === "1";
}

export function obtenerAppDataDir() {
  return app.getPath("userData");
}
