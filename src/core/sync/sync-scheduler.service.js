/*
  Nombre completo: sync-scheduler.service.js
  Ruta o ubicación: src/core/sync/sync-scheduler.service.js

  Función o funciones:
    - Programar sincronización automática diaria sin bloquear el arranque de la app.
    - Ejecutar sincronización manual cuando el usuario lo solicite.
    - Evitar llamadas repetidas a Firebase si ya se sincronizó hoy y no hay cambios pendientes.
    - Procesar solo cola diferencial pendiente.
    - Usar metadata local para decidir si hay cambios sin consultar Firebase.
    - Guardar estado simple de última sincronización automática y manual.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
    - src/core/sync/sync-queue.service.js
    - src/core/sync/sync-metadata.service.js
    - src/modules/ajustes/ajustes.controller.js
*/

import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { obtenerFechaHoraISO, obtenerFechaHoyISO } from "../utils/date.util.js";
import { crearSyncMetadataService } from "./sync-metadata.service.js";
import { crearSyncQueueService } from "./sync-queue.service.js";
import { crearSyncService } from "./sync.service.js";

const SYNC_SCHEDULER_KEY = "fitjeff:sync:scheduler";
const MODO_AUTO = "automatico";
const MODO_MANUAL = "manual";

function crearEstadoBase() {
  return {
    version: 1,
    ultimoAutoSyncDia: "",
    ultimoAutoSyncEn: "",
    ultimoManualSyncEn: "",
    ultimoResultado: "Sin sincronización reciente",
    ultimoError: "",
    ultimoModo: "",
    ultimaDecision: "",
    enCurso: false,
    actualizadoEn: obtenerFechaHoraISO()
  };
}

function normalizarEstado(estado = {}) {
  return {
    ...crearEstadoBase(),
    ...estado,
    version: Number(estado.version || 1),
    enCurso: false
  };
}

function crearResumenDecision({ debeSincronizar, motivo, colaPendiente, modulosSucios }) {
  return {
    debeSincronizar,
    motivo,
    colaPendiente,
    modulosSucios: modulosSucios.map((modulo) => modulo.nombre)
  };
}

export function crearSyncSchedulerService({
  storage = crearSafeLocalStorageService(),
  queue = crearSyncQueueService(),
  syncMetadata = crearSyncMetadataService(),
  syncService = crearSyncService()
} = {}) {
  function leerEstado() {
    return normalizarEstado(storage.leerJson(SYNC_SCHEDULER_KEY, crearEstadoBase()));
  }

  function guardarEstado(parcial) {
    const estado = normalizarEstado({
      ...leerEstado(),
      ...parcial,
      actualizadoEn: obtenerFechaHoraISO()
    });

    storage.guardarJson(SYNC_SCHEDULER_KEY, estado);
    return estado;
  }

  function obtenerEstado() {
    const metadata = syncMetadata.leer();
    const modulosSucios = syncMetadata.obtenerModulosSucios();
    const colaPendiente = queue.contar();

    return {
      ...leerEstado(),
      colaPendiente,
      hayCambiosPendientes: colaPendiente > 0 || modulosSucios.length > 0,
      modulosSucios: modulosSucios.map((modulo) => ({
        nombre: modulo.nombre,
        pendienteDescripcion: modulo.pendienteDescripcion,
        ultimoCambioLocalEn: modulo.ultimoCambioLocalEn,
        ultimoError: modulo.ultimoError
      })),
      ultimoSyncExitosoEn: metadata.ultimoSyncExitosoEn,
      ultimoPullFirebaseEn: metadata.ultimoPullFirebaseEn
    };
  }

  function decidirSyncAutomatico() {
    const estado = leerEstado();
    const hoy = obtenerFechaHoyISO();
    const colaPendiente = queue.contar();
    const modulosSucios = syncMetadata.obtenerModulosSucios();

    if (colaPendiente > 0) {
      return crearResumenDecision({
        debeSincronizar: true,
        motivo: "Hay cambios pendientes en cola diferencial.",
        colaPendiente,
        modulosSucios
      });
    }

    if (modulosSucios.length > 0 && estado.ultimoAutoSyncDia !== hoy) {
      return crearResumenDecision({
        debeSincronizar: true,
        motivo: "Hay módulos con cambios locales y todavía no se sincronizó hoy.",
        colaPendiente,
        modulosSucios
      });
    }

    if (estado.ultimoAutoSyncDia === hoy) {
      return crearResumenDecision({
        debeSincronizar: false,
        motivo: "La sincronización automática de hoy ya fue revisada.",
        colaPendiente,
        modulosSucios
      });
    }

    return crearResumenDecision({
      debeSincronizar: false,
      motivo: "No hay cambios diferentes para sincronizar.",
      colaPendiente,
      modulosSucios
    });
  }

  function encolarRespaldoSiHaceFalta() {
    if (queue.contar() > 0) {
      return { encolado: false, motivo: "La cola ya tiene cambios pendientes." };
    }

    if (!syncMetadata.hayCambiosPendientes()) {
      return { encolado: false, motivo: "No hay módulos marcados como pendientes." };
    }

    const resultado = syncService.encolarEstadoActual();
    return {
      encolado: Boolean(resultado.ok),
      motivo: resultado.mensaje,
      resultado
    };
  }

  async function ejecutarSyncAutomatico() {
    const decision = decidirSyncAutomatico();

    if (!decision.debeSincronizar) {
      guardarEstado({
        ultimoAutoSyncDia: obtenerFechaHoyISO(),
        ultimoResultado: decision.motivo,
        ultimoModo: MODO_AUTO,
        ultimaDecision: decision.motivo,
        ultimoError: ""
      });

      return {
        ok: true,
        omitido: true,
        modo: MODO_AUTO,
        mensaje: decision.motivo,
        decision
      };
    }

    guardarEstado({
      enCurso: true,
      ultimoModo: MODO_AUTO,
      ultimaDecision: decision.motivo,
      ultimoError: ""
    });

    try {
      encolarRespaldoSiHaceFalta();
      const resultado = await syncService.sincronizarPendientes();
      const ahora = obtenerFechaHoraISO();

      guardarEstado({
        ultimoAutoSyncDia: obtenerFechaHoyISO(),
        ultimoAutoSyncEn: ahora,
        ultimoResultado: resultado.mensaje,
        ultimoModo: MODO_AUTO,
        ultimoError: resultado.ok ? "" : resultado.mensaje,
        enCurso: false
      });

      return {
        ...resultado,
        modo: MODO_AUTO,
        omitido: false,
        decision
      };
    } catch (error) {
      const mensaje = error?.message || "No se pudo ejecutar la sincronización automática.";
      guardarEstado({
        ultimoAutoSyncDia: obtenerFechaHoyISO(),
        ultimoAutoSyncEn: obtenerFechaHoraISO(),
        ultimoResultado: mensaje,
        ultimoModo: MODO_AUTO,
        ultimoError: mensaje,
        enCurso: false
      });

      return {
        ok: false,
        modo: MODO_AUTO,
        omitido: false,
        mensaje,
        decision
      };
    }
  }

  async function sincronizarManual() {
    guardarEstado({
      enCurso: true,
      ultimoModo: MODO_MANUAL,
      ultimaDecision: "Sincronización manual solicitada por el usuario.",
      ultimoError: ""
    });

    try {
      encolarRespaldoSiHaceFalta();
      const resultado = await syncService.sincronizarPendientes();
      const ahora = obtenerFechaHoraISO();

      guardarEstado({
        ultimoManualSyncEn: ahora,
        ultimoResultado: resultado.mensaje,
        ultimoModo: MODO_MANUAL,
        ultimoError: resultado.ok ? "" : resultado.mensaje,
        enCurso: false
      });

      return {
        ...resultado,
        modo: MODO_MANUAL
      };
    } catch (error) {
      const mensaje = error?.message || "No se pudo sincronizar manualmente.";
      guardarEstado({
        ultimoManualSyncEn: obtenerFechaHoraISO(),
        ultimoResultado: mensaje,
        ultimoModo: MODO_MANUAL,
        ultimoError: mensaje,
        enCurso: false
      });

      return {
        ok: false,
        modo: MODO_MANUAL,
        mensaje
      };
    }
  }

  return {
    obtenerEstado,
    decidirSyncAutomatico,
    ejecutarSyncAutomatico,
    sincronizarManual
  };
}
