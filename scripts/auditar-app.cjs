/*
  Nombre completo: auditar-app.cjs
  Ruta o ubicación: scripts/auditar-app.cjs

  Función o funciones:
    - Auditar FitJeff de forma estática antes de abrir, compilar o publicar.
    - Verificar package.json, scripts principales, archivos críticos y rutas de imports locales.
    - Detectar configuradores Firebase no solicitados, archivos faltantes y referencias rotas.
    - Verificar metadata, cola diferencial y scheduler de sincronización local-first.
    - Reportar avisos sin bloquear cuando son configuración pendiente, no errores de código.

  Se conecta con:
    - package.json
    - scripts/check-local.cjs
    - scripts/check-structure.cjs
    - src/app/app.bootstrap.js
    - src/core/config/firebase.project.config.js
    - src/core/sync/sync-metadata.service.js
    - src/core/sync/sync-queue.service.js
    - src/core/sync/sync-scheduler.service.js
*/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const EXTENSIONES_RESOLUCION = ["", ".js", ".cjs", ".mjs", ".json", ".css"];
const DIRECTORIOS_AUDITADOS = ["src", "electron", "scripts"];
const DIRECTORIOS_IGNORADOS = new Set(["node_modules", "dist", "release", ".git", ".vite", ".idea", ".vscode"]);

const archivosCriticos = [
  "package.json",
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "electron/main.js",
  "electron/electron-path.service.js",
  "electron/electron-window.service.js",
  "scripts/start-electron-dev.cjs",
  "scripts/check-local.cjs",
  "scripts/check-structure.cjs",
  "scripts/build-windows.cjs",
  "scripts/build-android.cjs",
  "scripts/release-github.cjs",
  "src/app/app.bootstrap.js",
  "src/app/app-router.js",
  "src/core/config/firebase.config.js",
  "src/core/config/firebase.project.config.js",
  "src/core/bootstrap/app-data-hydration.service.js",
  "src/core/sync/sync.service.js",
  "src/core/sync/sync-queue.service.js",
  "src/core/sync/sync-metadata.service.js",
  "src/core/sync/sync-scheduler.service.js",
  "src/features/features.registry.js"
];

const scriptsObligatorios = [
  "start",
  "dev",
  "build",
  "electron:dev",
  "electron:build",
  "desktop:win",
  "tools:check",
  "check:structure",
  "check:local",
  "audit:app",
  "version:bump",
  "build:windows",
  "build:android",
  "release:github",
  "publicar:automatico"
];

const archivosNoPermitidos = [
  "CONFIGURAR_FIREBASE_FITJEFF.bat",
  "scripts/configurar-firebase-local.bat"
];

function existe(rutaRelativa) {
  return fs.existsSync(path.join(ROOT, rutaRelativa));
}

function leer(rutaRelativa) {
  return fs.readFileSync(path.join(ROOT, rutaRelativa), "utf8");
}

function listarArchivos(directorio, acumulado = []) {
  const base = path.join(ROOT, directorio);

  if (!fs.existsSync(base)) {
    return acumulado;
  }

  for (const item of fs.readdirSync(base, { withFileTypes: true })) {
    const rutaAbs = path.join(base, item.name);
    const rutaRel = path.relative(ROOT, rutaAbs).replaceAll(path.sep, "/");

    if (item.isDirectory()) {
      if (!DIRECTORIOS_IGNORADOS.has(item.name)) {
        listarArchivos(rutaRel, acumulado);
      }
    } else if (/\.(js|cjs|mjs)$/.test(item.name)) {
      acumulado.push(rutaRel);
    }
  }

  return acumulado;
}

function resolverImport(rutaArchivo, importRelativo) {
  const base = path.dirname(path.join(ROOT, rutaArchivo));
  const candidatoBase = path.resolve(base, importRelativo);

  for (const extension of EXTENSIONES_RESOLUCION) {
    const candidato = `${candidatoBase}${extension}`;
    if (fs.existsSync(candidato) && fs.statSync(candidato).isFile()) {
      return true;
    }
  }

  if (fs.existsSync(candidatoBase) && fs.statSync(candidatoBase).isDirectory()) {
    return ["index.js", "index.cjs", "index.mjs"].some((archivo) => fs.existsSync(path.join(candidatoBase, archivo)));
  }

  return false;
}

function extraerImports(contenido) {
  const imports = [];
  const patrones = [
    /import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g,
    /export\s+[^"']+\s+from\s+["']([^"']+)["']/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
    /import\(\s*["']([^"']+)["']\s*\)/g
  ];

  patrones.forEach((patron) => {
    let match = patron.exec(contenido);
    while (match) {
      imports.push(match[1]);
      match = patron.exec(contenido);
    }
  });

  return [...new Set(imports)];
}

function auditarPackage(errores) {
  if (!existe("package.json")) {
    errores.push("No existe package.json.");
    return;
  }

  const pkg = JSON.parse(leer("package.json"));
  const scripts = pkg.scripts || {};

  scriptsObligatorios.forEach((script) => {
    if (!scripts[script]) {
      errores.push(`Falta script npm obligatorio: ${script}`);
    }
  });

  if (scripts["configurar:firebase"]) {
    errores.push("No debe existir script configurar:firebase; Firebase se resuelve desde código.");
  }

  if (scripts.start !== "node scripts/start-electron-dev.cjs") {
    errores.push("npm start debe usar scripts/start-electron-dev.cjs.");
  }
}

function auditarArchivosCriticos(errores) {
  archivosCriticos.forEach((archivo) => {
    if (!existe(archivo)) {
      errores.push(`Falta archivo crítico: ${archivo}`);
    }
  });

  archivosNoPermitidos.forEach((archivo) => {
    if (existe(archivo)) {
      errores.push(`Archivo no permitido detectado: ${archivo}`);
    }
  });
}

function auditarImportsLocales(errores) {
  const archivos = DIRECTORIOS_AUDITADOS.flatMap((directorio) => listarArchivos(directorio));

  archivos.forEach((archivo) => {
    const contenido = leer(archivo);
    const imports = extraerImports(contenido).filter((importPath) => importPath.startsWith("."));

    imports.forEach((importPath) => {
      if (!resolverImport(archivo, importPath)) {
        errores.push(`${archivo} importa una ruta inexistente: ${importPath}`);
      }
    });
  });
}

function auditarIndex(errores) {
  if (!existe("index.html")) return;
  const html = leer("index.html");

  if (!html.includes('id="app"')) {
    errores.push("index.html debe contener el contenedor #app.");
  }

  if (!html.includes('src="./src/app/app.bootstrap.js"')) {
    errores.push("index.html debe cargar src/app/app.bootstrap.js.");
  }
}

function auditarFirebase(avisos) {
  if (!existe("src/core/config/firebase.project.config.js")) return;
  const contenido = leer("src/core/config/firebase.project.config.js");
  const tieneApiKey = /apiKey:\s*["'][^"']{6,}["']/.test(contenido);
  const tieneProjectId = /projectId:\s*["'][^"']{2,}["']/.test(contenido);
  const tieneAppId = /appId:\s*["'][^"']{6,}["']/.test(contenido);

  if (!tieneApiKey || !tieneProjectId || !tieneAppId) {
    avisos.push("Firebase desde código está preparado, pero apiKey/projectId/appId siguen vacíos. La app abrirá en modo local hasta completar esos valores.");
  }
}

function imprimirLista(titulo, items) {
  if (items.length === 0) return;
  console.log(titulo);
  items.forEach((item) => console.log(`- ${item}`));
}

function main() {
  const errores = [];
  const avisos = [];

  console.log("========================================");
  console.log("FitJeff - Auditoría estática de app");
  console.log("========================================");

  auditarPackage(errores);
  auditarArchivosCriticos(errores);
  auditarImportsLocales(errores);
  auditarIndex(errores);
  auditarFirebase(avisos);

  imprimirLista("Avisos:", avisos);
  imprimirLista("Errores:", errores);

  if (errores.length > 0) {
    console.log("========================================");
    console.log("Resultado: auditoría con errores.");
    process.exit(1);
  }

  console.log("========================================");
  console.log("Resultado: auditoría sin errores críticos.");
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] Auditoría interrumpida.");
  console.error(error.message);
  process.exit(1);
}
