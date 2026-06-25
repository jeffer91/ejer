/*
  Nombre completo: backup.service.js
  Ruta o ubicación: src/core/backup/backup.service.js

  Función o funciones:
    - Coordinar copias locales, exportación, importación y restauración.
    - Exponer una API simple para Ajustes.
    - Mantener la protección contra pérdida de datos antes de restaurar.

  Se conecta con:
    - src/core/backup/backup-local.service.js
    - src/core/backup/backup-export.service.js
    - src/core/backup/backup-import.service.js
    - src/core/backup/backup-restore.service.js
    - src/modules/ajustes/ajustes.controller.js
*/

import { crearBackupExportService } from "./backup-export.service.js";
import { crearBackupImportService } from "./backup-import.service.js";
import { crearBackupLocalService } from "./backup-local.service.js";
import { crearBackupRestoreService } from "./backup-restore.service.js";

export function crearBackupService() {
  const local = crearBackupLocalService();
  const exportador = crearBackupExportService(local);
  const importador = crearBackupImportService();
  const restaurador = crearBackupRestoreService(local);

  function crearBackupAutomatico(motivo = "automatico") {
    return local.crearBackupLocal(motivo);
  }

  function exportarArchivo() {
    const resultado = exportador.crearExportacion();

    if (resultado.ok) {
      exportador.guardarArchivoEnNavegador(resultado.contenido, resultado.nombreArchivo);
    }

    return resultado;
  }

  async function importarYRestaurar(file) {
    const importacion = await importador.leerArchivo(file);

    if (!importacion.ok) {
      return importacion;
    }

    return restaurador.restaurarBackup(importacion.backup);
  }

  function obtenerUltimoBackupLocal() {
    return local.obtenerUltimoBackupLocal();
  }

  return {
    crearBackupAutomatico,
    exportarArchivo,
    importarYRestaurar,
    obtenerUltimoBackupLocal
  };
}
