/*
  Nombre completo: backup-import.service.js
  Ruta o ubicación: src/core/backup/backup-import.service.js

  Función o funciones:
    - Leer archivos JSON de copia de seguridad de FitJeff.
    - Validar que el archivo tenga formato esperado.
    - Entregar los datos limpios al servicio de restauración.

  Se conecta con:
    - src/core/backup/backup.constants.js
    - src/core/backup/backup-restore.service.js
    - src/core/backup/backup.service.js
*/

import { BACKUP_CONFIG, BACKUP_TEXTOS } from "./backup.constants.js";

function validarBackup(backup) {
  return Boolean(
    backup &&
    backup.app === BACKUP_CONFIG.app &&
    backup.datos &&
    typeof backup.datos === "object"
  );
}

export function crearBackupImportService() {
  async function leerArchivo(file) {
    if (!file) {
      return {
        ok: false,
        mensaje: BACKUP_TEXTOS.ERROR_IMPORTAR,
        backup: null
      };
    }

    try {
      const texto = await file.text();
      const backup = JSON.parse(texto);

      if (!validarBackup(backup)) {
        return {
          ok: false,
          mensaje: BACKUP_TEXTOS.FORMATO_INVALIDO,
          backup: null
        };
      }

      return {
        ok: true,
        mensaje: BACKUP_TEXTOS.IMPORTADO,
        backup
      };
    } catch {
      return {
        ok: false,
        mensaje: BACKUP_TEXTOS.ERROR_IMPORTAR,
        backup: null
      };
    }
  }

  return {
    leerArchivo
  };
}
