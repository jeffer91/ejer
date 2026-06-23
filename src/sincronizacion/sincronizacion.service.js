/*
  Nombre completo: sincronizacion.service.js
  Ruta o ubicación: src/sincronizacion/sincronizacion.service.js

  Función:
    - Sincronizar datos locales de FitJeff con Firebase Firestore.
    - Trabajar local primero y no romper la app si Firebase falla.
    - Usar la estructura Firestore: fitjeff / jeff.
*/

import {
  prepararFirestore,
  sincronizarBaseFirestore,
  guardarEntrenamientoFirestore,
  guardarPesoFirestore,
  guardarRecomendacionFirestore,
  guardarSincronizacionFirestore,
  leerPerfilFirestore,
  leerRutinaFirestore,
  leerAjustesFirestore,
  leerResumenEstadisticasFirestore,
  listarEntrenamientosFirestore,
  listarPesosFirestore,
  listarRecomendacionesFirestore
} from "../firebase/firestore.service.js";

import {
  crearPayloadBaseFitJeff,
  marcarItemSincronizado,
  mezclarItemsFitJeff,
  normalizarItemsRemotosFitJeff
} from "./sync-fitjeff.mapper.js";

export const ESTADOS_SINCRONIZACION = {
  LISTO: "listo",
  SINCRONIZANDO: "sincronizando",
  OFFLINE: "offline",
  ERROR: "error"
};

export function estaOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function puedeUsarFirebase(ajustes = {}) {
  return ajustes.usarFirebase !== false;
}

export function crearResumenSincronizacion() {
  return {
    estado: ESTADOS_SINCRONIZACION.LISTO,
    ok: true,
    perfil: false,
    rutina: false,
    ajustes: false,
    entrenamientosSubidos: 0,
    pesosSubidos: 0,
    recomendacionesSubidas: 0,
    errores: [],
    iniciadoEn: new Date().toISOString(),
    terminadoEn: null,
    estructuraFirestore: "fitjeff/jeff"
  };
}

export async function sincronizarEstadoConFirebase({ estado, guardarLocal, onCambio }) {
  const resumen = crearResumenSincronizacion();

  if (!estado || typeof estado !== "object") {
    return finalizarConError(resumen, "Estado local invalido para sincronizar.");
  }

  if (!puedeUsarFirebase(estado.ajustes)) {
    resumen.estado = ESTADOS_SINCRONIZACION.LISTO;
    resumen.ok = true;
    resumen.terminadoEn = new Date().toISOString();
    return resumen;
  }

  if (!estaOnline()) {
    resumen.estado = ESTADOS_SINCRONIZACION.OFFLINE;
    resumen.ok = false;
    resumen.errores.push("Sin conexion a internet. Los datos quedan pendientes.");
    resumen.terminadoEn = new Date().toISOString();
    return resumen;
  }

  try {
    resumen.estado = ESTADOS_SINCRONIZACION.SINCRONIZANDO;
    onCambio?.(resumen);

    await prepararFirestore();

    const payload = crearPayloadBaseFitJeff(estado);

    await sincronizarBaseFirestore({
      usuario: payload.usuario,
      rutina: payload.rutina,
      ajustes: payload.ajustes
    });

    resumen.perfil = Boolean(payload.perfil);
    resumen.rutina = Boolean(payload.rutina);
    resumen.ajustes = Boolean(payload.ajustes);

    resumen.entrenamientosSubidos = await subirPendientes({
      items: payload.entrenamientos,
      guardarItem: guardarEntrenamientoFirestore,
      tipo: "entrenamiento"
    });

    resumen.pesosSubidos = await subirPendientes({
      items: payload.pesos,
      guardarItem: guardarPesoFirestore,
      tipo: "peso"
    });

    resumen.recomendacionesSubidas = await subirPendientes({
      items: payload.recomendaciones,
      guardarItem: guardarRecomendacionFirestore,
      tipo: "recomendacion"
    });

    resumen.estado = ESTADOS_SINCRONIZACION.LISTO;
    resumen.ok = true;
    resumen.terminadoEn = new Date().toISOString();

    if (estado.usuario?.control) {
      estado.usuario.control.ultimaSincronizacion = resumen.terminadoEn;
    }

    if (estado.meta) {
      estado.meta.ultimaSincronizacion = resumen.terminadoEn;
      estado.meta.ultimoErrorSincronizacion = null;
    }

    await guardarSincronizacionFirestore(resumen);
    guardarLocal?.();
    onCambio?.(resumen);

    return resumen;
  } catch (error) {
    return finalizarConError(resumen, error);
  }
}

export async function descargarEstadoDesdeFirebase() {
  if (!estaOnline()) {
    return {
      ok: false,
      estado: ESTADOS_SINCRONIZACION.OFFLINE,
      mensaje: "No se puede descargar desde Firebase sin internet."
    };
  }

  try {
    await prepararFirestore();

    const [
      perfil,
      rutina,
      ajustes,
      resumenEstadisticas,
      entrenamientos,
      pesos,
      recomendaciones
    ] = await Promise.all([
      leerPerfilFirestore(),
      leerRutinaFirestore(),
      leerAjustesFirestore(),
      leerResumenEstadisticasFirestore(),
      listarEntrenamientosFirestore(100),
      listarPesosFirestore(100),
      listarRecomendacionesFirestore(30)
    ]);

    return {
      ok: true,
      estado: ESTADOS_SINCRONIZACION.LISTO,
      datos: {
        perfil,
        rutina,
        ajustes,
        resumenEstadisticas,
        entrenamientos: normalizarItemsRemotosFitJeff(entrenamientos),
        pesos: normalizarItemsRemotosFitJeff(pesos),
        recomendaciones: normalizarItemsRemotosFitJeff(recomendaciones)
      }
    };
  } catch (error) {
    return {
      ok: false,
      estado: ESTADOS_SINCRONIZACION.ERROR,
      mensaje: obtenerMensajeError(error),
      error
    };
  }
}

export function aplicarDatosFirebaseEnEstado(estado, datosFirebase) {
  if (!estado || !datosFirebase) return estado;

  const copia = structuredClone(estado);

  if (datosFirebase.perfil) {
    copia.usuario = copia.usuario || {};
    copia.usuario.perfil = {
      ...copia.usuario.perfil,
      ...datosFirebase.perfil
    };
  }

  if (datosFirebase.rutina) {
    copia.rutina = datosFirebase.rutina;
  }

  if (datosFirebase.ajustes) {
    copia.ajustes = {
      ...copia.ajustes,
      ...datosFirebase.ajustes
    };
  }

  if (Array.isArray(datosFirebase.entrenamientos)) {
    copia.entrenamientos = mezclarItemsFitJeff(copia.entrenamientos || [], datosFirebase.entrenamientos);
  }

  if (Array.isArray(datosFirebase.pesos)) {
    copia.pesos = mezclarItemsFitJeff(copia.pesos || [], datosFirebase.pesos);
  }

  if (Array.isArray(datosFirebase.recomendaciones)) {
    copia.recomendaciones = mezclarItemsFitJeff(copia.recomendaciones || [], datosFirebase.recomendaciones);
  }

  return copia;
}

async function subirPendientes({ items, guardarItem, tipo }) {
  if (!Array.isArray(items) || typeof guardarItem !== "function") return 0;

  let subidos = 0;

  for (const item of items) {
    if (item.sincronizado === true || item.idFirestore) continue;

    try {
      const respuesta = await guardarItem(item);
      Object.assign(item, marcarItemSincronizado(item, respuesta));
      subidos += 1;
    } catch (error) {
      item.sincronizado = false;
      item.errorSincronizacion = obtenerMensajeError(error);
      console.warn(`No se pudo sincronizar ${tipo}.`, error);
    }
  }

  return subidos;
}

function finalizarConError(resumen, error) {
  resumen.estado = ESTADOS_SINCRONIZACION.ERROR;
  resumen.ok = false;
  resumen.errores.push(obtenerMensajeError(error));
  resumen.terminadoEn = new Date().toISOString();
  return resumen;
}

function obtenerMensajeError(error) {
  if (!error) return "Error desconocido.";
  if (typeof error === "string") return error;
  return error.message || "Error desconocido.";
}
