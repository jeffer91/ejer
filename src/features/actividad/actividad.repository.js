/*
  Nombre completo: actividad.repository.js
  Ruta o ubicación: src/features/actividad/actividad.repository.js

  Función o funciones:
    - Leer y guardar registros manuales de Actividad con almacenamiento local seguro.
    - Evitar que un JSON dañado rompa el módulo Actividad.
    - Mantener Actividad independiente de Control corporal y Entrenamiento.

  Se conecta con:
    - src/features/actividad/actividad.service.js
    - src/features/actividad/actividad.constants.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../core/storage/safe-local-storage.service.js";
import { ACTIVIDAD_STORAGE_KEY } from "./actividad.constants.js";

function crearId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `actividad-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizarRegistros(valor) {
  return Array.isArray(valor) ? valor : [];
}

export function crearActividadRepository(storage = crearSafeLocalStorageService()) {
  function leerRegistros() {
    return normalizarRegistros(storage.leerJson(ACTIVIDAD_STORAGE_KEY, []));
  }

  function guardarRegistros(registros) {
    storage.guardarJson(ACTIVIDAD_STORAGE_KEY, normalizarRegistros(registros));
    return registros;
  }

  function listar() {
    return leerRegistros().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }

  function guardar(registro) {
    const registros = listar();
    const nuevo = {
      id: crearId(),
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      ...registro
    };

    guardarRegistros([nuevo, ...registros]);
    return nuevo;
  }

  return {
    listar,
    guardar
  };
}
