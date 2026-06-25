/*
  Nombre completo: backup.constants.js
  Ruta o ubicación: src/core/backup/backup.constants.js

  Función o funciones:
    - Centralizar claves, nombres y límites del sistema de copias de seguridad.
    - Definir qué datos locales pertenecen a FitJeff.
    - Mantener backups simples, locales y ocultos de lo técnico.

  Se conecta con:
    - src/core/backup/backup-local.service.js
    - src/core/backup/backup-export.service.js
    - src/core/backup/backup-import.service.js
    - src/core/backup/backup-restore.service.js
*/

export const BACKUP_CONFIG = Object.freeze({
  app: "FitJeff",
  version: "0.1.0",
  storagePrefix: "fitjeff:",
  backupKey: "fitjeff:backup:auto-list",
  maxBackupsLocales: 5,
  archivoPrefijo: "fitjeff-backup"
});

export const BACKUP_TEXTOS = Object.freeze({
  EXPORTADO: "Copia creada correctamente.",
  IMPORTADO: "Copia leída correctamente.",
  RESTAURADO: "Datos restaurados correctamente.",
  ERROR_EXPORTAR: "No se pudo crear la copia.",
  ERROR_IMPORTAR: "No se pudo leer la copia.",
  ERROR_RESTAURAR: "No se pudo restaurar la copia.",
  FORMATO_INVALIDO: "El archivo no parece ser una copia válida de FitJeff."
});
