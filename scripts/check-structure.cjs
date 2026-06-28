const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const requiredFiles = [
  "README.md",
  ".env.example",
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "public/icons/icon.svg",
  "docs/fase-visual-2026-cierre.md",
  "src/core/config/app.config.js",
  "src/core/config/firebase.config.js",
  "src/core/utils/date.util.js",
  "src/core/storage/safe-local-storage.service.js",
  "src/core/bootstrap/app-data-hydration.service.js",
  "src/core/backup/backup-local.service.js",
  "src/core/backup/backup-restore.service.js",
  "src/core/sync/sync.service.js",
  "src/core/sync/sync-status.service.js",
  "src/core/sync/sync-queue.service.js",
  "src/app/app-router.js",
  "src/app/app.bootstrap.js",
  "src/app/app.css",
  "src/app/theme-light.css",
  "src/app/status-colors.css",
  "src/shell/shell.menu.config.js",
  "src/shell/shell.controller.js",
  "src/shell/shell.view.js",
  "src/shell/shell.css",
  "src/shell/shell.router.js",
  "src/shell/shell.memory.js",
  "src/features/features.registry.js",
  "src/features/control-corporal/control-corporal.menu.js",
  "src/features/control-corporal/control-corporal.routes.js",
  "src/features/control-corporal/control-corporal.module.js",
  "src/features/control-corporal/registro.service.js",
  "src/features/control-corporal/registro.repository.js",
  "src/features/control-corporal/inicio/inicio.service.js",
  "src/features/control-corporal/estadisticas/estadisticas.calculations.js",
  "src/features/control-corporal/estadisticas/estadisticas.presenter.js",
  "src/features/control-corporal/guia-medidas/guia-medidas.view.js",
  "src/features/control-corporal/guia-medidas/guia-medidas.data.js",
  "src/features/control-corporal/guia-medidas/guia-medidas.css",
  "src/features/actividad/actividad.constants.js",
  "src/features/actividad/actividad.routes.js",
  "src/features/actividad/actividad.menu.js",
  "src/features/actividad/actividad.module.js",
  "src/features/actividad/actividad.repository.js",
  "src/features/actividad/actividad.service.js",
  "src/features/actividad/registro/registro.controller.js",
  "src/features/actividad/registro/registro.view.js",
  "src/features/actividad/registro/registro.css",
  "src/features/actividad/resumen/resumen.controller.js",
  "src/features/actividad/resumen/resumen.view.js",
  "src/features/actividad/resumen/resumen.css",
  "src/features/actividad/dispositivos/dispositivos.constants.js",
  "src/features/actividad/dispositivos/dispositivos.repository.js",
  "src/features/actividad/dispositivos/dispositivos.service.js",
  "src/features/actividad/dispositivos/dispositivos.controller.js",
  "src/features/actividad/dispositivos/dispositivos.view.js",
  "src/features/actividad/dispositivos/dispositivos.css",
  "src/features/actividad/dispositivos/adapters/cubitt.adapter.js",
  "src/features/actividad/dispositivos/adapters/google-fit.adapter.js",
  "src/features/entrenamiento/entrenamiento.repository.js",
  "src/features/entrenamiento/ajustes/gemini.service.js",
  "src/features/entrenamiento/ajustes/gemini-settings.repository.js",
  "src/features/entrenamiento/rutinas/rutinas.controller.js",
  "src/features/entrenamiento/rutinas/rutinas.view.js",
  "src/features/entrenamiento/jarvis/jarvis-panel.css",
  "src/modules/ajustes/ajustes.service.js",
  "src/modules/actualizaciones/actualizaciones.controller.js"
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
  "bajado 0 kg"
];

const semanticChecks = [
  { file: "README.md", mustInclude: ["Bloque 27 - Actividad depurada", "un solo registro principal por fecha", "actualizar el registro del día"], message: "README debe documentar el bloque 27." },
  { file: ".env.example", mustInclude: ["VITE_FIREBASE_ENABLED=false", "VITE_FIREBASE_API_KEY=", "VITE_FIREBASE_COLLECTION=fitjeff"], message: "Debe existir ejemplo de variables sin secretos." },
  { file: "index.html", mustInclude: ["theme-color\" content=\"#f8fafc", "color-scheme\" content=\"light", "manifest.webmanifest"], message: "index.html debe declarar modo claro y manifest." },
  { file: "manifest.webmanifest", mustInclude: ["\"background_color\": \"#f8fafc\"", "\"theme_color\": \"#2563eb\"", "./icons/icon.svg"], message: "Manifest debe estar alineado al tema claro." },
  { file: "service-worker.js", mustInclude: ["CACHE_VERSION", "PRECACHE_URLS", "self.addEventListener(\"fetch\"", "responderDinamico"], message: "Service worker debe tener base PWA real." },
  { file: "src/app/app.bootstrap.js", mustInclude: ["debeRegistrarServiceWorker", "!window.fitJeffDesktop", "!import.meta.env.DEV", "registrarServiceWorkerPwa"], message: "Bootstrap debe registrar PWA solo en producción web." },
  { file: "src/core/config/firebase.config.js", mustInclude: ["leerVariableEnv", "VITE_FIREBASE_ENABLED", "obtenerEstadoFirebaseConexion", "obtenerVariablesFirebaseFaltantes"], message: "Firebase config debe leer variables y exponer estado de conexion." },
  { file: "src/core/sync/sync.service.js", mustInclude: ["obtenerEstadoConexion", "responderModoLocal", "firebaseEstaConfigurado", "status.marcarModoLocal"], message: "Sync debe revisar conexion antes de sincronizar." },
  { file: "src/core/sync/sync-status.service.js", mustInclude: ["marcarModoLocal", "modo: \"local\"", "Modo local activo"], message: "Sync status debe separar modo local de error de nube." },
  { file: "src/core/bootstrap/app-data-hydration.service.js", mustInclude: ["firebaseEstaConfigurado", "origen: \"modo-local\"", "No intentar conexión remota"], message: "Hidratacion debe evitar conexion remota en modo local." },
  { file: "src/core/storage/safe-local-storage.service.js", mustInclude: ["leerMapaTextoPorPrefijo", "eliminarPorPrefijo", "listarClaves", "guardarJson"], message: "Storage seguro debe incluir utilidades para backup y repositorios." },
  { file: "src/app/app-router.js", mustInclude: ["leerUbicacionShell", "obtenerUbicacionInicial", "ubicacionRecordada", "limpiarUbicacionShell"], message: "Router debe restaurar ultima pantalla valida." },
  { file: "src/shell/shell.memory.js", mustInclude: ["crearSafeLocalStorageService", "normalizarUbicacionMemoria", "storage.leerJson", "storage.guardarJson", "storage.eliminar"], message: "Memoria del shell debe usar storage seguro." },
  { file: "src/shell/shell.view.js", mustInclude: ["Estás en", "Mantener textos visibles corregidos"], message: "Shell debe tener texto visible corregido." },
  { file: "src/features/control-corporal/registro.service.js", mustInclude: ["guardarConfiguracionInicial", "existeMedidasEnSemana", "obtenerInicioSemanaISO", "puedeEncolarSync"], message: "Control corporal debe guardar inicio en bloque, bloquear medidas duplicadas y revisar sync." },
  { file: "src/features/control-corporal/inicio/inicio.service.js", mustInclude: ["registroService.guardarConfiguracionInicial", "pesoInicialKg", "marcarCompletado"], message: "Inicio debe delegar guardado inicial a Control corporal." },
  { file: "src/features/control-corporal/estadisticas/estadisticas.calculations.js", mustInclude: ["comparacionSemanaDisponible", "comparacionMesDisponible", "describirCambioTotal", "candidatos[candidatos.length - 1] || null"], message: "Estadisticas debe evitar comparaciones sin antiguedad suficiente." },
  { file: "src/features/control-corporal/estadisticas/estadisticas.presenter.js", mustInclude: ["detalleComparacion", "comparacionSemanaDisponible", "Faltan 7 días de datos", "Faltan 30 días de datos"], message: "Presenter debe explicar comparaciones insuficientes." },
  { file: "src/features/actividad/actividad.constants.js", mustInclude: ["ACTIVIDAD_LIMITES", "EXITO_ACTUALIZADO", "AVISO_EXISTE", "ERROR_FECHA_FUTURA"], message: "Actividad debe centralizar limites y textos de actualizacion." },
  { file: "src/features/actividad/actividad.repository.js", mustInclude: ["deduplicarPorFecha", "buscarPorFecha", "guardarOActualizarPorFecha", "Mantener un solo registro principal por fecha"], message: "Repository de Actividad debe evitar duplicados por fecha." },
  { file: "src/features/actividad/actividad.service.js", mustInclude: ["obtenerActividadPorFecha", "validarActividad", "guardarOActualizarPorFecha", "fechaEsFutura"], message: "Service de Actividad debe validar reglas y actualizar por fecha." },
  { file: "src/features/actividad/registro/registro.controller.js", mustInclude: ["cargarActividadExistente", "resultado.actualizado", "rellenarFormularioActividad"], message: "Controller de Actividad debe cargar y actualizar registros existentes." },
  { file: "src/features/actividad/registro/registro.view.js", mustInclude: ["rellenarFormularioActividad", "Cargar un registro existente", "guardar sobre una fecha existente actualiza"], message: "Vista de Actividad debe permitir edicion por fecha." },
  { file: "src/features/actividad/dispositivos/dispositivos.service.js", mustInclude: ["crearDispositivosService", "preservarTexto", "identificadorLocal: preservarTexto", "cuenta: preservarTexto", "obtenerResumenDispositivos"], message: "Dispositivos debe preservar configuracion guardada." },
  { file: "src/features/control-corporal/guia-medidas/guia-medidas.view.js", mustInclude: ["crearGuiaMedidasView", "crearSilueta", "Zona seleccionada", "Cómo medirte bien"], message: "Guia de medidas debe existir como pantalla completa." },
  { file: "src/features/entrenamiento/rutinas/rutinas.view.js", mustInclude: ["crearRutinasStepper", "RUTINAS_STEPS", "Avanza por pasos"], message: "Vista de Rutinas debe usar pasos." },
  { file: "src/features/entrenamiento/jarvis/jarvis-panel.css", mustInclude: [".entreno-diario-jarvis", ".entreno-hit-jarvis", "background: linear-gradient"], message: "Jarvis debe tener estilos claros compartidos." }
];

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walkFiles(directory) {
  const absoluteDirectory = path.join(ROOT, directory);
  if (!fs.existsSync(absoluteDirectory)) return [];

  const files = [];
  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(absoluteDirectory, entry.name);
    const relativePath = path.relative(ROOT, absolutePath).replaceAll(path.sep, "/");
    if (entry.isDirectory()) files.push(...walkFiles(relativePath));
    else if (/\.(js|cjs|mjs|css|html|json|md)$/.test(entry.name)) files.push(relativePath);
  }

  return files;
}

function checkRequiredFiles() {
  return requiredFiles.filter((relativePath) => !fileExists(relativePath));
}

function checkBlockedImports() {
  const findings = [];
  for (const file of walkFiles("src")) {
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
    return;
  }

  if (missingFiles.length > 0) {
    console.error("Faltan archivos obligatorios:");
    missingFiles.forEach((item) => console.error(`- ${item}`));
  }

  if (blockedImports.length > 0) {
    console.error("Se encontraron referencias antiguas, textos mal escritos o fechas UTC en campos diarios:");
    blockedImports.forEach((item) => console.error(`- ${item}`));
  }

  if (semanticFindings.length > 0) {
    console.error("Se encontraron reglas estructurales incompletas:");
    semanticFindings.forEach((item) => console.error(`- ${item}`));
  }

  process.exitCode = 1;
}

run();
