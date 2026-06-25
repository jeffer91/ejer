/*
  Nombre completo: firebase-error.service.js
  Ruta o ubicación: src/core/firebase/firebase-error.service.js

  Función o funciones:
    - Convertir fallas de Firebase en mensajes simples para la app.
    - Guardar detalle interno en diagnóstico oculto.
    - Evitar mostrar código técnico al usuario.

  Se conecta con:
    - src/core/firebase/firebase-app.service.js
    - src/core/firebase/firebase-database.service.js
    - src/core/diagnostics/app-diagnostics.service.js
*/

import { crearAppDiagnosticsService } from "../diagnostics/app-diagnostics.service.js";

export function crearFirebaseErrorService() {
  const diagnostics = crearAppDiagnosticsService();

  function registrar(error, accion = "firebase") {
    diagnostics.registrarEvento({
      nivel: "error",
      modulo: "firebase",
      accion,
      mensaje: error?.message || "Falla de Firebase",
      detalle: {
        name: error?.name || "FirebaseError",
        code: error?.code || "sin-codigo"
      }
    });

    return {
      ok: false,
      mensaje: "No se pudo conectar con la nube. Tus datos locales siguen guardados."
    };
  }

  function noConfigurado() {
    return {
      ok: false,
      mensaje: "Firebase todavía no está configurado. La app seguirá funcionando localmente."
    };
  }

  return {
    registrar,
    noConfigurado
  };
}
