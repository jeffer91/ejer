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
  "src/features/control-corporal/registro.service.js",
  "src/features/control-corporal/registro.repository.js",
  "src/features/control-corporal/inicio/inicio.controller.js",
  "src/features/control-corporal/inicio/inicio.view.js",
  "src/features/control-corporal/inicio/inicio.css",
  "src/features/control-corporal/inicio/inicio.constants.js",
  "src/features/control-corporal/hoy/hoy.controller.js",
  "src/features/control-corporal/hoy/hoy.service.js",
  "src/features/control-corporal/hoy/hoy.rules.js",
  "src/features/control-corporal/hoy/hoy.view.js",
  "src/features/control-corporal/hoy/hoy.constants.js",
  "src/features/control-corporal/hoy/hoy.css",
  "src/features/control-corporal/estadisticas/estadisticas.controller.js",
  "src/features/control-corporal/estadisticas/estadisticas.presenter.js",
  "src/features/control-corporal/estadisticas/estadisticas.view.js",
  "src/features/control-corporal/estadisticas/estadisticas.css",
  "src/features/control-corporal/registro/registro.controller.js",
  "src/features/control-corporal/registro/ingreso.view.js",
  "src/features/control-corporal/registro/ingreso.css",
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
  { file: "README.md", mustInclude: ["Bloque 17 - Rutinas claro + pasos", "rutinas.stepper", "modo claro"], message: "README debe documentar el bloque 17 de Rutinas." },
  { file: "src/core/utils/date.util.js", mustInclude: ["formatearFechaLocalISO", "getFullYear", "getMonth", "getDate"], message: "date.util debe usar fecha local." },
  { file: "src/app/app.css", mustInclude: ["@import \"./theme-light.css\";", "@import \"./status-colors.css\";"], message: "app.css debe cargar tema claro y estados." },
  { file: "src/features/control-corporal/control-corporal.routes.js", mustInclude: ["HOY: \"hoy\"", "label: \"Hoy\""], message: "Control corporal debe tener Hoy." },
  { file: "src/features/control-corporal/control-corporal.menu.js", mustInclude: ["defaultRoute: CONTROL_CORPORAL_ROUTES.HOY"], message: "Control corporal debe abrir Hoy." },
  { file: "src/features/features.registry.js", mustInclude: ["ACTIVIDAD_MENU", "montarPantallaActividad", "FEATURE_DEFAULT_ROUTE_ID = CONTROL_CORPORAL_ROUTES.HOY"], message: "Features Registry debe registrar Actividad y mantener Hoy." },
  { file: "src/app/app-router.js", mustInclude: ["alNavegar: navegar"], message: "app-router debe pasar navegación interna." },
  { file: "src/features/control-corporal/inicio/inicio.constants.js", mustInclude: ["Guardar y abrir Hoy", "Abriendo Hoy"], message: "Inicio debe dirigir hacia Hoy." },
  { file: "src/features/control-corporal/registro/ingreso.view.js", mustInclude: ["crearMedidasModal", "abrirAyuda", "medidas-modal/medidas-modal.view.js"], message: "Registro debe abrir popup visual de medidas." },
  { file: "src/features/control-corporal/registro/medidas-modal/medidas-modal.constants.js", mustInclude: ["MEDIDAS_MODAL_INFO", "Dónde medir", "obtenerMedidaModalInfo"], message: "Modal de medidas debe tener textos claros." },
  { file: "src/features/control-corporal/registro/medidas-modal/medidas-figura.svg.js", mustInclude: ["crearFiguraMedicion", "medidas-figura__cinta", "ZONAS_LINEA"], message: "Modal de medidas debe incluir figura visual." },
  { file: "src/features/control-corporal/registro/medidas-modal/medidas-modal.view.js", mustInclude: ["role", "dialog", "crearFiguraMedicion", "Escape"], message: "Modal de medidas debe tener diálogo accesible." },
  { file: "src/features/control-corporal/registro/medidas-modal/medidas-modal.css", mustInclude: [".medidas-modal", ".medidas-figura__cinta", "background: rgba(7, 17, 31, 0.42)"], message: "Modal de medidas debe tener estilos." },
  { file: "src/features/control-corporal/estadisticas/estadisticas.view.js", mustInclude: ["prepararVistaEstadisticas"], message: "Progreso debe usar presenter." },
  { file: "src/features/actividad/actividad.service.js", mustInclude: ["sumarDiasISO", "fechaHoyISO", "bicicletaKm"], message: "Actividad debe usar fecha local y bicicleta." },
  { file: "src/features/entrenamiento/entrenamiento.constants.js", mustInclude: ["GEMINI_SETTINGS_STORAGE_KEY", "fitjeff.entrenamiento.gemini.settings.v1"], message: "Entrenamiento debe tener clave separada para Gemini." },
  { file: "src/features/entrenamiento/ajustes/gemini-settings.repository.js", mustInclude: ["GEMINI_SETTINGS_STORAGE_KEY", "localStorage", "borrarApiKey"], message: "Gemini debe guardar en almacenamiento separado." },
  { file: "src/features/entrenamiento/ajustes/gemini-settings.service.js", mustInclude: ["sincronizarDesdeAjustes", "guardarDesdeFormulario", "actualizarPruebaGemini"], message: "Gemini service debe blindar guardado." },
  { file: "src/features/entrenamiento/ajustes/ajustes.view.js", mustInclude: ["Persistencia Gemini", "Si dejas este campo vacío", "Borrar Key"], message: "Ajustes debe mostrar estado de Gemini." },
  { file: "src/features/entrenamiento/rutinas/rutinas.steps.js", mustInclude: ["RUTINAS_STEPS", "IA", "Manual", "Guardadas"], message: "Rutinas debe definir pasos." },
  { file: "src/features/entrenamiento/rutinas/rutinas.stepper.view.js", mustInclude: ["crearRutinasStepper", "rutinas-stepper__tab", "Siguiente"], message: "Rutinas debe tener stepper." },
  { file: "src/features/entrenamiento/rutinas/rutinas.stepper.css", mustInclude: [".rutinas-stepper", ".rutinas-stepper__tab--active", "grid-template-columns"], message: "Stepper de Rutinas debe tener estilos." },
  { file: "src/features/entrenamiento/rutinas/rutinas.view.js", mustInclude: ["crearRutinasStepper", "RUTINAS_STEPS", "Avanza por pasos"], message: "Vista de Rutinas debe usar pasos." },
  { file: "src/features/entrenamiento/rutinas/rutinas.css", mustInclude: ["background: rgba(255, 255, 255, 0.94)", "var(--fj-action-bg", "entreno-rutinas-summary"], message: "Rutinas debe estar en modo claro." },
  { file: "src/features/entrenamiento/stats/stats.css", mustInclude: ["background: rgba(255, 255, 255, 0.94)", "var(--fj-text-strong", "entreno-stats-card--ok"], message: "Stats debe estar en modo claro." },
  { file: "src/modules/ajustes/ajustes.css", mustInclude: ["background: rgba(255, 255, 255, 0.94)", "var(--fj-action-bg", "background: #ffffff"], message: "Ajustes debe estar en modo claro." },
  { file: "src/modules/actualizaciones/actualizaciones.css", mustInclude: ["background: rgba(255, 255, 255, 0.94)", "var(--fj-action-bg", "fj-update-progress__bar"], message: "Actualizaciones debe estar en modo claro." }
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

    if (entry.isDirectory()) {
      files.push(...walkFiles(relativePath));
    } else if (/\.(js|cjs|mjs|css|html|json|md)$/.test(entry.name)) {
      files.push(relativePath);
    }
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
    console.log("Registro integra ayuda ? con popup visual y mapa corporal.");
    console.log("Rutinas usa flujo por pasos y modo claro.");
    console.log("Gemini guarda API Key en almacenamiento separado.");
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
