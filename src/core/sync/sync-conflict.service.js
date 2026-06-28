/*
  Nombre completo: sync-conflict.service.js
  Ruta o ubicación: src/core/sync/sync-conflict.service.js

  Función o funciones:
    - Detectar conflictos entre cambios locales pendientes y resumen remoto de Firebase.
    - Evitar que FitJeff sobrescriba datos remotos más recientes sin guardar evidencia local.
    - Guardar conflictos en almacenamiento local para revisión segura.
    - Mantener la resolución en modo conservador: no borrar, no mezclar y no reemplazar automáticamente.
    - Permitir que Ajustes muestre si hay conflictos pendientes.

  Se conecta con:
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
    - src/core/sync/sync-scheduler.service.js
    - src/core/sync/sync-metadata.service.js
*/

import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { SYNC_MODULES } from "./sync-metadata.service.js";

export const SYNC_CONFLICTS_KEY = "fitjeff:sync:conflicts";

function fechaMayor(...fechas) {
  return fechas
    .filter(Boolean)
    .map((fecha) => String(fecha))
    .sort()
    .at(-1) || "";
}

function obtenerFechaRemota(resumenRemoto = {}) {
  return fechaMayor(
    resumenRemoto.actualizadoEn,
    resumenRemoto.sync?.actualizadoEn,
    resumenRemoto.resumenLocal?.actualizadoEn,
    resumenRemoto.controlCorporal?.resumen?.actualizadoEn
  );
}

function obtenerFechaLocal(estadoLocal = {}, metadata = {}) {
  const fechasModulos = Object.values(metadata.modulos || {}).map((modulo) => modulo.ultimoCambioLocalEn);
  const fechasRegistros = Array.isArray(estadoLocal.registros)
    ? estadoLocal.registros.map((registro) => registro.actualizadoEn || registro.creadoEn || registro.fecha)
    : [];

  return fechaMayor(
    estadoLocal.perfil?.actualizadoEn,
    estadoLocal.objetivo?.actualizadoEn,
    metadata.ultimoSyncExitosoEn,
    metadata.ultimoPullFirebaseEn,
    ...fechasModulos,
    ...fechasRegistros
  );
}

function remotoTieneDatos(resumenRemoto = {}) {
  return Boolean(
    resumenRemoto.perfil?.configurado ||
    Number(resumenRemoto.perfil?.alturaCm || 0) > 0 ||
    resumenRemoto.perfil?.fechaNacimiento ||
    Number(resumenRemoto.objetivo?.pesoObjetivoKg || resumenRemoto.objetivo?.pesoObjetivo || 0) > 0 ||
    Number(resumenRemoto.resumenLocal?.totalRegistros || resumenRemoto.controlCorporal?.resumen?.totalRegistros || 0) > 0
  );
}

function obtenerModulosSucios(metadata = {}) {
  return Object.values(metadata.modulos || {})
    .filter((modulo) => modulo.dirty)
    .map((modulo) => modulo.nombre || SYNC_MODULES.SISTEMA);
}

function crearConflictKey({ modulo, fechaRemota, fechaLocal, referencia }) {
  return ["conflicto", modulo, fechaRemota || "sin-remoto", fechaLocal || "sin-local", referencia || "sin-ref"].join(":");
}

function normalizarConflicto(conflicto = {}) {
  const ahora = obtenerFechaHoraISO();

  return {
    id: conflicto.id || crearConflictKey(conflicto),
    conflictKey: conflicto.conflictKey || crearConflictKey(conflicto),
    tipo: conflicto.tipo || "local-remoto",
    modulo: conflicto.modulo || SYNC_MODULES.SISTEMA,
    estado: conflicto.estado || "pendiente",
    severidad: conflicto.severidad || "bloqueante",
    mensaje: conflicto.mensaje || "Hay cambios locales y remotos que deben revisarse antes de sincronizar.",
    fechaLocal: conflicto.fechaLocal || "",
    fechaRemota: conflicto.fechaRemota || "",
    referencia: conflicto.referencia || "",
    modulosSucios: Array.isArray(conflicto.modulosSucios) ? conflicto.modulosSucios : [],
    colaPendiente: Number(conflicto.colaPendiente || 0),
    creadoEn: conflicto.creadoEn || ahora,
    actualizadoEn: conflicto.actualizadoEn || ahora
  };
}

export function crearSyncConflictService(storage = crearSafeLocalStorageService()) {
  function listar() {
    const conflictos = storage.leerJson(SYNC_CONFLICTS_KEY, []);
    return Array.isArray(conflictos) ? conflictos.map((conflicto) => normalizarConflicto(conflicto)) : [];
  }

  function guardar(conflictos) {
    const normalizados = conflictos.map((conflicto) => normalizarConflicto(conflicto));
    storage.guardarJson(SYNC_CONFLICTS_KEY, normalizados);
    return normalizados;
  }

  function listarActivos() {
    return listar().filter((conflicto) => conflicto.estado === "pendiente");
  }

  function contarActivos() {
    return listarActivos().length;
  }

  function registrarConflicto(conflicto) {
    const nuevo = normalizarConflicto(conflicto);
    const conflictos = listar();
    const existente = conflictos.find((item) => item.conflictKey === nuevo.conflictKey && item.estado === "pendiente");

    if (existente) {
      const actualizado = {
        ...existente,
        ...nuevo,
        id: existente.id,
        creadoEn: existente.creadoEn,
        actualizadoEn: obtenerFechaHoraISO()
      };

      guardar(conflictos.map((item) => item.id === existente.id ? actualizado : item));
      return actualizado;
    }

    guardar([nuevo, ...conflictos]);
    return nuevo;
  }

  function evaluarLocalRemoto({ estadoLocal = {}, resumenRemoto = {}, metadata = {}, colaPendiente = 0 } = {}) {
    const modulosSucios = obtenerModulosSucios(metadata);
    const hayLocalPendiente = colaPendiente > 0 || modulosSucios.length > 0;
    const fechaRemota = obtenerFechaRemota(resumenRemoto);
    const fechaLocal = obtenerFechaLocal(estadoLocal, metadata);
    const referencia = fechaMayor(metadata.ultimoSyncExitosoEn, metadata.ultimoPullFirebaseEn);
    const remotoNuevoRespectoReferencia = Boolean(fechaRemota && (!referencia || fechaRemota > referencia));

    if (!hayLocalPendiente || !remotoTieneDatos(resumenRemoto) || !remotoNuevoRespectoReferencia) {
      return {
        hayConflicto: false,
        mensaje: "Sin conflicto local/remoto detectado.",
        fechaRemota,
        fechaLocal,
        referencia,
        modulosSucios
      };
    }

    return {
      hayConflicto: true,
      tipo: "local-remoto",
      modulo: modulosSucios[0] || SYNC_MODULES.CONTROL_CORPORAL,
      severidad: "bloqueante",
      mensaje: "Se detectaron datos remotos más recientes y cambios locales pendientes. FitJeff detuvo la sincronización para evitar sobrescribir información.",
      fechaRemota,
      fechaLocal,
      referencia,
      modulosSucios,
      colaPendiente
    };
  }

  function resolverMantenerLocal(conflictId) {
    const conflictos = listar();
    const ahora = obtenerFechaHoraISO();
    const actualizados = conflictos.map((conflicto) => {
      if (conflicto.id !== conflictId) return conflicto;

      return {
        ...conflicto,
        estado: "resuelto-mantener-local",
        actualizadoEn: ahora
      };
    });

    guardar(actualizados);
    return actualizados.find((conflicto) => conflicto.id === conflictId) || null;
  }

  function limpiarResueltos() {
    return guardar(listar().filter((conflicto) => conflicto.estado === "pendiente"));
  }

  return {
    listar,
    listarActivos,
    contarActivos,
    registrarConflicto,
    evaluarLocalRemoto,
    resolverMantenerLocal,
    limpiarResueltos
  };
}
