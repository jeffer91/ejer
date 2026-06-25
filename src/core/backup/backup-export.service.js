/*
  Nombre completo: backup-export.service.js
  Ruta o ubicación: src/core/backup/backup-export.service.js

  Función o funciones:
    - Crear una copia exportable en formato JSON.
    - Preparar nombre de archivo y contenido para guardar fuera de la app.
    - No depender de Firebase ni internet.

  Se conecta con:
    - src/core/backup/backup.constants.js
    - src/core/backup/backup-local.service.js
    - src/core/backup/backup.service.js
*/

import { BACKUP_CONFIG, BACKUP_TEXTOS } from "./backup.constants.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearBackupLocalService } from "./backup-local.service.js";

function crearNombreArchivo() {
  const fecha = obtenerFechaHoraISO().replaceAll(":", "-").replace(".", "-");
  return `${BACKUP_CONFIG.archivoPrefijo}-${fecha}.json`;
}

export function crearBackupExportService(backupLocalService = crearBackupLocalService()) {
  function crearExportacion() {
    try {
      const backup = backupLocalService.crearBackupLocal("exportacion");
      const contenido = JSON.stringify(backup, null, 2);

      return {
        ok: true,
        mensaje: BACKUP_TEXTOS.EXPORTADO,
        nombreArchivo: crearNombreArchivo(),
        contenido
      };
    } catch {
      return {
        ok: false,
        mensaje: BACKUP_TEXTOS.ERROR_EXPORTAR,
        nombreArchivo: "",
        contenido: ""
      };
    }
  }

  function guardarArchivoEnNavegador(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return {
    crearExportacion,
    guardarArchivoEnNavegador
  };
}
