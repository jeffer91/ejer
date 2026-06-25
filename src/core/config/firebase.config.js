/*
  Nombre completo: firebase.config.js
  Ruta o ubicación: src/core/config/firebase.config.js

  Función o funciones:
    - Centralizar la configuración pública de Firebase.
    - Evitar que los servicios escriban datos si Firebase aún no está configurado.
    - Mantener Firebase oculto para el usuario final.

  Se conecta con:
    - src/core/firebase/firebase-app.service.js
    - src/core/firebase/firebase-database.service.js
    - src/core/sync/sync.service.js
*/

export const FIREBASE_CONFIG = Object.freeze({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});

export const FIREBASE_APP_OPTIONS = Object.freeze({
  enabled: false,
  collection: "fitjeff",
  userDocument: "jeff",
  registrosSubcollection: "registros",
  statusDocument: "status"
});

export function firebaseEstaConfigurado() {
  return Boolean(
    FIREBASE_APP_OPTIONS.enabled &&
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
  );
}
