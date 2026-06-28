import { DISPOSITIVOS_STORAGE_KEY, crearEstadoDispositivosBase } from "./dispositivos.constants.js";

function leerJsonSeguro(valor) {
  try {
    return valor ? JSON.parse(valor) : null;
  } catch (error) {
    console.warn("No se pudo leer la configuración de dispositivos.", error);
    return null;
  }
}

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

export function crearDispositivosRepository(storage = localStorage) {
  function obtenerEstado() {
    return mezclarEstado(leerJsonSeguro(storage.getItem(DISPOSITIVOS_STORAGE_KEY)));
  }

  function guardarEstado(estado) {
    const estadoFinal = {
      ...mezclarEstado(estado),
      actualizadoEn: new Date().toISOString()
    };

    storage.setItem(DISPOSITIVOS_STORAGE_KEY, JSON.stringify(estadoFinal));
    return estadoFinal;
  }

  return {
    obtenerEstado,
    guardarEstado
  };
}
