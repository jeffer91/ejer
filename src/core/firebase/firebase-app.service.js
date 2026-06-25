/*
  Nombre completo: firebase-app.service.js
  Ruta o ubicación: src/core/firebase/firebase-app.service.js

  Función o funciones:
    - Inicializar Firebase solo si está configurado.
    - Crear una única instancia de app y Firestore.
    - Mantener la app local funcionando aunque Firebase esté apagado.

  Se conecta con:
    - src/core/config/firebase.config.js
    - src/core/firebase/firebase-error.service.js
    - src/core/firebase/firebase-database.service.js
*/

import { FIREBASE_CONFIG, firebaseEstaConfigurado } from "../config/firebase.config.js";
import { crearFirebaseErrorService } from "./firebase-error.service.js";

let firebaseApp = null;
let firestoreDb = null;
let firebaseSdk = null;
let firestoreSdk = null;

export function crearFirebaseAppService() {
  const errorService = crearFirebaseErrorService();

  async function cargarSdk() {
    if (firebaseSdk && firestoreSdk) {
      return { firebaseSdk, firestoreSdk };
    }

    firebaseSdk = await import("firebase/app");
    firestoreSdk = await import("firebase/firestore");

    return { firebaseSdk, firestoreSdk };
  }

  async function inicializar() {
    if (!firebaseEstaConfigurado()) {
      return errorService.noConfigurado();
    }

    try {
      const sdk = await cargarSdk();

      if (!firebaseApp) {
        firebaseApp = sdk.firebaseSdk.initializeApp(FIREBASE_CONFIG);
      }

      if (!firestoreDb) {
        firestoreDb = sdk.firestoreSdk.getFirestore(firebaseApp);
      }

      return {
        ok: true,
        app: firebaseApp,
        db: firestoreDb,
        firestore: sdk.firestoreSdk
      };
    } catch (error) {
      return errorService.registrar(error, "inicializar");
    }
  }

  function estaListo() {
    return Boolean(firebaseApp && firestoreDb);
  }

  return {
    inicializar,
    estaListo
  };
}
