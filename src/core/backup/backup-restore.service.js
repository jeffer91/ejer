/*
  Nombre completo: backup-restore.service.js
  Ruta o ubicación: src/core/backup/backup-restore.service.js

  Función o funciones:
    - Restaurar datos locales desde una copia de seguridad válida.
    - Crear una copia local previa antes de restaurar.
    - Proteger contra pérdida de información por restauraciones accidentales.

  Se conecta con:
    - src/core/backup/backup.constants.js
    - src/core/backup/backup-local.service.js
    - src/core/backup/backup.service.js
*/

import { BACKUP_CONFIG, BACKUP_TEXTOS } from "./backup.constants.js";
import { crearBackupLocalService } from "./backup-local.service.js";

function borrarDatosFitJeffActuales() {
  Object.keys(localStorage).forEach((clave) => {
    if (clave.startsWith(BACKUP_CONFIG.storagePrefix) && clave !== BACKUP_CONFIG.backupKey) {
      localStorage.removeItem(clave);
    }
  });
}

function restaurarDatos(datos) {
  Object.entries(datos || {}).forEach(([clave, valor]) => {
    if (clave.startsWith(BACKUP_CONFIG.storagePrefix) && clave !== BACKUP_CONFIG.backupKey) {
      localStorage.setItem(clave, valor);
    }
  });
}

export function crearBackupRestoreService(backupLocalService = crearBackupLocalService()) {
  function restaurarBackup(backup) {
    try {
      if (!backup || !backup.datos) {
        return {
          ok: false,
          mensaje: BACKUP_TEXTOS.FORMATO_INVALIDO
        };
      }

      backupLocalService.crearBackupLocal("antes-de-restaurar");
      borrarDatosFitJeffActuales();
      restaurarDatos(backup.datos);

      return {
        ok: true,
        mensaje: BACKUP_TEXTOS.RESTAURADO
      };
    } catch {
      return {
        ok: false,
        mensaje: BACKUP_TEXTOS.ERROR_RESTAURAR
      };
    }
  }

  return {
    restaurarBackup
  };
}
