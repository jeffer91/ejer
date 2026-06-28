/*
  Nombre completo: dispositivos.repository.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.repository.js

  Función o funciones:
    - Leer y guardar configuración local de Dispositivos con almacenamiento seguro.
    - Mezclar datos guardados con estructura base para evitar campos perdidos.
    - Evitar que configuración dañada de Cubitt, Google Fit o puente rompa Actividad.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/features/actividad/dispositivos/dispositivos.constants.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../../core/storage/safe-local-storage.service.js";
import { DISPOSITIVOS_STORAGE_KEY, crearEstadoDispositivosBase } from "./dispositivos.constants.js";

function mezclarEstado(guardado) {
  const base = crearEstadoDispositivosBase();

  if (!guardado || typeof guardado !== "object") {
    return base;
  }

  return {
    ...base,
    ...guardado,
    cubitt: {
      ...base.cubitt,
      ...(guardado.cubitt || {})
    },
    googleFit: {
      ...base.googleFit,
      ...(guardado.googleFit || {})
    },
    puente: {
      ...base.puente,
      ...(guardado.puente || {})
    },
    historial: Array.isArray(guardado.historial) ? guardado.historial : []
  };
}

export function crearDispositivosRepository(storage = crearSafeLocalStorageService()) {
  function obtenerEstado() {
    return mezclarEstado(storage.leerJson(DISPOSITIVOS_STORAGE_KEY, null));
  }

  function guardarEstado(estado) {
    const estadoFinal = {
      ...mezclarEstado(estado),
      actualizadoEn: new Date().toISOString()
    };

    storage.guardarJson(DISPOSITIVOS_STORAGE_KEY, estadoFinal);
    return estadoFinal;
  }

  return {
    obtenerEstado,
    guardarEstado
  };
}
