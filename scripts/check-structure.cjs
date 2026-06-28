/*
  Nombre completo: check-structure.cjs
  Ruta o ubicacion: scripts/check-structure.cjs

  Funcion o funciones:
    - Revisar que la estructura modular principal exista.
    - Confirmar que el redisenio visual claro tenga sus archivos base.
    - Confirmar que Hoy exista como pantalla principal de Control corporal.
    - Confirmar que Inicio, Registro y Progreso esten alineados al modo claro.
    - Detectar imports antiguos hacia src/modules/inicio o src/modules/registro.
    - Confirmar que Control corporal, Shell y Features Registry estan conectados.

  Se conecta con:
    - package.json
    - src/app/app.css
    - src/features/features.registry.js
    - src/shell/shell.menu.config.js
    - src/app/app-router.js
*/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const requiredFiles = [
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
  "src/features/control-corporal/historial/historial.controller.js",
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
  "src/modules/registro"
];

const semanticChecks = [
  {
    file: "src/app/app.css",
    mustInclude: ["@import \"./theme-light.css\";", "@import \"./status-colors.css\";"],
    message: "app.css debe cargar theme-light.css y status-colors.css."
  },
  {
    file: "src/features/control-corporal/control-corporal.routes.js",
    mustInclude: ["HOY: \"hoy\"", "label: \"Hoy\""],
    message: "Control corporal debe tener ruta Hoy en el menu."
  },
  {
    file: "src/features/control-corporal/control-corporal.menu.js",
    mustInclude: ["defaultRoute: CONTROL_CORPORAL_ROUTES.HOY"],
    message: "Control corporal debe abrir Hoy por defecto."
  },
  {
    file: "src/features/features.registry.js",
    mustInclude: ["FEATURE_DEFAULT_ROUTE_ID = CONTROL_CORPORAL_ROUTES.HOY"],
    message: "Features Registry debe usar Hoy como ruta inicial."
  },
  {
    file: "src/app/app-router.js",
    mustInclude: ["alNavegar: navegar"],
    message: "app-router debe pasar navegacion interna a los modulos."
  },
  {
    file: "src/features/control-corporal/inicio/inicio.constants.js",
    mustInclude: ["Guardar y abrir Hoy", "Abriendo Hoy"],
    message: "Inicio debe dirigir al usuario hacia Hoy."
  },
  {
    file: "src/features/control-corporal/inicio/inicio.css",
    mustInclude: ["var(--fj-action-bg", "background: #ffffff", "var(--fj-text-strong"],
    message: "Inicio debe estar alineado al modo claro."
  },
  {
    file: "src/features/control-corporal/registro/ingreso.view.js",
    mustInclude: ["obtenerAyudaMedida", "crearMapaCorporal", "ingreso-help-button"],
    message: "Registro debe integrar ayuda ? y mapa corporal."
  },
  {
    file: "src/features/control-corporal/estadisticas/estadisticas.view.js",
    mustInclude: ["prepararVistaEstadisticas"],
    message: "Progreso debe usar presenter para ordenar la vista."
  }
];

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walkFiles(directory) {
  const absoluteDirectory = path.join(ROOT, directory);

  if (!fs.existsSync(absoluteDirectory)) {
    return [];
  }

  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(absoluteDirectory, entry.name);
    const relativePath = path.relative(ROOT, absolutePath).replaceAll(path.sep, "/");

    if (entry.isDirectory()) {
      files.push(...walkFiles(relativePath));
      continue;
    }

    if (/\.(js|cjs|mjs|css|html|json|md)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function checkRequiredFiles() {
  return requiredFiles.filter((relativePath) => !fileExists(relativePath));
}

function checkBlockedImports() {
  const files = walkFiles("src");
  const findings = [];

  for (const file of files) {
    const content = readFile(file);

    for (const pattern of blockedPatterns) {
      if (content.includes(pattern)) {
        findings.push(`${file} -> ${pattern}`);
      }
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

    if (missing.length > 0) {
      findings.push(`${check.file} -> ${check.message} Faltan: ${missing.join(", ")}`);
    }
  }

  return findings;
}

function run() {
  const missingFiles = checkRequiredFiles();
  const blockedImports = checkBlockedImports();
  const semanticFindings = checkSemanticRules();

  if (missingFiles.length === 0 && blockedImports.length === 0 && semanticFindings.length === 0) {
    console.log("Estructura modular OK.");
    console.log("Control corporal vive en src/features/control-corporal.");
    console.log("Hoy es la pantalla principal de Control corporal.");
    console.log("El tema claro global esta registrado.");
    console.log("Inicio abre hacia Hoy y usa modo claro.");
    console.log("Registro integra ayuda ? y mapa corporal.");
    console.log("Progreso usa presenter para una vista ordenada.");
    return;
  }

  if (missingFiles.length > 0) {
    console.error("Faltan archivos obligatorios:");
    missingFiles.forEach((item) => console.error(`- ${item}`));
  }

  if (blockedImports.length > 0) {
    console.error("Se encontraron referencias antiguas:");
    blockedImports.forEach((item) => console.error(`- ${item}`));
  }

  if (semanticFindings.length > 0) {
    console.error("Se encontraron reglas estructurales incompletas:");
    semanticFindings.forEach((item) => console.error(`- ${item}`));
  }

  process.exitCode = 1;
}

run();
