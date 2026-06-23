export const FITJEFF_SCHEMA_VERSION = 1;

export function crearMetadataFirestore(origen = "fitjeff") {
  return {
    schemaVersion: FITJEFF_SCHEMA_VERSION,
    origen,
    actualizadoLocalEn: new Date().toISOString()
  };
}

export function prepararDocumentoFijoFitJeff(data = {}, tipo = "documento") {
  return limpiarUndefined({
    ...data,
    tipo,
    metadata: {
      ...crearMetadataFirestore("documento-fijo"),
      ...(data.metadata || {})
    }
  });
}

export function prepararItemSubcoleccionFitJeff(data = {}, tipo = "item") {
  return limpiarUndefined({
    ...data,
    tipo,
    creadoEn: data.creadoEn || new Date().toISOString(),
    metadata: {
      ...crearMetadataFirestore("subcoleccion"),
      ...(data.metadata || {})
    }
  });
}

export function limpiarMetadataRemotaFitJeff(data = {}) {
  const copia = { ...data };
  delete copia.actualizadoEn;
  delete copia.metadata;
  return copia;
}

export function limpiarUndefined(valor) {
  if (valor === undefined || valor === null) return null;

  if (Array.isArray(valor)) {
    return valor.map(limpiarUndefined);
  }

  if (esObjetoPlano(valor)) {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, item]) => [clave, limpiarUndefined(item)])
    );
  }

  return valor;
}

function esObjetoPlano(valor) {
  if (!valor || typeof valor !== "object") return false;
  return Object.getPrototypeOf(valor) === Object.prototype;
}
