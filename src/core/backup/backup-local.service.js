/*
  Nombre completo: backup-local.service.js
  Ruta o ubicación: src/core/backup/backup-local.service.js

  Función o funciones:
    - Crear copias locales automáticas de los datos de FitJeff.
    - Guardar solo un número limitado de copias para no llenar almacenamiento.
    - Leer la copia local más reciente cuando sea necesario restaurar.
    - Usar almacenamiento seguro para no romper la app si localStorage falla.

  Se conecta con:
    - src/core/backup/backup.constants.js
    - src/core/storage/safe-local-storage.service.js
    - src/core/backup/backup.service.js
*/

import { BACKUP_CONFIG } from "./backup.constants.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";

export function crearBackupLocalService(storage = crearSafeLocalStorageService()) {
  function leerDatosFitJeff() {
    return storage.leerMapaTextoPorPrefijo(BACKUP_CONFIG.storagePrefix, [BACKUP_CONFIG.backupKey]);
  }

  function listarBackupsLocales() {
    return storage.leerJson(BACKUP_CONFIG.backupKey, []);
  }

  function crearBackupLocal(motivo = "automatico") {
    const backup = {
      app: BACKUP_CONFIG.app,
      version: BACKUP_CONFIG.version,
      tipo: "local",
      motivo,
      creadoEn: obtenerFechaHoraISO(),
      datos: leerDatosFitJeff()
    };

    const backups = [backup, ...listarBackupsLocales()].slice(0, BACKUP_CONFIG.maxBackupsLocales);
    storage.guardarJson(BACKUP_CONFIG.backupKey, backups);

    return backup;
  }

  function obtenerUltimoBackupLocal() {
    return listarBackupsLocales()[0] || null;
  }

  function limpiarBackupsLocales() {
    storage.guardarJson(BACKUP_CONFIG.backupKey, []);
  }

  return {
    listarBackupsLocales,
    crearBackupLocal,
    obtenerUltimoBackupLocal,
    limpiarBackupsLocales
  };
}
