/*
  Nombre completo: firebase.project.config.js
  Ruta o ubicación: src/core/config/firebase.project.config.js

  Función o funciones:
    - Guardar la configuración de Firebase desde código cuando no se usen variables Vite.
    - Permitir que FitJeff restaure datos desde Firebase antes de mostrar la pantalla inicial.
    - Mantener los nombres de colección/documento en un solo lugar.

  Nota:
    - La configuración web de Firebase identifica el proyecto, pero no reemplaza las reglas de seguridad.
    - Si este repositorio es público, revisa las reglas de Firestore antes de poner aquí una configuración real.

  Se conecta con:
    - src/core/config/firebase.config.js
*/

export const FIREBASE_PROJECT_CONFIG = Object.freeze({
  enabled: true,
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  collection: "fitjeff",
  userDocument: "jeff",
  registrosSubcollection: "registros",
  statusDocument: "status"
});
