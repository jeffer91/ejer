/*
  Nombre completo: app-error-handler.service.js
  Ruta o ubicación: src/core/errors/app-error-handler.service.js

  Función o funciones:
    - Manejar errores generales sin detener toda la app.
    - Mostrar mensajes simples al usuario cuando sea necesario.
    - Guardar detalles internos en diagnóstico oculto.

  Se conecta con:
    - src/core/diagnostics/app-diagnostics.service.js
    - src/core/status/app-status.service.js
    - src/app/app.bootstrap.js
*/

import { crearAppDiagnosticsService } from "../diagnostics/app-diagnostics.service.js";
import { crearAppStatusService } from "../status/app-status.service.js";

function obtenerMensajeSeguro(error) {
  if (error?.message) {
    return error.message;
  }

  return "Error no especificado.";
}

export function crearAppErrorHandlerService() {
  const diagnostics = crearAppDiagnosticsService();
  const status = crearAppStatusService();

  function registrarError(error, contexto = {}) {
    const mensajeInterno = obtenerMensajeSeguro(error);
    const mensajeUsuario = contexto.mensajeUsuario || "Algo no se pudo completar, pero la app sigue funcionando.";

    diagnostics.registrarEvento({
      nivel: "error",
      modulo: contexto.modulo || "app",
      accion: contexto.accion || "sin-accion",
      mensaje: mensajeInterno,
      detalle: {
        name: error?.name || "Error",
        stack: error?.stack || "",
        contexto
      }
    });

    status.marcarErrorSimple(mensajeUsuario);

    return {
      ok: false,
      mensaje: mensajeUsuario
    };
  }

  function instalarCapturaGlobal() {
    window.addEventListener("error", (evento) => {
      registrarError(evento.error || new Error(evento.message), {
        modulo: "window",
        accion: "error-global",
        mensajeUsuario: "La app detectó un problema, pero sigue funcionando."
      });
    });

    window.addEventListener("unhandledrejection", (evento) => {
      registrarError(evento.reason || new Error("Promesa rechazada"), {
        modulo: "window",
        accion: "promesa-sin-control",
        mensajeUsuario: "La app detectó un problema, pero sigue funcionando."
      });
    });
  }

  return {
    registrarError,
    instalarCapturaGlobal
  };
}
