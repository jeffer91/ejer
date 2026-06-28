/*
  Nombre completo: sync-queue.service.js
  Ruta o ubicación: src/core/sync/sync-queue.service.js

  Función o funciones:
    - Crear una cola local diferencial de datos pendientes por sincronizar.
    - Guardar operaciones aunque no haya internet o Firebase no esté configurado.
    - Deduplicar operaciones por módulo, entidad, entidadId y acción.
    - Reemplazar una operación pendiente por la versión local más reciente.
    - Migrar y compactar operaciones antiguas de la cola.
    - Permitir que sync.service.js procese la cola después.

  Se conecta con:
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
    - src/core/sync/sync-status.service.js
    - src/core/sync/sync-metadata.service.js
*/

import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { SYNC_MODULES } from "./sync-metadata.service.js";

const SYNC_QUEUE_KEY = "fitjeff:sync:queue";
const ACCION_UPSERT = "upsert";

function crearIdSync() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stringifyOrdenado(valor) {
  if (valor === null || typeof valor !== "object") {
    return JSON.stringify(valor);
  }

  if (Array.isArray(valor)) {
    return `[${valor.map((item) => stringifyOrdenado(item)).join(",")}]`;
  }

  return `{${Object.keys(valor).sort().map((clave) => `${JSON.stringify(clave)}:${stringifyOrdenado(valor[clave])}`).join(",")}}`;
}

function crearHashPayload(payload) {
  const texto = stringifyOrdenado(payload || {});
  let hash = 0;

  for (let i = 0; i < texto.length; i += 1) {
    hash = ((hash << 5) - hash) + texto.charCodeAt(i);
    hash |= 0;
  }

  return `h${Math.abs(hash)}`;
}

function resolverModulo(item = {}) {
  if (item.modulo) return item.modulo;
  if (["estado-general", "registro"].includes(item.tipo)) return SYNC_MODULES.CONTROL_CORPORAL;
  return SYNC_MODULES.SISTEMA;
}

function resolverEntidad(item = {}) {
  if (item.entidad) return item.entidad;
  if (item.tipo === "estado-general") return "estado-general";
  if (item.tipo === "registro") return "registro";
  return item.tipo || "general";
}

function resolverEntidadId(item = {}) {
  if (item.entidadId) return String(item.entidadId);
  if (item.tipo === "estado-general") return "general";
  if (item.payload?.id) return String(item.payload.id);
  if (item.payload?.fecha) return String(item.payload.fecha);
  return "general";
}

function resolverAccion(item = {}) {
  if (item.accion) return item.accion;
  return ACCION_UPSERT;
}

function crearOperationKey({ modulo, entidad, entidadId, accion }) {
  return [modulo, entidad, entidadId, accion].join(":");
}

function normalizarItem(item = {}) {
  const modulo = resolverModulo(item);
  const entidad = resolverEntidad(item);
  const entidadId = resolverEntidadId(item);
  const accion = resolverAccion(item);
  const ahora = obtenerFechaHoraISO();
  const operationKey = item.operationKey || crearOperationKey({ modulo, entidad, entidadId, accion });

  return {
    id: item.id || crearIdSync(),
    operationKey,
    tipo: item.tipo || entidad,
    modulo,
    entidad,
    entidadId,
    accion,
    payload: item.payload || {},
    payloadHash: item.payloadHash || crearHashPayload(item.payload || {}),
    intentos: Number(item.intentos || 0),
    creadoEn: item.creadoEn || ahora,
    actualizadoEn: item.actualizadoEn || ahora
  };
}

function elegirMasReciente(actual, candidato) {
  if (!actual) return candidato;

  const fechaActual = String(actual.actualizadoEn || actual.creadoEn || "");
  const fechaCandidato = String(candidato.actualizadoEn || candidato.creadoEn || "");

  if (fechaCandidato >= fechaActual) {
    return {
      ...actual,
      ...candidato,
      id: actual.id,
      creadoEn: actual.creadoEn,
      intentos: Math.max(Number(actual.intentos || 0), Number(candidato.intentos || 0))
    };
  }

  return actual;
}

function deduplicarCola(cola = []) {
  const mapa = new Map();

  cola.map((item) => normalizarItem(item)).forEach((item) => {
    mapa.set(item.operationKey, elegirMasReciente(mapa.get(item.operationKey), item));
  });

  return [...mapa.values()];
}

function ordenarCola(cola = []) {
  return [...cola].sort((a, b) => String(b.actualizadoEn || "").localeCompare(String(a.actualizadoEn || "")));
}

export function crearSyncQueueService(storage = crearSafeLocalStorageService()) {
  function guardarCola(cola) {
    const normalizada = ordenarCola(deduplicarCola(cola));
    storage.guardarJson(SYNC_QUEUE_KEY, normalizada);
    return normalizada;
  }

  function listar() {
    const cola = storage.leerJson(SYNC_QUEUE_KEY, []);
    const normalizada = ordenarCola(deduplicarCola(cola));

    if (JSON.stringify(cola) !== JSON.stringify(normalizada)) {
      guardarCola(normalizada);
    }

    return normalizada;
  }

  function agregar(itemPendiente) {
    const nuevo = normalizarItem(itemPendiente);
    const colaActual = listar();
    const existente = colaActual.find((item) => item.operationKey === nuevo.operationKey);

    if (existente) {
      const actualizado = {
        ...existente,
        ...nuevo,
        id: existente.id,
        intentos: existente.intentos,
        creadoEn: existente.creadoEn,
        actualizadoEn: obtenerFechaHoraISO()
      };

      const cola = colaActual.map((item) => item.operationKey === nuevo.operationKey ? actualizado : item);
      guardarCola(cola);
      return actualizado;
    }

    guardarCola([nuevo, ...colaActual]);
    return nuevo;
  }

  function marcarIntento(itemId) {
    const cola = listar().map((item) => {
      if (item.id !== itemId && item.operationKey !== itemId) {
        return item;
      }

      return {
        ...item,
        intentos: Number(item.intentos || 0) + 1,
        actualizadoEn: obtenerFechaHoraISO()
      };
    });

    return guardarCola(cola);
  }

  function eliminar(itemId) {
    return guardarCola(listar().filter((item) => item.id !== itemId && item.operationKey !== itemId));
  }

  function listarPorModulo(modulo) {
    return listar().filter((item) => item.modulo === modulo);
  }

  function contar() {
    return listar().length;
  }

  function limpiar() {
    return guardarCola([]);
  }

  return {
    listar,
    listarPorModulo,
    contar,
    agregar,
    marcarIntento,
    eliminar,
    limpiar
  };
}
