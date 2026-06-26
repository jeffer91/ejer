/*
  Nombre completo: sync.service.js
  Ruta o ubicación: src/core/sync/sync.service.js

  Función o funciones:
    - Coordinar la sincronización local con Firebase.
    - Enviar estado general y registros pendientes cuando Firebase esté listo.
    - Mantener cambios en cola si no hay nube disponible.
    - No mostrar opciones técnicas al usuario.

  Se conecta con:
    - src/core/firebase/firebase-database.service.js
    - src/core/sync/sync-queue.service.js
    - src/core/sync/sync-status.service.js
    - src/features/control-corporal/registro.service.js
*/

import { crearFirebaseDatabaseService } from "../firebase/firebase-database.service.js";
import { crearSyncQueueService } from "./sync-queue.service.js";
import { crearSyncStatusService } from "./sync-status.service.js";
import { crearRegistroService } from "../../features/control-corporal/registro.service.js";

export function crearSyncService({
  firebaseDatabase = crearFirebaseDatabaseService(),
  queue = crearSyncQueueService(),
  status = crearSyncStatusService(),
  registroService = crearRegistroService()
} = {}) {
  function encolarEstadoActual() {
    const estado = registroService.obtenerEstado();

    queue.agregar({
      tipo: "estado-general",
      payload: {
        perfil: estado.perfil,
        objetivo: estado.objetivo,
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
    const pendientes = queue.listar();

    if (pendientes.length === 0) {
      status.marcarDatosAlDia();
      return {
        ok: true,
        mensaje: "Datos al día",
        procesados: 0
      };
    }

    let procesados = 0;

    for (const item of pendientes) {
      queue.marcarIntento(item.id);
      const resultado = await procesarItem(item);

      if (!resultado.ok) {
        status.marcarError(resultado.mensaje);
        return {
          ok: false,
          mensaje: resultado.mensaje,
          procesados
        };
      }

      queue.eliminar(item.id);
      procesados += 1;
    }

    status.marcarDatosAlDia();

    return {
      ok: true,
      mensaje: "Datos al día",
      procesados
    };
  }

  async function sincronizarAhora() {
    if (queue.listar().length === 0) {
      encolarEstadoActual();
    }

    return sincronizarPendientes();
  }

  return {
    encolarEstadoActual,
    sincronizarPendientes,
    sincronizarAhora
  };
}
