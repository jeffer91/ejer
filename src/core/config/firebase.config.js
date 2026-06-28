/*
  Nombre completo: firebase.config.js
  Ruta o ubicación: src/core/config/firebase.config.js

  Función o funciones:
    - Centralizar la configuración pública de Firebase.
    - Leer variables Vite desde .env cuando existan.
    - Mantener FitJeff en modo local cuando Firebase no esté habilitado o falten variables.
    - Exponer un estado simple de conexión para sincronización y diagnóstico.
    - Evitar que los servicios escriban datos si Firebase aún no está configurado.

  Se conecta con:
    - .env.example
    - src/core/firebase/firebase-app.service.js
    - src/core/firebase/firebase-database.service.js
    - src/core/sync/sync.service.js
*/

function leerVariableEnv(nombre, valorDefecto = "") {
  try {
    return String(import.meta.env?.[nombre] ?? valorDefecto).trim();
  } catch {
    return String(valorDefecto).trim();
  }
}

function leerBooleanEnv(nombre, valorDefecto = false) {
  const valor = leerVariableEnv(nombre, valorDefecto ? "true" : "false").toLowerCase();
  return valor === "true" || valor === "1" || valor === "yes" || valor === "si" || valor === "sí";
}

export const FIREBASE_CONFIG = Object.freeze({
  apiKey: leerVariableEnv("VITE_FIREBASE_API_KEY"),
  authDomain: leerVariableEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: leerVariableEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: leerVariableEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: leerVariableEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: leerVariableEnv("VITE_FIREBASE_APP_ID")
});

export const FIREBASE_APP_OPTIONS = Object.freeze({
  enabled: leerBooleanEnv("VITE_FIREBASE_ENABLED", false),
  collection: leerVariableEnv("VITE_FIREBASE_COLLECTION", "fitjeff") || "fitjeff",
  userDocument: leerVariableEnv("VITE_FIREBASE_USER_DOCUMENT", "jeff") || "jeff",
  registrosSubcollection: leerVariableEnv("VITE_FIREBASE_REGISTROS_SUBCOLLECTION", "registros") || "registros",
  statusDocument: leerVariableEnv("VITE_FIREBASE_STATUS_DOCUMENT", "status") || "status"
});

export function obtenerVariablesFirebaseFaltantes() {
  const requeridas = [
    ["VITE_FIREBASE_API_KEY", FIREBASE_CONFIG.apiKey],
    ["VITE_FIREBASE_PROJECT_ID", FIREBASE_CONFIG.projectId],
    ["VITE_FIREBASE_APP_ID", FIREBASE_CONFIG.appId]
  ];

  return requeridas
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);
}

export function firebaseEstaConfigurado() {
  return Boolean(
    FIREBASE_APP_OPTIONS.enabled &&
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
  );
}

export function obtenerEstadoFirebaseConexion() {
  const faltantes = obtenerVariablesFirebaseFaltantes();

  if (!FIREBASE_APP_OPTIONS.enabled) {
    return {
      modo: "local",
      habilitado: false,
      configurado: false,
      faltantes,
      mensaje: "Modo local activo. Firebase está deshabilitado."
    };
  }

  if (!firebaseEstaConfigurado()) {
    return {
      modo: "pendiente-configuracion",
      habilitado: true,
      configurado: false,
      faltantes,
      mensaje: `Firebase está habilitado, pero faltan variables: ${faltantes.join(", ") || "sin detalle"}.`
    };
  }

  return {
    modo: "firebase",
    habilitado: true,
    configurado: true,
    faltantes: [],
    mensaje: "Firebase configurado para sincronización."
  };
}
