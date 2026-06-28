/*
  Nombre completo: shell.memory.js
  Ruta o ubicación: src/shell/shell.memory.js

  Función o funciones:
    - Guardar la última ubicación abierta dentro de la app.
    - Recordar módulo principal y pantalla interna.
    - Evitar errores si localStorage no está disponible.
    - Usar almacenamiento seguro centralizado.

  Se conecta con:
    - src/app/app-router.js
    - src/shell/shell.router.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../core/storage/safe-local-storage.service.js";

const SHELL_MEMORY_KEY = "fitjeff:shell:last-location";

function normalizarUbicacionMemoria(ubicacion) {
  if (!ubicacion || typeof ubicacion !== "object") {
    return null;
  }

  const moduloId = typeof ubicacion.moduloId === "string" ? ubicacion.moduloId.trim() : "";
  const rutaId = typeof ubicacion.rutaId === "string" ? ubicacion.rutaId.trim() : "";

  if (!moduloId || !rutaId) {
    return null;
  }

  return {
    moduloId,
    rutaId,
    actualizadoEn: typeof ubicacion.actualizadoEn === "string" ? ubicacion.actualizadoEn : ""
  };
}

export function leerUbicacionShell(storage = crearSafeLocalStorageService()) {
  return normalizarUbicacionMemoria(storage.leerJson(SHELL_MEMORY_KEY, null));
}

export function guardarUbicacionShell(ubicacion = {}, storage = crearSafeLocalStorageService()) {
  const ubicacionNormalizada = normalizarUbicacionMemoria(ubicacion);

  if (!ubicacionNormalizada) {
    return false;
  }

  return storage.guardarJson(SHELL_MEMORY_KEY, {
    moduloId: ubicacionNormalizada.moduloId,
    rutaId: ubicacionNormalizada.rutaId,
    actualizadoEn: new Date().toISOString()
  });
}

export function limpiarUbicacionShell(storage = crearSafeLocalStorageService()) {
  return storage.eliminar(SHELL_MEMORY_KEY);
}
