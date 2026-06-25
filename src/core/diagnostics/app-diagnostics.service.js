/*
  Nombre completo: app-diagnostics.service.js
  Ruta o ubicación: src/core/diagnostics/app-diagnostics.service.js

  Función o funciones:
    - Guardar diagnósticos internos ocultos para revisar fallas después.
    - Registrar errores sin mostrar código, JSON ni detalles técnicos al usuario.
    - Mantener solo una cantidad limitada de eventos para no llenar el almacenamiento.

  Se conecta con:
    - src/core/config/app.config.js
    - src/core/storage/safe-local-storage.service.js
    - src/core/errors/app-error-handler.service.js
*/

import { APP_CONFIG, APP_STORAGE_KEYS } from "../config/app.config.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";

const LIMITE_EVENTOS = 80;

export function crearAppDiagnosticsService() {
  const storage = crearSafeLocalStorageService();

  function listarEventos() {
    return storage.leerJson(APP_STORAGE_KEYS.DIAGNOSTICS, []);
  }

  function registrarEvento({ nivel = "info", modulo = "core", accion = "general", mensaje = "", detalle = null } = {}) {
    const evento = {
      id: crypto.randomUUID ? crypto.randomUUID() : `diag-${Date.now()}`,
      app: APP_CONFIG.nombre,
      version: APP_CONFIG.version,
      nivel,
      modulo,
      accion,
      mensaje,
      detalle,
      creadoEn: obtenerFechaHoraISO()
    };

    const eventos = [evento, ...listarEventos()].slice(0, LIMITE_EVENTOS);
    storage.guardarJson(APP_STORAGE_KEYS.DIAGNOSTICS, eventos);
    return evento;
  }

  function limpiarEventos() {
    storage.guardarJson(APP_STORAGE_KEYS.DIAGNOSTICS, []);
  }

  return {
    listarEventos,
    registrarEvento,
    limpiarEventos
  };
}
