/*
  Nombre completo: firebase.app.js
  Ruta o ubicación: src/firebase/firebase.app.js

  Función:
    - Inicializar Firebase para FitJeff.
    - Crear una sola instancia de app, Firestore y Analytics cuando esté disponible.
    - Permitir que la app funcione en Live Server, celular y Electron sin duplicar inicializaciones.

  Se conecta con:
    - src/firebase/firebase.config.js
    - src/firebase/firestore.service.js
    - src/app.js cuando se active Firebase en el flujo principal.
*/

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { FIREBASE_CONFIG, FIREBASE_APP_INFO } from "./firebase.config.js";

let firebaseApp = null;
let firestoreDb = null;
let analyticsInstance = null;
let persistenciaSolicitada = false;
let persistenciaActiva = false;

export function inicializarFirebase() {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }

  if (!firestoreDb) {
    firestoreDb = getFirestore(firebaseApp);
  }

  inicializarAnalyticsSeguro();

  return {
    app: firebaseApp,
    db: firestoreDb,
    analytics: analyticsInstance,
    info: FIREBASE_APP_INFO
  };
}

export function obtenerFirebaseApp() {
  if (!firebaseApp) {
    inicializarFirebase();
  }

  return firebaseApp;
}

export function obtenerFirestore() {
  if (!firestoreDb) {
    inicializarFirebase();
  }

  return firestoreDb;
}

export async function activarPersistenciaFirestore() {
  if (persistenciaSolicitada) {
    return persistenciaActiva;
  }

  persistenciaSolicitada = true;

  try {
    const db = obtenerFirestore();
    await enableIndexedDbPersistence(db);
    persistenciaActiva = true;
    return true;
  } catch (error) {
    persistenciaActiva = false;
    console.warn("Persistencia local de Firestore no activada.", error);
    return false;
  }
}

async function inicializarAnalyticsSeguro() {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  try {
    const soportado = await isSupported();

    if (soportado) {
      analyticsInstance = getAnalytics(firebaseApp);
    }
  } catch (error) {
    analyticsInstance = null;
    console.warn("Analytics no disponible en este entorno.", error);
  }

  return analyticsInstance;
}

export function obtenerInfoFirebase() {
  return {
    ...FIREBASE_APP_INFO,
    appInicializada: Boolean(firebaseApp),
    firestoreInicializado: Boolean(firestoreDb),
    analyticsActivo: Boolean(analyticsInstance),
    persistenciaActiva
  };
}
