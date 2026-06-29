/*
  Nombre completo: electron-window.service.js
  Ruta o ubicación: electron/electron-window.service.js

  Función o funciones:
    - Crear la ventana principal de FitJeff en escritorio.
    - Cargar Vite en desarrollo y dist en producción.
    - Mantener configuración segura: sin nodeIntegration y con preload.
    - Abrir enlaces externos en el navegador del sistema.
    - Permitir micrófono/audio para Jarvis dentro de Electron.
    - Permitir Web Bluetooth para anexar Cubitt CT4 desde la pantalla Dispositivos.
    - Seleccionar únicamente dispositivos cuyo nombre parezca Cubitt CT4.
    - Mostrar errores reales cuando Electron no logra cargar la app.
    - Mantener el fondo inicial alineado con el tema claro.

  Se conecta con:
    - electron/main.js
    - electron/electron-path.service.js
    - electron/preload.cjs
    - src/features/actividad/dispositivos/dispositivos-bluetooth.service.js
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

function esPermisoMicrofono(permission, details = {}) {
  const mediaTypes = Array.isArray(details.mediaTypes) ? details.mediaTypes : [];

  if (["audioCapture", "microphone"].includes(permission)) return true;
  if (permission === "media" && mediaTypes.length === 0) return true;
  if (permission === "media" && mediaTypes.includes("audio")) return true;

  return false;
}

function esPermisoBluetooth(permission) {
  return [
    "bluetooth",
    "bluetoothScanning",
    "bluetoothDevice",
    "bluetoothSerial"
  ].includes(permission);
}

function configurarPermisosJarvisYBluetooth(ventana) {
  const sesion = ventana.webContents.session;

  sesion.setPermissionRequestHandler((_webContents, permission, callback, details) => {
    if (esPermisoMicrofono(permission, details) || esPermisoBluetooth(permission)) {
      callback(true);
      return;
    }

    callback(false);
  });

  sesion.setPermissionCheckHandler((_webContents, permission, _origin, details) => {
    return esPermisoMicrofono(permission, details) || esPermisoBluetooth(permission);
  });

  if (typeof sesion.setDevicePermissionHandler === "function") {
    sesion.setDevicePermissionHandler((details) => {
      return details.deviceType === "bluetooth";
    });
  }
}

function obtenerNombreDispositivoBluetooth(dispositivo = {}) {
  return String(dispositivo.deviceName || dispositivo.name || "").trim();
}

function configurarSeleccionBluetooth(ventana) {
  ventana.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
    event.preventDefault();

    const dispositivos = Array.isArray(deviceList) ? deviceList : [];
    const cubitt = dispositivos.find((device) => /cubitt|ct\s*4|ct4/i.test(obtenerNombreDispositivoBluetooth(device)));

    if (!cubitt) {
      console.log("[FitJeff Bluetooth] Escaneo sin Cubitt CT4 todavía.");
      callback("");
      return;
    }

    console.log("[FitJeff Bluetooth] Cubitt seleccionado:", {
      deviceName: cubitt.deviceName,
      deviceId: cubitt.deviceId
    });

    callback(cubitt.deviceId);
  });

  ventana.webContents.on("bluetooth-pairing-request", (event, details, callback) => {
    event.preventDefault();
    console.log("[FitJeff Bluetooth] Solicitud de emparejamiento:", {
      deviceId: details?.deviceId,
      pairingKind: details?.pairingKind
    });
    callback("");
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
    backgroundColor: "#f8fafc",
    show: false,
    webPreferences: {
      preload: obtenerPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      enableBlinkFeatures: "WebBluetooth"
    }
  });

  configurarEventosDeCarga(ventana);
  configurarPermisosJarvisYBluetooth(ventana);
  configurarSeleccionBluetooth(ventana);

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
