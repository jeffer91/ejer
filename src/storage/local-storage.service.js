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
      versionDatos: 1,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      ultimaSincronizacion: null
    }
  };
}

export function crearAjustesBase() {
  return {
    usarFirebase: true,
    usarGemini: true,
    guardarLocalAutomatico: true,
    sincronizarAutomaticamente: true,
    mostrarConsejosSeguridad: true,
    mostrarRecomendaciones: true,
    mostrarEstadisticas: true,
    tema: "claro"
  };
}

export function cargarEstadoLocal() {
  const base = crearEstadoBase();
  const usuario = leerLocalJSON(STORAGE_KEYS.PERFIL, base.usuario);
  const rutina = leerLocalJSON(STORAGE_KEYS.RUTINA, base.rutina);
  const entrenamientos = leerLocalJSON(STORAGE_KEYS.ENTRENAMIENTOS, base.entrenamientos);
  const pesos = leerLocalJSON(STORAGE_KEYS.PESOS, base.pesos);
  const recomendaciones = leerLocalJSON(STORAGE_KEYS.RECOMENDACIONES, base.recomendaciones);
  const ajustes = leerLocalJSON(STORAGE_KEYS.AJUSTES, base.ajustes);
  const meta = leerLocalJSON(STORAGE_KEYS.META, base.meta);

  return normalizarEstadoLocal({
    ...base,
    usuario,
    rutina,
    entrenamientos,
    pesos,
    recomendaciones,
    ajustes: {
      ...base.ajustes,
      ...ajustes
    },
    meta: {
      ...base.meta,
      ...meta
    }
  });
}

export function guardarEstadoLocal(estado) {
  if (!estado || typeof estado !== "object") {
    return false;
  }

  const copia = normalizarEstadoLocal(estado);
  copia.meta.actualizadoEn = new Date().toISOString();

  const resultados = [
    guardarLocalJSON(STORAGE_KEYS.PERFIL, copia.usuario),
    guardarLocalJSON(STORAGE_KEYS.RUTINA, copia.rutina),
    guardarLocalJSON(STORAGE_KEYS.ENTRENAMIENTOS, copia.entrenamientos),
    guardarLocalJSON(STORAGE_KEYS.PESOS, copia.pesos),
    guardarLocalJSON(STORAGE_KEYS.RECOMENDACIONES, copia.recomendaciones),
    guardarLocalJSON(STORAGE_KEYS.AJUSTES, copia.ajustes),
    guardarLocalJSON(STORAGE_KEYS.META, copia.meta)
  ];

  return resultados.every(Boolean);
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
    ultimaActualizacion: estado.meta?.actualizadoEn || null,
    ultimaSincronizacion: estado.meta?.ultimaSincronizacion || null
  };
}

export function marcarSincronizacionLocal(estado, fecha = new Date().toISOString()) {
  const copia = normalizarEstadoLocal(estado);
  copia.meta.ultimaSincronizacion = fecha;
  copia.meta.actualizadoEn = fecha;
  guardarEstadoLocal(copia);
  return copia;
}

export function normalizarEstadoLocal(estado = crearEstadoBase()) {
  const base = crearEstadoBase();

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
      ...(estado.ajustes || {})
    },
    meta: {
      ...base.meta,
      ...(estado.meta || {})
    },
    diaSeleccionado: Number(estado.diaSeleccionado || estado.rutina?.diaActual || 1)
  };
}
