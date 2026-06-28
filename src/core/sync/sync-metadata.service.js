/*
  Nombre completo: sync-metadata.service.js
  Ruta o ubicación: src/core/sync/sync-metadata.service.js

  Función o funciones:
    - Guardar metadatos locales de sincronización por módulo.
    - Saber qué módulos tienen cambios pendientes sin consultar Firebase.
    - Registrar último cambio local, último intento, último sync exitoso y último pull remoto.
    - Preparar la base para sincronización diaria y cola diferencial.
    - Mantener la app local-first: la UI no depende de Firebase para abrir.

  Se conecta con:
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
    - src/features/control-corporal/registro.service.js
    - src/core/bootstrap/app-data-hydration.service.js
*/

import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";

export const SYNC_METADATA_KEY = "fitjeff:sync:metadata";

export const SYNC_MODULES = Object.freeze({
  CONTROL_CORPORAL: "controlCorporal",
  ACTIVIDAD: "actividad",
  ENTRENAMIENTO: "entrenamiento",
  SISTEMA: "sistema"
});

function crearModuloBase(nombre) {
  return {
    nombre,
    dirty: false,
    versionLocal: 0,
    versionRemota: 0,
    ultimoCambioLocalEn: "",
    ultimoSyncEn: "",
    ultimoIntentoSyncEn: "",
    ultimoError: "",
    pendienteDescripcion: ""
  };
}

function crearEstadoBase() {
  return {
    version: 1,
    creadoEn: obtenerFechaHoraISO(),
    actualizadoEn: obtenerFechaHoraISO(),
    ultimoSyncExitosoEn: "",
    ultimoIntentoSyncEn: "",
    ultimoPullFirebaseEn: "",
    ultimoError: "",
    modulos: {
      [SYNC_MODULES.CONTROL_CORPORAL]: crearModuloBase(SYNC_MODULES.CONTROL_CORPORAL),
      [SYNC_MODULES.ACTIVIDAD]: crearModuloBase(SYNC_MODULES.ACTIVIDAD),
      [SYNC_MODULES.ENTRENAMIENTO]: crearModuloBase(SYNC_MODULES.ENTRENAMIENTO),
      [SYNC_MODULES.SISTEMA]: crearModuloBase(SYNC_MODULES.SISTEMA)
    }
  };
}

function normalizarModulo(nombre, modulo = {}) {
  return {
    ...crearModuloBase(nombre),
    ...modulo,
    nombre,
    dirty: Boolean(modulo.dirty),
    versionLocal: Number(modulo.versionLocal || 0),
    versionRemota: Number(modulo.versionRemota || 0)
  };
}

function normalizarMetadata(metadata = {}) {
  const base = crearEstadoBase();
  const modulos = {
    ...base.modulos,
    ...(metadata.modulos || {})
  };

  Object.keys(modulos).forEach((nombre) => {
    modulos[nombre] = normalizarModulo(nombre, modulos[nombre]);
  });

  return {
    ...base,
    ...metadata,
    version: Number(metadata.version || base.version),
    modulos,
    actualizadoEn: metadata.actualizadoEn || base.actualizadoEn
  };
}

export function crearSyncMetadataService(storage = crearSafeLocalStorageService()) {
  function leer() {
    return normalizarMetadata(storage.leerJson(SYNC_METADATA_KEY, crearEstadoBase()));
  }

  function guardar(metadata) {
    const normalizado = normalizarMetadata({
      ...metadata,
      actualizadoEn: obtenerFechaHoraISO()
    });

    storage.guardarJson(SYNC_METADATA_KEY, normalizado);
    return normalizado;
  }

  function asegurarModulo(nombreModulo) {
    const metadata = leer();
    const nombre = nombreModulo || SYNC_MODULES.SISTEMA;

    if (!metadata.modulos[nombre]) {
      metadata.modulos[nombre] = crearModuloBase(nombre);
      return guardar(metadata).modulos[nombre];
    }

    return metadata.modulos[nombre];
  }

  function marcarModuloSucio(nombreModulo, descripcion = "Cambio local pendiente") {
    const metadata = leer();
    const nombre = nombreModulo || SYNC_MODULES.SISTEMA;
    const modulo = normalizarModulo(nombre, metadata.modulos[nombre]);
    const ahora = obtenerFechaHoraISO();

    metadata.modulos[nombre] = {
      ...modulo,
      dirty: true,
      versionLocal: modulo.versionLocal + 1,
      ultimoCambioLocalEn: ahora,
      pendienteDescripcion: descripcion,
      ultimoError: ""
    };

    return guardar(metadata);
  }

  function marcarIntentoSync(nombreModulo = "") {
    const metadata = leer();
    const ahora = obtenerFechaHoraISO();

    metadata.ultimoIntentoSyncEn = ahora;

    if (nombreModulo) {
      const modulo = normalizarModulo(nombreModulo, metadata.modulos[nombreModulo]);
      metadata.modulos[nombreModulo] = {
        ...modulo,
        ultimoIntentoSyncEn: ahora
      };
    }

    return guardar(metadata);
  }

  function marcarModuloSincronizado(nombreModulo, versionRemota = null) {
    const metadata = leer();
    const nombre = nombreModulo || SYNC_MODULES.SISTEMA;
    const modulo = normalizarModulo(nombre, metadata.modulos[nombre]);
    const ahora = obtenerFechaHoraISO();

    metadata.ultimoSyncExitosoEn = ahora;
    metadata.ultimoError = "";
    metadata.modulos[nombre] = {
      ...modulo,
      dirty: false,
      versionRemota: versionRemota === null ? modulo.versionLocal : Number(versionRemota || 0),
      ultimoSyncEn: ahora,
      ultimoError: "",
      pendienteDescripcion: ""
    };

    return guardar(metadata);
  }

  function marcarPullFirebase() {
    const metadata = leer();
    metadata.ultimoPullFirebaseEn = obtenerFechaHoraISO();
    metadata.ultimoError = "";
    return guardar(metadata);
  }

  function marcarError(nombreModulo, mensaje) {
    const metadata = leer();
    const nombre = nombreModulo || SYNC_MODULES.SISTEMA;
    const modulo = normalizarModulo(nombre, metadata.modulos[nombre]);
    const texto = mensaje || "Error de sincronización";

    metadata.ultimoError = texto;
    metadata.modulos[nombre] = {
      ...modulo,
      ultimoError: texto
    };

    return guardar(metadata);
  }

  function obtenerModulosSucios() {
    const metadata = leer();
    return Object.values(metadata.modulos).filter((modulo) => modulo.dirty);
  }

  function hayCambiosPendientes() {
    return obtenerModulosSucios().length > 0;
  }

  function limpiar() {
    const base = crearEstadoBase();
    storage.guardarJson(SYNC_METADATA_KEY, base);
    return base;
  }

  return {
    leer,
    guardar,
    asegurarModulo,
    marcarModuloSucio,
    marcarIntentoSync,
    marcarModuloSincronizado,
    marcarPullFirebase,
    marcarError,
    obtenerModulosSucios,
    hayCambiosPendientes,
    limpiar
  };
}
