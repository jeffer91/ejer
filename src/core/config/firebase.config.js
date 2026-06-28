/*
  Nombre completo: firebase.config.js
  Ruta o ubicación: src/core/config/firebase.config.js

  Función o funciones:
    - Centralizar la configuración pública de Firebase.
    - Leer primero variables Vite cuando existan.
    - Usar configuración de proyecto escrita en código como respaldo.
    - Activar Firebase automáticamente si existen credenciales completas y no se deshabilitó explícitamente.
    - Mantener FitJeff en modo local cuando Firebase no esté habilitado o falten variables.
    - Exponer un estado simple de conexión para sincronización y diagnóstico.
    - Evitar que los servicios escriban datos si Firebase aún no está configurado.

  Se conecta con:
    - src/core/config/firebase.project.config.js
    - .env.example
    - src/core/firebase/firebase-app.service.js
    - src/core/firebase/firebase-database.service.js
    - src/core/sync/sync.service.js
*/

import { FIREBASE_PROJECT_CONFIG } from "./firebase.project.config.js";

function leerVariableEnv(nombre, valorDefecto = "") {
  try {
    return String(import.meta.env?.[nombre] ?? valorDefecto).trim();
  } catch {
    return String(valorDefecto).trim();
  }
}

function leerValor(nombreEnv, valorCodigo = "") {
  return leerVariableEnv(nombreEnv, valorCodigo || "");
}

function interpretarBoolean(valor, valorDefecto = false) {
  const normalizado = String(valor ?? "").trim().toLowerCase();

  if (!normalizado) return valorDefecto;
  if (["true", "1", "yes", "si", "sí", "on"].includes(normalizado)) return true;
  if (["false", "0", "no", "off"].includes(normalizado)) return false;

  return valorDefecto;
}

function credencialesBasicasPresentes(config) {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

function resolverFirebaseEnabled(config) {
  const valorEnv = leerVariableEnv("VITE_FIREBASE_ENABLED", "");

  if (valorEnv) {
    return interpretarBoolean(valorEnv, false);
  }

  if (typeof FIREBASE_PROJECT_CONFIG.enabled === "boolean") {
    return FIREBASE_PROJECT_CONFIG.enabled && credencialesBasicasPresentes(config);
  }

  return credencialesBasicasPresentes(config);
}

export const FIREBASE_CONFIG = Object.freeze({
  apiKey: leerValor("VITE_FIREBASE_API_KEY", FIREBASE_PROJECT_CONFIG.apiKey),
  authDomain: leerValor("VITE_FIREBASE_AUTH_DOMAIN", FIREBASE_PROJECT_CONFIG.authDomain),
  projectId: leerValor("VITE_FIREBASE_PROJECT_ID", FIREBASE_PROJECT_CONFIG.projectId),
  storageBucket: leerValor("VITE_FIREBASE_STORAGE_BUCKET", FIREBASE_PROJECT_CONFIG.storageBucket),
  messagingSenderId: leerValor("VITE_FIREBASE_MESSAGING_SENDER_ID", FIREBASE_PROJECT_CONFIG.messagingSenderId),
  appId: leerValor("VITE_FIREBASE_APP_ID", FIREBASE_PROJECT_CONFIG.appId)
});

export const FIREBASE_APP_OPTIONS = Object.freeze({
  enabled: resolverFirebaseEnabled(FIREBASE_CONFIG),
  collection: leerValor("VITE_FIREBASE_COLLECTION", FIREBASE_PROJECT_CONFIG.collection) || "fitjeff",
  userDocument: leerValor("VITE_FIREBASE_USER_DOCUMENT", FIREBASE_PROJECT_CONFIG.userDocument) || "jeff",
  registrosSubcollection: leerValor("VITE_FIREBASE_REGISTROS_SUBCOLLECTION", FIREBASE_PROJECT_CONFIG.registrosSubcollection) || "registros",
  statusDocument: leerValor("VITE_FIREBASE_STATUS_DOCUMENT", FIREBASE_PROJECT_CONFIG.statusDocument) || "status"
});

export function obtenerVariablesFirebaseFaltantes() {
  const requeridas = [
    ["VITE_FIREBASE_API_KEY o FIREBASE_PROJECT_CONFIG.apiKey", FIREBASE_CONFIG.apiKey],
    ["VITE_FIREBASE_PROJECT_ID o FIREBASE_PROJECT_CONFIG.projectId", FIREBASE_CONFIG.projectId],
    ["VITE_FIREBASE_APP_ID o FIREBASE_PROJECT_CONFIG.appId", FIREBASE_CONFIG.appId]
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
      mensaje: "Modo local activo. Firebase está deshabilitado o no tiene credenciales en código."
    };
  }

  if (!firebaseEstaConfigurado()) {
    return {
      modo: "pendiente-configuracion",
      habilitado: true,
      configurado: false,
      faltantes,
      mensaje: `Firebase está habilitado, pero faltan datos: ${faltantes.join(", ") || "sin detalle"}.`
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
