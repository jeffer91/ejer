/*
  Nombre completo: local-storage.service.js
  Ruta o ubicación: src/storage/local-storage.service.js

  Función:
    - Centralizar el guardado y lectura local de FitJeff.
    - Guardar perfil, rutina, entrenamientos, pesos, recomendaciones y ajustes.
    - Permitir que la app funcione sin internet y sincronice después con Firebase.
    - Evitar que app.js o app-controller.js repitan claves de localStorage.

  Se conecta con:
    - src/app-controller.js
    - src/data/usuario-base.js
    - src/data/rutina-base.js
    - src/sincronizacion/sincronizacion.service.js
    - src/exportacion/exportacion.service.js
*/

import { clonarUsuarioBase } from "../data/usuario-base.js";
import { clonarRutinaBase } from "../data/rutina-base.js";
import { guardarLocalJSON, leerLocalJSON, eliminarLocal } from "../ui/helpers.js";

export const STORAGE_KEYS = {
  PERFIL: "fitjeff_perfil",
  RUTINA: "fitjeff_rutina",
  ENTRENAMIENTOS: "fitjeff_entrenamientos",
  PESOS: "fitjeff_pesos",
  RECOMENDACIONES: "fitjeff_recomendaciones",
  AJUSTES: "fitjeff_ajustes",
  META: "fitjeff_meta"
};

export function crearEstadoBase() {
  return {
    usuario: clonarUsuarioBase(),
    rutina: clonarRutinaBase(),
    entrenamientos: [],
    pesos: [],
    recomendaciones: [],
    ajustes: crearAjustesBase(),
    diaSeleccionado: 1,
    meta: {
      versionDatos: 2,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      ultimaSincronizacion: null,
      ultimoErrorSincronizacion: null
    }
  };
}

export function crearAjustesBase() {
  return {
    usarFirebase: false,
    usarGemini: true,
    guardarLocalAutomatico: true,
    sincronizarAutomaticamente: false,
    mostrarConsejosSeguridad: true,
    mostrarRecomendaciones: true,
    mostrarEstadisticas: true,
    tema: "claro"
  };
}

export function cargarEstadoLocal() {
  const base = crearEstadoBase();

  return normalizarEstadoLocal({
    ...base,
    usuario: leerLocalJSON(STORAGE_KEYS.PERFIL, base.usuario),
    rutina: leerLocalJSON(STORAGE_KEYS.RUTINA, base.rutina),
    entrenamientos: leerLocalJSON(STORAGE_KEYS.ENTRENAMIENTOS, []),
    pesos: leerLocalJSON(STORAGE_KEYS.PESOS, []),
    recomendaciones: leerLocalJSON(STORAGE_KEYS.RECOMENDACIONES, []),
    ajustes: leerLocalJSON(STORAGE_KEYS.AJUSTES, base.ajustes),
    meta: leerLocalJSON(STORAGE_KEYS.META, base.meta)
  });
}

export function guardarEstadoLocal(estado) {
  if (!estado || typeof estado !== "object") {
    return false;
  }

  const copia = normalizarEstadoLocal(estado);
  copia.meta.actualizadoEn = new Date().toISOString();

  return [
    guardarLocalJSON(STORAGE_KEYS.PERFIL, copia.usuario),
    guardarLocalJSON(STORAGE_KEYS.RUTINA, copia.rutina),
    guardarLocalJSON(STORAGE_KEYS.ENTRENAMIENTOS, copia.entrenamientos),
    guardarLocalJSON(STORAGE_KEYS.PESOS, copia.pesos),
    guardarLocalJSON(STORAGE_KEYS.RECOMENDACIONES, copia.recomendaciones),
    guardarLocalJSON(STORAGE_KEYS.AJUSTES, copia.ajustes),
    guardarLocalJSON(STORAGE_KEYS.META, copia.meta)
  ].every(Boolean);
}

export function guardarParteEstado(clave, valor) {
  const key = STORAGE_KEYS[clave];

  if (!key) {
    throw new Error(`Clave local no permitida: ${clave}`);
  }

  return guardarLocalJSON(key, valor);
}

export function borrarEstadoLocal() {
  Object.values(STORAGE_KEYS).forEach((clave) => eliminarLocal(clave));
  return crearEstadoBase();
}

export function obtenerResumenAlmacenamientoLocal(estado = cargarEstadoLocal()) {
  return {
    usuario: Boolean(estado.usuario),
    rutina: Boolean(estado.rutina),
    entrenamientos: estado.entrenamientos?.length || 0,
    pesos: estado.pesos?.length || 0,
    recomendaciones: estado.recomendaciones?.length || 0,
    ajustes: Boolean(estado.ajustes),
    firebaseActivo: Boolean(estado.ajustes?.usarFirebase),
    sincronizacionAutomatica: Boolean(estado.ajustes?.sincronizarAutomaticamente),
    ultimaActualizacion: estado.meta?.actualizadoEn || null,
    ultimaSincronizacion: estado.meta?.ultimaSincronizacion || null,
    ultimoErrorSincronizacion: estado.meta?.ultimoErrorSincronizacion || null
  };
}

export function marcarSincronizacionLocal(estado, fecha = new Date().toISOString()) {
  const copia = normalizarEstadoLocal(estado);
  copia.meta.ultimaSincronizacion = fecha;
  copia.meta.ultimoErrorSincronizacion = null;
  copia.meta.actualizadoEn = fecha;
  guardarEstadoLocal(copia);
  return copia;
}

export function marcarErrorSincronizacionLocal(estado, mensaje) {
  const copia = normalizarEstadoLocal(estado);
  copia.meta.ultimoErrorSincronizacion = String(mensaje || "Error de sincronización");
  copia.meta.actualizadoEn = new Date().toISOString();
  guardarEstadoLocal(copia);
  return copia;
}

export function normalizarEstadoLocal(estado = crearEstadoBase()) {
  const base = crearEstadoBase();
  const ajustesEntrada = estado.ajustes || {};

  return {
    ...base,
    ...estado,
    usuario: {
      ...base.usuario,
      ...(estado.usuario || {}),
      perfil: {
        ...base.usuario.perfil,
        ...(estado.usuario?.perfil || {})
      },
      control: {
        ...base.usuario.control,
        ...(estado.usuario?.control || {})
      }
    },
    rutina: estado.rutina || base.rutina,
    entrenamientos: Array.isArray(estado.entrenamientos) ? estado.entrenamientos : [],
    pesos: Array.isArray(estado.pesos) ? estado.pesos : [],
    recomendaciones: Array.isArray(estado.recomendaciones) ? estado.recomendaciones : [],
    ajustes: {
      ...base.ajustes,
      ...ajustesEntrada,
      sincronizarAutomaticamente:
        ajustesEntrada.usarFirebase === true && ajustesEntrada.sincronizarAutomaticamente === true
    },
    meta: {
      ...base.meta,
      ...(estado.meta || {})
    },
    diaSeleccionado: Number(estado.diaSeleccionado || estado.rutina?.diaActual || 1)
  };
}
