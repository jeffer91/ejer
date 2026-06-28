/*
  Nombre completo: sync.service.js
  Ruta o ubicación: src/core/sync/sync.service.js

  Función o funciones:
    - Coordinar la sincronización local con Firebase.
    - Detectar si Firebase está configurado antes de enviar datos.
    - Mantener la app en modo local sin marcar error cuando Firebase está deshabilitado.
    - Procesar solo cambios pendientes ya guardados en la cola local.
    - Usar metadata local para saber qué módulo tiene cambios pendientes.
    - Evitar que el arranque de la app encole y suba todo el estado local.
    - Mantener cambios en cola si Firebase está habilitado pero falla la conexión.
    - Evitar que un estado local vacío reemplace un respaldo válido en Firebase.
    - No mostrar opciones técnicas al usuario.

  Se conecta con:
    - src/core/config/firebase.config.js
    - src/core/firebase/firebase-database.service.js
    - src/core/sync/sync-queue.service.js
    - src/core/sync/sync-status.service.js
    - src/core/sync/sync-metadata.service.js
    - src/features/control-corporal/registro.service.js
*/

import { firebaseEstaConfigurado, obtenerEstadoFirebaseConexion } from "../config/firebase.config.js";
import { crearFirebaseDatabaseService } from "../firebase/firebase-database.service.js";
import { crearSyncMetadataService, SYNC_MODULES } from "./sync-metadata.service.js";
import { crearSyncQueueService } from "./sync-queue.service.js";
import { crearSyncStatusService } from "./sync-status.service.js";
import { crearRegistroService } from "../../features/control-corporal/registro.service.js";

function perfilTieneDatos(perfil = {}) {
  return Boolean(
    perfil.configurado ||
    Number(perfil.alturaCm || 0) > 0 ||
    perfil.fechaNacimiento
  );
}

function objetivoTieneDatos(objetivo = {}) {
  return Boolean(Number(objetivo.pesoObjetivoKg || 0) > 0);
}

function estadoTieneDatos(estado = {}) {
  return Boolean(
    perfilTieneDatos(estado.perfil) ||
    objetivoTieneDatos(estado.objetivo) ||
    (Array.isArray(estado.registros) && estado.registros.length > 0) ||
    (Array.isArray(estado.historialCambios) && estado.historialCambios.length > 0) ||
    (Array.isArray(estado.papelera) && estado.papelera.length > 0)
  );
}

function obtenerModuloDeItem(item = {}) {
  if (item.modulo) return item.modulo;
  if (["estado-general", "registro"].includes(item.tipo)) return SYNC_MODULES.CONTROL_CORPORAL;
  return SYNC_MODULES.SISTEMA;
}

export function crearSyncService({
  firebaseDatabase = crearFirebaseDatabaseService(),
  queue = crearSyncQueueService(),
  status = crearSyncStatusService(),
  syncMetadata = crearSyncMetadataService(),
  registroService = crearRegistroService()
} = {}) {
  function obtenerEstadoConexion() {
    return obtenerEstadoFirebaseConexion();
  }

  function puedeSincronizar() {
    return firebaseEstaConfigurado();
  }

  function responderModoLocal() {
    const conexion = obtenerEstadoConexion();
    status.marcarModoLocal(conexion.mensaje);

    return {
      ok: true,
      modo: conexion.modo,
      mensaje: conexion.mensaje,
      procesados: 0,
      encolados: 0,
      conexion
    };
  }

  function encolarEstadoActual() {
    const estado = registroService.obtenerEstado();

    if (!estadoTieneDatos(estado)) {
      status.marcarDatosAlDia("Sin datos locales para sincronizar");
      return {
        ok: false,
        mensaje: "No se sincronizó porque el estado local está vacío.",
        encolados: 0
      };
    }

    syncMetadata.marcarModuloSucio(SYNC_MODULES.CONTROL_CORPORAL, "Estado general encolado manualmente");

    queue.agregar({
      tipo: "estado-general",
      payload: {
        perfil: estado.perfil,
        objetivo: estado.objetivo,
        historialCambios: estado.historialCambios || [],
        papelera: estado.papelera || [],
        resumenLocal: {
          totalRegistros: estado.registros.length,
          totalCambios: estado.historialCambios.length,
          totalPapelera: estado.papelera.length
        }
      }
    });

    (estado.registros || []).forEach((registro) => {
      queue.agregar({
        tipo: "registro",
        payload: registro
      });
    });

    status.marcarPendiente("Cambios pendientes");

    return {
      ok: true,
      mensaje: "Estado local encolado para sincronizar.",
      encolados: 1 + (estado.registros || []).length
    };
  }

  async function procesarItem(item) {
    if (item.tipo === "estado-general") {
      return firebaseDatabase.guardarEstadoGeneral(item.payload);
    }

    if (item.tipo === "registro") {
      return firebaseDatabase.guardarRegistro(item.payload);
    }

    return {
      ok: false,
      mensaje: "Tipo de sincronización no reconocido."
    };
  }

  async function sincronizarPendientes() {
    if (!puedeSincronizar()) {
      return responderModoLocal();
    }

    const pendientes = queue.listar();

    if (pendientes.length === 0) {
      status.marcarDatosAlDia("Sin cambios pendientes");
      return {
        ok: true,
        mensaje: "Sin cambios pendientes",
        procesados: 0
      };
    }

    let procesados = 0;
    const modulosProcesados = new Set();

    for (const item of pendientes) {
      const modulo = obtenerModuloDeItem(item);
      syncMetadata.marcarIntentoSync(modulo);
      queue.marcarIntento(item.id);
      const resultado = await procesarItem(item);

      if (!resultado.ok) {
        syncMetadata.marcarError(modulo, resultado.mensaje);
        status.marcarError(resultado.mensaje);
        return {
          ok: false,
          mensaje: resultado.mensaje,
          procesados
        };
      }

      queue.eliminar(item.id);
      modulosProcesados.add(modulo);
      procesados += 1;
    }

    modulosProcesados.forEach((modulo) => {
      syncMetadata.marcarModuloSincronizado(modulo);
    });

    status.marcarDatosAlDia();

    return {
      ok: true,
      mensaje: "Datos al día",
      procesados
    };
  }

  async function sincronizarAhora() {
    if (!puedeSincronizar()) {
      return responderModoLocal();
    }

    return sincronizarPendientes();
  }

  return {
    obtenerEstadoConexion,
    encolarEstadoActual,
    sincronizarPendientes,
    sincronizarAhora
  };
}
