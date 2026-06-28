const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const DIRECTORIOS_IGNORADOS = new Set([".git", "node_modules", "dist", "release", ".vite", ".idea", ".vscode"]);

const requiredFiles = [
  "README.md",
  ".env.example",
  "ABRIR_FITJEFF.bat",
  "ACTUALIZAR_VERSION_FITJEFF.bat",
  "package.json",
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "public/icons/icon.svg",
  "docs/fase-visual-2026-cierre.md",
  "electron/main.js",
  "electron/electron-path.service.js",
  "electron/electron-window.service.js",
  "electron/preload.cjs",
  "scripts/start-electron-dev.cjs",
  "scripts/auditar-app.cjs",
  "scripts/check-local.cjs",
  "scripts/check-tools.cjs",
  "scripts/publicar-version-automatica.bat",
  "scripts/publicar-version.bat",
  "scripts/actualizar-todo.bat",
  "scripts/version-bump.cjs",
  "scripts/build-windows.cjs",
  "scripts/build-android.cjs",
  "scripts/release-github.cjs",
  "src/core/config/app.config.js",
  "src/core/config/firebase.config.js",
  "src/core/config/firebase.project.config.js",
  "src/core/utils/date.util.js",
  "src/core/storage/safe-local-storage.service.js",
  "src/core/bootstrap/app-data-hydration.service.js",
  "src/core/firebase/firebase-database.service.js",
  "src/core/backup/backup-local.service.js",
  "src/core/backup/backup-restore.service.js",
  "src/core/sync/sync.service.js",
  "src/core/sync/sync-status.service.js",
  "src/core/sync/sync-queue.service.js",
  "src/core/sync/sync-metadata.service.js",
  "src/core/sync/sync-conflict.service.js",
  "src/core/sync/sync-scheduler.service.js",
  "src/app/app-router.js",
  "src/app/app.bootstrap.js",
  "src/app/app.css",
  "src/shell/shell.menu.config.js",
  "src/shell/shell.controller.js",
  "src/shell/shell.view.js",
  "src/shell/shell.router.js",
  "src/shell/shell.memory.js",
  "src/features/features.registry.js",
  "src/features/control-corporal/registro.service.js",
  "src/features/control-corporal/registro.repository.js",
  "src/features/control-corporal/inicio/inicio.service.js",
  "src/features/control-corporal/estadisticas/estadisticas.calculations.js",
  "src/features/control-corporal/estadisticas/estadisticas.presenter.js",
  "src/features/control-corporal/guia-medidas/guia-medidas.view.js",
  "src/features/actividad/actividad.constants.js",
  "src/features/actividad/actividad.repository.js",
  "src/features/actividad/actividad.service.js",
  "src/features/actividad/registro/registro.controller.js",
  "src/features/actividad/registro/registro.view.js",
  "src/features/actividad/resumen/resumen.view.js",
  "src/features/actividad/dispositivos/dispositivos.constants.js",
  "src/features/actividad/dispositivos/dispositivos.controller.js",
  "src/features/actividad/dispositivos/dispositivos.css",
  "src/features/actividad/dispositivos/dispositivos.repository.js",
  "src/features/actividad/dispositivos/dispositivos.service.js",
  "src/features/actividad/dispositivos/dispositivos.view.js",
  "src/features/actividad/dispositivos/dispositivos-import-bridge.service.js",
  "src/features/entrenamiento/entrenamiento.repository.js",
  "src/features/entrenamiento/ajustes/gemini.service.js",
  "src/features/entrenamiento/ajustes/gemini-settings.repository.js",
  "src/features/entrenamiento/rutinas/rutinas.view.js",
  "src/features/entrenamiento/jarvis/jarvis-panel.css"
];

const blockedPatterns = [
  "../modules/inicio",
  "../modules/registro",
  "../../modules/inicio",
  "../../modules/registro",
  "src/modules/inicio",
  "src/modules/registro",
  "toISOString().slice(0, 10)",
  "Estas en",
  "bajado 0 kg",
  "configurar-firebase-local.bat",
  "CONFIGURAR_FIREBASE_FITJEFF.bat"
];

const semanticChecks = [
  { file: "README.md", mustInclude: ["Bloque 38 - Dispositivos", "puente claro de importación", "Bloques pendientes"], message: "README debe documentar el bloque 38 y pendientes." },
  { file: "package.json", mustInclude: ["\"start\": \"node scripts/start-electron-dev.cjs\"", "\"audit:app\": \"node scripts/auditar-app.cjs\"", "publicar:automatico"], message: "package.json debe usar inicio seguro y auditoria." },
  { file: "scripts/check-local.cjs", mustInclude: ["Auditoría estática", "scripts/auditar-app.cjs", "Build de Vite"], message: "check-local debe ejecutar auditoria antes del build." },
  { file: "scripts/check-tools.cjs", mustInclude: ["audit:app", "publicar:automatico", "No debe existir configurar:firebase"], message: "check-tools debe validar auditoria y no permitir configurar:firebase." },
  { file: "scripts/auditar-app.cjs", mustInclude: ["auditarImportsLocales", "archivosNoPermitidos", "sync-conflict.service.js"], message: "Auditoria debe incluir conflictos de sincronizacion." },
  { file: "src/core/sync/sync-conflict.service.js", mustInclude: ["SYNC_CONFLICTS_KEY", "evaluarLocalRemoto", "registrarConflicto", "resolverMantenerLocal", "contarActivos"], message: "Debe existir servicio de conflictos local/remoto." },
  { file: "src/core/firebase/firebase-database.service.js", mustInclude: ["FIREBASE_STRUCTURE_VERSION", "guardarResumenUsuario", "leerResumenUsuario", "leerCambiosDesde", "SYNC_SUBCOLLECTION", "crearCamposPesadosParaEliminar"], message: "Firebase database debe separar resumen liviano, registros y sync." },
  { file: "src/core/sync/sync-metadata.service.js", mustInclude: ["SYNC_METADATA_KEY", "SYNC_MODULES", "marcarModuloSucio", "ultimoPullFirebaseEn", "obtenerModulosSucios"], message: "Debe existir metadata de sincronización por módulo." },
  { file: "src/core/sync/sync-queue.service.js", mustInclude: ["operationKey", "deduplicarCola", "payloadHash", "listarPorModulo", "entidadId"], message: "La cola debe ser diferencial y deduplicada por entidad." },
  { file: "src/core/sync/sync-scheduler.service.js", mustInclude: ["ejecutarSyncAutomatico", "sincronizarManual", "conflictosPendientes", "crearSyncConflictService", "SYNC_SCHEDULER_KEY"], message: "Scheduler debe mostrar conflictos y sincronización diaria." },
  { file: "src/core/sync/sync.service.js", mustInclude: ["validarConflictosAntesDeSubir", "crearSyncConflictService", "registrarConflicto", "leerResumenUsuario"], message: "Sync debe detenerse ante conflictos local/remoto." },
  { file: "src/features/actividad/dispositivos/dispositivos-import-bridge.service.js", mustInclude: ["crearDispositivosImportBridgeService", "importarTexto", "parsearJson", "parsearTabla", "SYNC_MODULES.ACTIVIDAD"], message: "Debe existir puente claro de importación de dispositivos." },
  { file: "src/features/actividad/dispositivos/dispositivos.service.js", mustInclude: ["crearDispositivosImportBridgeService", "importarDatosPegados", "ejemploImportacion", "ultimoResultadoImportacion"], message: "Dispositivos debe conectar el puente de importación." },
  { file: "src/features/actividad/dispositivos/dispositivos.view.js", mustInclude: ["crearPanelImportacion", "Importar actividad", "dispositivos-textarea", "Pegar ejemplo"], message: "Vista Dispositivos debe mostrar importación clara." },
  { file: "src/features/actividad/dispositivos/dispositivos.controller.js", mustInclude: ["importarDatosPegados", "vista.importForm", "vista.ejemploBoton", "resultadoImportacion"], message: "Controller Dispositivos debe ejecutar importación." },
  { file: "src/features/actividad/dispositivos/dispositivos.css", mustInclude: ["dispositivos-textarea", "dispositivos-import-form", "dispositivos-import-actions"], message: "Dispositivos debe tener estilos de importación." },
  { file: "src/features/actividad/actividad.repository.js", mustInclude: ["importadoEn", "fuente", "origen", "Conservar metadata de importación"], message: "Actividad debe conservar metadata importada." },
  { file: "src/app/app.bootstrap.js", mustInclude: ["crearSyncSchedulerService", "sincronizarAutomaticoEnSegundoPlano", "ejecutarSyncAutomatico", "router.iniciar()"], message: "Bootstrap debe usar scheduler diario sin bloquear la app." },
  { file: "src/modules/ajustes/ajustes.controller.js", mustInclude: ["crearSyncSchedulerService", "sincronizarManual", "refrescarSync", "vista.syncBoton"], message: "Ajustes debe permitir sincronización manual." },
  { file: "src/modules/ajustes/ajustes.view.js", mustInclude: ["crearBloqueSync", "actualizarEstadoSync", "Conflictos pendientes", "ajustes-sync-status__row--alert"], message: "Vista Ajustes debe mostrar conflictos." },
  { file: "src/modules/ajustes/ajustes.css", mustInclude: ["ajustes-card--sync", "ajustes-sync-status", "ajustes-sync-status__row--alert"], message: "Ajustes debe tener estilos de conflicto." },
  { file: "src/app/app-router.js", mustInclude: ["marcarPerfilCompletadoDesdeSync", "FitJeff no puede renderizar", "rutaActual = SHELL_DEFAULT_ROUTE_ID"], message: "Router debe permitir entrada a Hoy tras restauracion." },
  { file: "src/core/config/firebase.project.config.js", mustInclude: ["FIREBASE_PROJECT_CONFIG", "apiKey", "collection: \"fitjeff\"", "userDocument: \"jeff\""], message: "Debe existir configuracion Firebase desde codigo." },
  { file: "src/core/config/firebase.config.js", mustInclude: ["FIREBASE_PROJECT_CONFIG", "leerValor", "resolverFirebaseEnabled", "obtenerEstadoFirebaseConexion"], message: "Firebase config debe leer variables o configuracion desde codigo." },
  { file: "src/core/bootstrap/app-data-hydration.service.js", mustInclude: ["restaurarFirebaseEnSegundoPlano", "marcarPullFirebase", "firebasePendienteSegundoPlano", "repository.guardarEstado"], message: "Hidratacion debe ser local-first y registrar pull remoto." },
  { file: "src/features/control-corporal/registro.service.js", mustInclude: ["marcarCambioLocal", "entidadId: registro.id", "entidad: \"registro\""], message: "Control corporal debe encolar operaciones por entidad." },
  { file: "scripts/start-electron-dev.cjs", mustInclude: ["encontrarPuertoDisponible", "PUERTO_BASE", "FITJEFF_DEV_SERVER_URL", "concurrently"], message: "npm start debe buscar puerto libre y pasar URL a Electron." },
  { file: "electron/electron-path.service.js", mustInclude: ["FITJEFF_DEV_SERVER_URL", "http://localhost:5173/"], message: "Electron debe leer la URL real de desarrollo." },
  { file: "electron/electron-window.service.js", mustInclude: ["backgroundColor: \"#f8fafc\"", "obtenerDevUrl"], message: "Ventana Electron debe mantener tema claro y URL dinamica." },
  { file: "ABRIR_FITJEFF.bat", mustInclude: ["call npm start", "puerto automatico"], message: "Debe existir BAT raiz para abrir FitJeff." },
  { file: "ACTUALIZAR_VERSION_FITJEFF.bat", mustInclude: ["publicar-version-automatica.bat"], message: "Debe existir BAT raiz para actualizar version." },
  { file: "scripts/publicar-version-automatica.bat", mustInclude: ["npm run version:bump", "npm run build:windows", "npm run build:android", "npm run release:github"], message: "Publicacion automatica debe subir version, Windows, Android y release." },
  { file: ".env.example", mustInclude: ["VITE_FIREBASE_ENABLED=false", "VITE_FIREBASE_API_KEY=", "VITE_FIREBASE_COLLECTION=fitjeff"], message: "Debe existir ejemplo de variables sin secretos." },
  { file: "index.html", mustInclude: ["theme-color\" content=\"#f8fafc", "color-scheme\" content=\"light", "manifest.webmanifest"], message: "index.html debe declarar modo claro y manifest." },
  { file: "manifest.webmanifest", mustInclude: ["\"background_color\": \"#f8fafc\"", "\"theme_color\": \"#2563eb\"", "./icons/icon.svg"], message: "Manifest debe estar alineado al tema claro." },
  { file: "service-worker.js", mustInclude: ["CACHE_VERSION", "PRECACHE_URLS", "self.addEventListener(\"fetch\"", "responderDinamico"], message: "Service worker debe tener base PWA real." },
  { file: "src/features/control-corporal/estadisticas/estadisticas.calculations.js", mustInclude: ["comparacionSemanaDisponible", "comparacionMesDisponible", "describirCambioTotal", "candidatos[candidatos.length - 1] || null"], message: "Estadisticas debe evitar comparaciones sin antiguedad suficiente." },
  { file: "src/features/actividad/actividad.repository.js", mustInclude: ["deduplicarPorFecha", "buscarPorFecha", "guardarOActualizarPorFecha", "Mantener un solo registro principal por fecha"], message: "Repository de Actividad debe evitar duplicados por fecha." },
  { file: "src/features/actividad/actividad.service.js", mustInclude: ["obtenerActividadPorFecha", "validarActividad", "guardarOActualizarPorFecha", "fechaEsFutura"], message: "Service de Actividad debe validar reglas y actualizar por fecha." },
  { file: "scripts/build-windows.cjs", mustInclude: ["latest.yml", "electron-builder", "--publish", "never"], message: "Build Windows debe generar instalador y metadata para autoupdater." },
  { file: "scripts/build-android.cjs", mustInclude: ["latest-android.json", "FitJeff-Android", "apk-generado", "preparado-sin-apk"], message: "Build Android debe preparar manifiesto y APK cuando exista proyecto Android." }
];

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function esArchivoDeReglas(file) {
  return file.endsWith("check-structure.cjs") || file.endsWith("auditar-app.cjs");
}

function walkFiles(directory) {
  const absoluteDirectory = path.join(ROOT, directory);
  if (!fs.existsSync(absoluteDirectory)) return [];

  const files = [];
  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && DIRECTORIOS_IGNORADOS.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(absoluteDirectory, entry.name);
    const relativePath = path.relative(ROOT, absolutePath).replaceAll(path.sep, "/");
    if (entry.isDirectory()) files.push(...walkFiles(relativePath));
    else if (/\.(js|cjs|mjs|css|html|json|md|bat)$/.test(entry.name)) files.push(relativePath);
  }

  return files;
}

function checkRequiredFiles() {
  return requiredFiles.filter((relativePath) => !fileExists(relativePath));
}

function checkBlockedImports() {
  const findings = [];
  for (const file of walkFiles(".")) {
    if (esArchivoDeReglas(file)) continue;

    const content = readFile(file);
    for (const pattern of blockedPatterns) {
      if (content.includes(pattern)) findings.push(`${file} -> ${pattern}`);
    }
  }
  return findings;
}

function checkSemanticRules() {
  const findings = [];
  for (const check of semanticChecks) {
    if (!fileExists(check.file)) {
      findings.push(`${check.file} -> archivo no encontrado para validar regla: ${check.message}`);
      continue;
    }
    const content = readFile(check.file);
    const missing = check.mustInclude.filter((pattern) => !content.includes(pattern));
    if (missing.length > 0) findings.push(`${check.file} -> ${check.message} Faltan: ${missing.join(", ")}`);
  }
  return findings;
}

function run() {
  const missingFiles = checkRequiredFiles();
  const blockedImports = checkBlockedImports();
  const semanticFindings = checkSemanticRules();

  if (missingFiles.length === 0 && blockedImports.length === 0 && semanticFindings.length === 0) {
    console.log("Estructura modular OK.");
    console.log("Fase visual 2026 cerrada: 12/12 bloques completados.");
    console.log("Bloque 13 aplicado: fechas locales corregidas.");
    console.log("Bloque 14 aplicado: revision local completa.");
    console.log("Bloque 15 aplicado: Gemini con persistencia separada.");
    console.log("Bloque 16 aplicado: medidas con popup visual.");
    console.log("Bloque 17 aplicado: Rutinas claro + pasos.");
    console.log("Bloque 18 aplicado: Jarvis claro en Diario y HIT.");
    console.log("Bloque 19 aplicado: Control corporal inteligente.");
    console.log("Bloque 20 aplicado: Dispositivos, Cubitt CT4 y Google Fit preparados.");
    console.log("Bloque 21 aplicado: Analisis y correccion de errores.");
    console.log("Bloque 22 aplicado: Base PWA clara y estado real.");
    console.log("Bloque 23 aplicado: Almacenamiento local seguro.");
    console.log("Bloque 24 aplicado: Memoria de pantalla y shell.");
    console.log("Bloque 25 aplicado: Control corporal depurado.");
    console.log("Bloque 26 aplicado: Variables y conexion revisadas.");
    console.log("Bloque 27 aplicado: Actividad depurada.");
    console.log("Bloque 28 aplicado: Inicio seguro y actualizacion automatica.");
    console.log("Bloque 29 aplicado: Restauracion Firebase antes de Inicio.");
    console.log("Bloque 30 aplicado: Firebase resuelto desde codigo.");
    console.log("Bloque 31 aplicado: Auditoria integral.");
    console.log("Bloque 32 aplicado: Local-first real.");
    console.log("Bloque 33 aplicado: Metadata de sincronizacion por modulo.");
    console.log("Bloque 34 aplicado: Cola diferencial con deduplicacion por entidad.");
    console.log("Bloque 35 aplicado: Sincronizacion diaria automatica y manual.");
    console.log("Bloque 36 aplicado: Firebase resumen liviano y registros por subcoleccion.");
    console.log("Bloque 37 aplicado: Conflictos local/remoto y resolucion segura.");
    console.log("Bloque 38 aplicado: Dispositivos reales o puente claro de importacion.");
    return;
  }

  if (missingFiles.length > 0) {
    console.error("Faltan archivos obligatorios:");
    missingFiles.forEach((item) => console.error(`- ${item}`));
  }

  if (blockedImports.length > 0) {
    console.error("Se encontraron referencias antiguas, textos mal escritos o configuradores Firebase no solicitados:");
    blockedImports.forEach((item) => console.error(`- ${item}`));
  }

  if (semanticFindings.length > 0) {
    console.error("Se encontraron reglas estructurales incompletas:");
    semanticFindings.forEach((item) => console.error(`- ${item}`));
  }

  process.exitCode = 1;
}

run();
