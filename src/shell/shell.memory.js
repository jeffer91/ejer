/*
  Nombre completo: shell.memory.js
  Ruta o ubicación: src/shell/shell.memory.js

  Función o funciones:
    - Guardar la última ubicación abierta dentro de la app.
    - Recordar módulo principal y pantalla interna.
    - Evitar errores si localStorage no está disponible.

  Se conecta con:
    - src/app/app-router.js
    - src/shell/shell.router.js
*/

const SHELL_MEMORY_KEY = "fitjeff:shell:last-location";

function obtenerStorageSeguro() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    return window.localStorage;
  } catch {
    return null;
  }
}

export function leerUbicacionShell() {
  const storage = obtenerStorageSeguro();

  if (!storage) {
    return null;
  }

  try {
    const valor = storage.getItem(SHELL_MEMORY_KEY);

    if (!valor) {
      return null;
    }

    const ubicacion = JSON.parse(valor);

    if (!ubicacion || typeof ubicacion !== "object") {
      return null;
    }

    return {
      moduloId: ubicacion.moduloId || "",
      rutaId: ubicacion.rutaId || "",
      actualizadoEn: ubicacion.actualizadoEn || ""
    };
  } catch {
    return null;
  }
}

export function guardarUbicacionShell(ubicacion = {}) {
  const storage = obtenerStorageSeguro();

  if (!storage || !ubicacion.moduloId || !ubicacion.rutaId) {
    return false;
  }

  try {
    storage.setItem(
      SHELL_MEMORY_KEY,
      JSON.stringify({
        moduloId: ubicacion.moduloId,
        rutaId: ubicacion.rutaId,
        actualizadoEn: new Date().toISOString()
      })
    );

    return true;
  } catch {
    return false;
  }
}

export function limpiarUbicacionShell() {
  const storage = obtenerStorageSeguro();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(SHELL_MEMORY_KEY);
    return true;
  } catch {
    return false;
  }
}
