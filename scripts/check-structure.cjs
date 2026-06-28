const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const requiredFiles = [
  "README.md",
  "docs/fase-visual-2026-cierre.md",
  "src/core/utils/date.util.js",
  "src/app/app-router.js",
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
  "src/features/control-corporal/registro.schema.js",
  "src/features/control-corporal/registro.service.js",
  "src/features/control-corporal/registro.repository.js",
  "src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js",
  "src/features/control-corporal/analisis-corporal/analisis-corporal.presenter.js",
  "src/features/control-corporal/analisis-corporal/avatar-corporal.view.js",
  "src/features/control-corporal/analisis-corporal/avatar-corporal.css",
  "src/features/control-corporal/inicio/inicio.controller.js",
  "src/features/control-corporal/inicio/inicio.service.js",
  "src/features/control-corporal/inicio/inicio.view.js",
  "src/features/control-corporal/inicio/inicio.css",
  "src/features/control-corporal/inicio/inicio.constants.js",
  "src/features/control-corporal/inicio/inicio.validator.js",
  "src/features/control-corporal/hoy/hoy.controller.js",
  "src/features/control-corporal/hoy/hoy.service.js",
  "src/features/control-corporal/hoy/hoy.rules.js",
  "src/features/control-corporal/hoy/hoy.view.js",
  "src/features/control-corporal/hoy/hoy.constants.js",
  "src/features/control-corporal/hoy/hoy.css",
  "src/features/control-corporal/estadisticas/estadisticas.controller.js",
  "src/features/control-corporal/estadisticas/estadisticas.calculations.js",
  "src/features/control-corporal/estadisticas/estadisticas.presenter.js",
  "src/features/control-corporal/estadisticas/estadisticas.view.js",
  "src/features/control-corporal/estadisticas/estadisticas.css",
  "src/features/control-corporal/registro/registro.controller.js",
  "src/features/control-corporal/registro/ingreso.view.js",
  "src/features/control-corporal/registro/ingreso.css",
  "src/features/control-corporal/registro/ingreso.constants.js",
  "src/features/control-corporal/registro/ayudas-medidas.constants.js",
  "src/features/control-corporal/registro/mapa-corporal.view.js",
  "src/features/control-corporal/registro/mapa-corporal.css",
  "src/features/control-corporal/registro/medidas-modal/medidas-modal.constants.js",
  "src/features/control-corporal/registro/medidas-modal/medidas-figura.svg.js",
  "src/features/control-corporal/registro/medidas-modal/medidas-modal.view.js",
  "src/features/control-corporal/registro/medidas-modal/medidas-modal.css",
  "src/features/control-corporal/historial/historial.controller.js",
  "src/features/control-corporal/historial/historial.view.js",
  "src/features/control-corporal/historial/historial.css",
  "src/features/actividad/actividad.constants.js",
  "src/features/actividad/actividad.routes.js",
  "src/features/actividad/actividad.menu.js",
  "src/features/actividad/actividad.module.js",
  "src/features/actividad/actividad.repository.js",
  "src/features/actividad/actividad.service.js",
  "src/features/actividad/dispositivos/dispositivos.constants.js",
  "src/features/actividad/dispositivos/dispositivos.repository.js",
  "src/features/actividad/dispositivos/dispositivos.service.js",
  "src/features/actividad/dispositivos/dispositivos.controller.js",
  "src/features/actividad/dispositivos/dispositivos.view.js",
  "src/features/actividad/dispositivos/dispositivos.css",
  "src/features/actividad/dispositivos/adapters/cubitt.adapter.js",
  "src/features/actividad/dispositivos/adapters/google-fit.adapter.js",
  "src/features/actividad/resumen/resumen.controller.js",
  "src/features/actividad/resumen/resumen.view.js",
  "src/features/actividad/resumen/resumen.css",
  "src/features/actividad/registro/registro.controller.js",
  "src/features/actividad/registro/registro.view.js",
  "src/features/actividad/registro/registro.css",
  "src/features/entrenamiento/entrenamiento.constants.js",
  "src/features/entrenamiento/ajustes/ajustes.controller.js",
  "src/features/entrenamiento/ajustes/ajustes.service.js",
  "src/features/entrenamiento/ajustes/ajustes.view.js",
  "src/features/entrenamiento/ajustes/ajustes.css",
  "src/features/entrenamiento/ajustes/gemini.service.js",
  "src/features/entrenamiento/ajustes/gemini-settings.repository.js",
  "src/features/entrenamiento/ajustes/gemini-settings.service.js",
  "src/features/entrenamiento/ajustes/gemini-settings.migration.js",
  "src/features/entrenamiento/jarvis/jarvis-panel.view.js",
  "src/features/entrenamiento/jarvis/jarvis-panel.css",
  "src/features/entrenamiento/diario/diario.controller.js",
  "src/features/entrenamiento/diario/diario.view.js",
  "src/features/entrenamiento/diario/diario.jarvis.js",
  "src/features/entrenamiento/diario/diario.css",
  "src/features/entrenamiento/hit/hit.controller.js",
  "src/features/entrenamiento/hit/hit.view.js",
  "src/features/entrenamiento/hit/hit.jarvis.js",
  "src/features/entrenamiento/hit/hit.css",
  "src/features/entrenamiento/rutinas/rutinas.controller.js",
  "src/features/entrenamiento/rutinas/rutinas.view.js",
  "src/features/entrenamiento/rutinas/rutinas.css",
  "src/features/entrenamiento/rutinas/rutinas.steps.js",
  "src/features/entrenamiento/rutinas/rutinas.stepper.view.js",
  "src/features/entrenamiento/rutinas/rutinas.stepper.css",
  "src/features/entrenamiento/stats/stats.controller.js",
  "src/features/entrenamiento/stats/stats.view.js",
  "src/features/entrenamiento/stats/stats.css",
  "src/modules/ajustes/ajustes.controller.js",
  "src/modules/ajustes/ajustes.view.js",
  "src/modules/ajustes/ajustes.css",
  "src/modules/actualizaciones/actualizaciones.controller.js",
  "src/modules/actualizaciones/actualizaciones.view.js",
  "src/modules/actualizaciones/actualizaciones.css",
  "src/features/_template/template.menu.js",
  "src/features/_template/template.routes.js",
  "src/features/_template/template.module.js"
];

const blockedPatterns = [
  "../modules/inicio",
  "../modules/registro",
  "../../modules/inicio",
  "../../modules/registro",
  "src/modules/inicio",
  "src/modules/registro",
  "toISOString().slice(0, 10)"
];

const semanticChecks = [
  { file: "README.md", mustInclude: ["Bloque 20 - Dispositivos", "Cubitt CT4", "Google Fit"], message: "README debe documentar el bloque 20." },
  { file: "src/app/app.css", mustInclude: ["@import \"./theme-light.css\";", "@import \"./status-colors.css\";"], message: "app.css debe cargar tema claro y estados." },
  { file: "src/features/actividad/actividad.routes.js", mustInclude: ["DISPOSITIVOS", "actividad-dispositivos", "Cubitt CT4 y Google Fit"], message: "Actividad debe tener ruta de dispositivos." },
  { file: "src/features/actividad/actividad.module.js", mustInclude: ["crearDispositivosController", "ACTIVIDAD_ROUTES.DISPOSITIVOS"], message: "Actividad debe montar la pantalla de dispositivos." },
  { file: "src/features/actividad/actividad.service.js", mustInclude: ["obtenerResumenDispositivos", "dispositivos"], message: "Resumen de Actividad debe incluir dispositivos." },
  { file: "src/features/actividad/resumen/resumen.view.js", mustInclude: ["crearPanelDispositivos", "Preparar dispositivos", "ACTIVIDAD_ROUTES.DISPOSITIVOS"], message: "Resumen debe enlazar Dispositivos." },
  { file: "src/features/actividad/dispositivos/dispositivos.constants.js", mustInclude: ["DISPOSITIVOS_STORAGE_KEY", "Cubitt", "Google Fit", "AVISO_PRIVADO"], message: "Dispositivos debe tener constantes base." },
  { file: "src/features/actividad/dispositivos/dispositivos.repository.js", mustInclude: ["crearDispositivosRepository", "localStorage", "mezclarEstado"], message: "Dispositivos debe persistir localmente." },
  { file: "src/features/actividad/dispositivos/dispositivos.service.js", mustInclude: ["crearDispositivosService", "crearCubittAdapter", "crearGoogleFitAdapter", "obtenerResumenDispositivos"], message: "Dispositivos debe tener service y adapters." },
  { file: "src/features/actividad/dispositivos/adapters/cubitt.adapter.js", mustInclude: ["crearCubittAdapter", "normalizarActividadLectura"], message: "Debe existir adapter Cubitt." },
  { file: "src/features/actividad/dispositivos/adapters/google-fit.adapter.js", mustInclude: ["crearGoogleFitAdapter", "normalizarActividadLectura"], message: "Debe existir adapter Google Fit." },
  { file: "src/features/actividad/dispositivos/dispositivos.view.js", mustInclude: ["crearDispositivosView", "identificador local", "Google Fit", "Puente FitJeff"], message: "Debe existir vista de dispositivos." },
  { file: "src/features/actividad/dispositivos/dispositivos.css", mustInclude: ["dispositivos-screen", "dispositivos-status-grid", "dispositivos-button--primary"], message: "Debe existir estilo de dispositivos." },
  { file: "src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js", mustInclude: ["construirAnalisisCorporal", "relacionCinturaAltura", "nivelMuscular"], message: "Debe existir análisis corporal inteligente." },
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
    console.log("Bloque 15 aplicado: Gemini con persistencia blindada.");
    console.log("Bloque 16 aplicado: medidas con popup visual.");
    console.log("Bloque 17 aplicado: Rutinas claro + pasos.");
    console.log("Bloque 18 aplicado: Jarvis claro en Diario y HIT.");
    console.log("Bloque 19 aplicado: Control corporal inteligente.");
    console.log("Bloque 20 aplicado: Dispositivos, Cubitt CT4 y Google Fit preparados.");
    return;
  }

  if (missingFiles.length > 0) {
    console.error("Faltan archivos obligatorios:");
    missingFiles.forEach((item) => console.error(`- ${item}`));
  }

  if (blockedImports.length > 0) {
    console.error("Se encontraron referencias antiguas o fechas UTC en campos diarios:");
    blockedImports.forEach((item) => console.error(`- ${item}`));
  }

  if (semanticFindings.length > 0) {
    console.error("Se encontraron reglas estructurales incompletas:");
    semanticFindings.forEach((item) => console.error(`- ${item}`));
  }

  process.exitCode = 1;
}

run();
