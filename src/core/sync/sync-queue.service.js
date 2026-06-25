/*
  Nombre completo: sync-queue.service.js
  Ruta o ubicación: src/core/sync/sync-queue.service.js

  Función o funciones:
    - Crear una cola local de datos pendientes por sincronizar.
    - Guardar operaciones aunque no haya internet o Firebase no esté configurado.
    - Permitir que sync.service.js procese la cola después.

  Se conecta con:
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
    - src/core/sync/sync-status.service.js
*/

import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";

const SYNC_QUEUE_KEY = "fitjeff:sync:queue";

export function crearSyncQueueService() {
  const storage = crearSafeLocalStorageService();

  function listar() {
    return storage.leerJson(SYNC_QUEUE_KEY, []);
  }

  function guardarCola(cola) {
    storage.guardarJson(SYNC_QUEUE_KEY, cola);
    return cola;
  }

  function agregar({ tipo, payload }) {
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sync-${Date.now()}`,
      tipo,
      payload,
      intentos: 0,
      creadoEn: obtenerFechaHoraISO(),
      actualizadoEn: obtenerFechaHoraISO()
    };

    const cola = [item, ...listar()];
    guardarCola(cola);
    return item;
  }

  function marcarIntento(itemId) {
    const cola = listar().map((item) => {
      if (item.id !== itemId) {
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
    return guardarCola(listar().filter((item) => item.id !== itemId));
  }

  function limpiar() {
    return guardarCola([]);
  }

  return {
    listar,
    agregar,
    marcarIntento,
    eliminar,
    limpiar
  };
}
