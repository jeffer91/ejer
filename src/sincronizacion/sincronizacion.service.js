/*
  Nombre completo: sincronizacion.service.js
  Ruta o ubicación: src/sincronizacion/sincronizacion.service.js

  Función:
    - Sincronizar datos locales de FitJeff con Firebase Firestore.
    - Subir perfil, rutina, ajustes, entrenamientos, pesos y recomendaciones pendientes.
    - Descargar datos existentes desde Firestore para reconstruir el estado local.
    - Trabajar con modo offline: si no hay internet, no rompe la app y deja los datos pendientes.

  Se conecta con:
    - src/firebase/firestore.service.js
    - src/app.js cuando se integre el flujo final.
    - src/perfil/perfil.service.js
    - src/peso/peso.service.js
    - src/entrenamiento/entrenamiento.service.js
    - src/estadisticas/estadisticas.service.js
    - src/recomendaciones/recomendaciones.service.js cuando se cree.
*/

import {
  prepararFirestore,
  sincronizarBaseFirestore,
  guardarEntrenamientoFirestore,
  guardarPesoFirestore,
  guardarRecomendacionFirestore,
  leerPerfilFirestore,
  leerRutinaFirestore,
  leerAjustesFirestore,
  leerResumenEstadisticasFirestore,
  listarEntrenamientosFirestore,
  listarPesosFirestore,
  listarRecomendacionesFirestore
} from "../firebase/firestore.service.js";

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
    terminadoEn: null
  };
}

export async function sincronizarEstadoConFirebase({
  estado,
  guardarLocal,
  onCambio
}) {
  const resumen = crearResumenSincronizacion();

  if (!estado || typeof estado !== "object") {
    return finalizarConError(resumen, "Estado local inválido para sincronizar.");
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
    resumen.errores.push("Sin conexión a internet. Los datos quedan pendientes.");
    resumen.terminadoEn = new Date().toISOString();
    return resumen;
  }

  try {
    resumen.estado = ESTADOS_SINCRONIZACION.SINCRONIZANDO;
    onCambio?.(resumen);

    await prepararFirestore();

    await sincronizarBaseFirestore({
      usuario: estado.usuario,
      rutina: estado.rutina,
      ajustes: estado.ajustes
    });

    resumen.perfil = Boolean(estado.usuario?.perfil);
    resumen.rutina = Boolean(estado.rutina);
    resumen.ajustes = Boolean(estado.ajustes);

    resumen.entrenamientosSubidos = await subirPendientes({
      items: estado.entrenamientos,
      guardarItem: guardarEntrenamientoFirestore,
      tipo: "entrenamiento"
    });

    resumen.pesosSubidos = await subirPendientes({
      items: estado.pesos,
      guardarItem: guardarPesoFirestore,
      tipo: "peso"
    });

    resumen.recomendacionesSubidas = await subirPendientes({
      items: estado.recomendaciones,
      guardarItem: guardarRecomendacionFirestore,
      tipo: "recomendacion"
    });

    if (estado.usuario?.control) {
      estado.usuario.control.ultimaSincronizacion = new Date().toISOString();
    }

    guardarLocal?.();

    resumen.estado = ESTADOS_SINCRONIZACION.LISTO;
    resumen.ok = true;
    resumen.terminadoEn = new Date().toISOString();
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
        entrenamientos: normalizarRemotos(entrenamientos),
        pesos: normalizarRemotos(pesos),
        recomendaciones: normalizarRemotos(recomendaciones)
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
  if (!estado || !datosFirebase) {
    return estado;
  }

  const copia = structuredClone(estado);

  if (datosFirebase.perfil) {
    copia.usuario = copia.usuario || {};
    copia.usuario.perfil = {
      ...copia.usuario.perfil,
      ...limpiarMetadataFirebase(datosFirebase.perfil)
    };
  }

  if (datosFirebase.rutina) {
    copia.rutina = limpiarMetadataFirebase(datosFirebase.rutina);
  }

  if (datosFirebase.ajustes) {
    copia.ajustes = {
      ...copia.ajustes,
      ...limpiarMetadataFirebase(datosFirebase.ajustes)
    };
  }

  if (Array.isArray(datosFirebase.entrenamientos)) {
    copia.entrenamientos = mezclarListasPorId(
      copia.entrenamientos || [],
      datosFirebase.entrenamientos
    );
  }

  if (Array.isArray(datosFirebase.pesos)) {
    copia.pesos = mezclarListasPorId(copia.pesos || [], datosFirebase.pesos);
  }

  if (Array.isArray(datosFirebase.recomendaciones)) {
    copia.recomendaciones = mezclarListasPorId(
      copia.recomendaciones || [],
      datosFirebase.recomendaciones
    );
  }

  return copia;
}

async function subirPendientes({ items, guardarItem, tipo }) {
  if (!Array.isArray(items) || typeof guardarItem !== "function") {
    return 0;
  }

  let subidos = 0;

  for (const item of items) {
    if (item.sincronizado === true || item.idFirestore) {
      continue;
    }

    try {
      const respuesta = await guardarItem(item);
      item.sincronizado = true;
      item.idFirestore = respuesta.id || respuesta.idFirestore || null;
      item.rutaFirestore = respuesta.ruta || null;
      item.sincronizadoEn = new Date().toISOString();
      subidos += 1;
    } catch (error) {
      item.sincronizado = false;
      item.errorSincronizacion = obtenerMensajeError(error);
      console.warn(`No se pudo sincronizar ${tipo}.`, error);
    }
  }

  return subidos;
}

function normalizarRemotos(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    ...limpiarMetadataFirebase(item),
    id: item.id || item.idFirestore,
    idFirestore: item.idFirestore || item.id || null,
    sincronizado: true
  }));
}

function mezclarListasPorId(locales, remotos) {
  const mapa = new Map();

  for (const item of remotos) {
    const clave = obtenerClaveItem(item);
    mapa.set(clave, item);
  }

  for (const item of locales) {
    const clave = obtenerClaveItem(item);
    mapa.set(clave, {
      ...mapa.get(clave),
      ...item
    });
  }

  return Array.from(mapa.values()).sort((a, b) => {
    const fechaA = new Date(a.creadoEn || a.fecha || 0).getTime();
    const fechaB = new Date(b.creadoEn || b.fecha || 0).getTime();
    return fechaB - fechaA;
  });
}

function obtenerClaveItem(item) {
  return item.id || item.idFirestore || item.rutaFirestore || JSON.stringify(item);
}

function limpiarMetadataFirebase(data) {
  const copia = { ...data };
  delete copia.actualizadoEn;
  return copia;
}

function finalizarConError(resumen, error) {
  resumen.estado = ESTADOS_SINCRONIZACION.ERROR;
  resumen.ok = false;
  resumen.errores.push(obtenerMensajeError(error));
  resumen.terminadoEn = new Date().toISOString();
  return resumen;
}

function obtenerMensajeError(error) {
  if (!error) {
    return "Error desconocido.";
  }

  if (typeof error === "string") {
    return error;
  }

  return error.message || "Error desconocido.";
}
