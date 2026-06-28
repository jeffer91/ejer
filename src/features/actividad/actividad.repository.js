import { ACTIVIDAD_STORAGE_KEY } from "./actividad.constants.js";

function leerLocalStorage() {
  try {
    const raw = localStorage.getItem(ACTIVIDAD_STORAGE_KEY);
    const datos = raw ? JSON.parse(raw) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarLocalStorage(registros) {
  localStorage.setItem(ACTIVIDAD_STORAGE_KEY, JSON.stringify(registros));
}

function crearId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `actividad-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function crearActividadRepository() {
  function listar() {
    return leerLocalStorage().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }

  function guardar(registro) {
    const registros = listar();
    const nuevo = {
      id: crearId(),
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      ...registro
    };

    guardarLocalStorage([nuevo, ...registros]);
    return nuevo;
  }

  return {
    listar,
    guardar
  };
}
