import { limpiarMetadataRemotaFitJeff } from "../firebase/firestore.schema.js";

export function crearPayloadBaseFitJeff(estado = {}) {
  return {
    usuario: estado.usuario || {},
    perfil: estado.usuario?.perfil || {},
    rutina: estado.rutina || {},
    ajustes: estado.ajustes || {},
    entrenamientos: Array.isArray(estado.entrenamientos) ? estado.entrenamientos : [],
    pesos: Array.isArray(estado.pesos) ? estado.pesos : [],
    recomendaciones: Array.isArray(estado.recomendaciones) ? estado.recomendaciones : [],
    meta: estado.meta || {}
  };
}

export function marcarItemSincronizado(item = {}, respuesta = {}) {
  return {
    ...item,
    sincronizado: true,
    idFirestore: respuesta.id || respuesta.idFirestore || item.idFirestore || null,
    rutaFirestore: respuesta.ruta || item.rutaFirestore || null,
    sincronizadoEn: new Date().toISOString(),
    errorSincronizacion: null
  };
}

export function normalizarItemsRemotosFitJeff(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...limpiarMetadataRemotaFitJeff(item),
    id: item.id || item.idFirestore,
    idFirestore: item.idFirestore || item.id || null,
    sincronizado: true
  }));
}

export function mezclarItemsFitJeff(locales = [], remotos = []) {
  const mapa = new Map();

  normalizarItemsRemotosFitJeff(remotos).forEach((item) => {
    mapa.set(obtenerClaveItemFitJeff(item), item);
  });

  locales.forEach((item) => {
    const clave = obtenerClaveItemFitJeff(item);
    mapa.set(clave, {
      ...mapa.get(clave),
      ...item
    });
  });

  return Array.from(mapa.values()).sort((a, b) => {
    const fechaA = new Date(a.creadoEn || a.fecha || 0).getTime();
    const fechaB = new Date(b.creadoEn || b.fecha || 0).getTime();
    return fechaB - fechaA;
  });
}

function obtenerClaveItemFitJeff(item = {}) {
  return item.id || item.idFirestore || item.rutaFirestore || JSON.stringify(item);
}
