/*
  Nombre completo: firebase.config.js
  Ruta o ubicación: src/firebase/firebase.config.js

  Función:
    - Guardar la configuración pública de Firebase Web para FitJeff.
    - Conectar la app web personal con el proyecto Firebase Jeff.
    - Centralizar el projectId, appId y demás valores usados por el SDK.

  Se conecta con:
    - src/firebase/firebase.app.js
    - src/firebase/firestore.service.js
    - src/app.js cuando se conecte la sincronización final.

  Nota:
    - Esta configuración web no reemplaza las reglas de seguridad de Firestore.
    - La clave privada de Gemini nunca debe ir en este archivo.
*/

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAJgkVqr7p_GKnYFTSHybvBLyFGHplE_uc",
  authDomain: "jeff-2f92d.firebaseapp.com",
  projectId: "jeff-2f92d",
  storageBucket: "jeff-2f92d.firebasestorage.app",
  messagingSenderId: "337984443748",
  appId: "1:337984443748:web:86e7019aa4a5559c3b9671",
  measurementId: "G-PMQ5N15D5Y"
};

export const FIREBASE_APP_INFO = {
  nombreProyecto: "Jeff",
  idProyecto: "jeff-2f92d",
  nombreAppWeb: "personal",
  usuarioPrincipalId: "jeff"
};
