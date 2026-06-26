/*
  Nombre completo: check-structure.cjs
  Ruta o ubicación: scripts/check-structure.cjs

  Función o funciones:
    - Revisar que la estructura modular principal exista.
    - Detectar imports antiguos hacia src/modules/inicio o src/modules/registro.
    - Confirmar que Control corporal, Shell y Features Registry están conectados.

  Se conecta con:
    - package.json
    - src/features/features.registry.js
    - src/shell/shell.menu.config.js
    - src/app/app-router.js
*/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const requiredFiles = [
  "src/app/app-router.js",
  "src/shell/shell.menu.config.js",
  "src/shell/shell.controller.js",
  "src/shell/shell.view.js",
  "src/shell/shell.router.js",
  "src/shell/shell.memory.js",
  "src/features/features.registry.js",
  "src/features/control-corporal/control-corporal.menu.js",
  "src/features/control-corporal/control-corporal.routes.js",
  "src/features/control-corporal/control-corporal.module.js",
  "src/features/control-corporal/registro.service.js",
  "src/features/control-corporal/registro.repository.js",
  "src/features/control-corporal/inicio/inicio.controller.js",
  "src/features/control-corporal/estadisticas/estadisticas.controller.js",
  "src/features/control-corporal/registro/registro.controller.js",
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

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
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
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");

    for (const pattern of blockedPatterns) {
      if (content.includes(pattern)) {
        findings.push(`${file} -> ${pattern}`);
      }
    }
  }

  return findings;
}

function run() {
  const missingFiles = checkRequiredFiles();
  const blockedImports = checkBlockedImports();

  if (missingFiles.length === 0 && blockedImports.length === 0) {
    console.log("Estructura modular OK.");
    console.log("Control corporal vive en src/features/control-corporal.");
    console.log("El menu global se alimenta desde src/features/features.registry.js.");
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

  process.exitCode = 1;
}

run();
