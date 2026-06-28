/*
  Nombre completo: sync-status.service.js
  Ruta o ubicación: src/core/sync/sync-status.service.js

  Función o funciones:
    - Controlar el estado interno de sincronización.
    - Mantener el texto visible simple: Datos al día, cambios pendientes o modo local.
    - Preparar la app para sincronizar con Firebase sin mostrar panel técnico.
    - Evitar que Firebase deshabilitado se muestre como error.

  Se conecta con:
    - src/core/status/app-status.service.js
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync.service.js
*/

import { crearAppStatusService } from "../status/app-status.service.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";

const SYNC_STATUS_KEY = "fitjeff:sync:status";

function estadoInicial() {
  return {
    ok: true,
    texto: "Datos al día",
    modo: "local",
    pendiente: false,
    ultimoIntentoEn: "",
    ultimoExitoEn: "",
    ultimoErrorSimple: ""
  };
}

export function crearSyncStatusService() {
  const storage = crearSafeLocalStorageService();
  const appStatus = crearAppStatusService();

  function obtener() {
    return storage.leerJson(SYNC_STATUS_KEY, estadoInicial());
  }

  function guardar(parcial) {
    const estado = {
      ...obtener(),
      ...parcial,
      ultimoIntentoEn: parcial.ultimoIntentoEn || obtenerFechaHoraISO()
    };

    storage.guardarJson(SYNC_STATUS_KEY, estado);
    return estado;
  }

  function marcarDatosAlDia(mensaje = "Datos al día") {
    appStatus.marcarDatosAlDia();

    return guardar({
      ok: true,
      texto: mensaje,
      modo: "firebase",
      pendiente: false,
      ultimoExitoEn: obtenerFechaHoraISO(),
      ultimoErrorSimple: ""
    });
  }

  function marcarModoLocal(mensaje = "Modo local activo") {
    appStatus.guardarEstado({
      texto: mensaje,
      datosAlDia: true,
      pendienteSubir: false,
      errorSimple: ""
    });

    return guardar({
      ok: true,
      texto: mensaje,
      modo: "local",
      pendiente: false,
      ultimoExitoEn: "",
      ultimoErrorSimple: ""
    });
  }

  function marcarPendiente(mensaje = "Cambios pendientes") {
    appStatus.marcarPendiente(mensaje);

    return guardar({
      ok: false,
      texto: mensaje,
      modo: "firebase",
      pendiente: true,
      ultimoErrorSimple: ""
    });
  }

  function marcarError(mensaje = "No se pudo actualizar la nube. Tus datos locales están guardados.") {
    appStatus.marcarErrorSimple(mensaje);

    return guardar({
      ok: false,
      texto: mensaje,
      modo: "firebase",
      pendiente: true,
      ultimoErrorSimple: mensaje
    });
  }

  return {
    obtener,
    guardar,
    marcarDatosAlDia,
    marcarModoLocal,
    marcarPendiente,
    marcarError
  };
}
