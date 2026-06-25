/*
  Nombre completo: revision-actualizaciones.cjs
  Ruta o ubicación: scripts/revision-actualizaciones.cjs

  Función o funciones:
    - Revisar que los bloques de actualización automática estén completos y conectados.
    - Validar scripts, dependencias, archivos Electron, módulo visual, publicación Windows y preparación Android.
    - Detectar inconsistencias antes de publicar una versión.
    - Entregar un resumen claro de errores, advertencias y elementos correctos.

  Se conecta con:
    - package.json
    - electron/main.js
    - electron/preload.cjs
    - electron/electron-updater.service.js
    - src/app/app-router.js
    - src/modules/actualizaciones/*
    - scripts/actualizar-todo.bat
    - scripts/publicar-version.bat
*/

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

const resultados = {
  ok: [],
  advertencias: [],
  errores: []
};

function ruta(...partes) {
  return path.join(rootDir, ...partes);
}

function existe(...partes) {
  return fs.existsSync(ruta(...partes));
}

function leerTexto(...partes) {
  const archivo = ruta(...partes);
  return fs.existsSync(archivo) ? fs.readFileSync(archivo, "utf8") : "";
}

function leerJson(...partes) {
  return JSON.parse(leerTexto(...partes));
}

function ok(mensaje) {
  resultados.ok.push(mensaje);
}

function advertencia(mensaje) {
  resultados.advertencias.push(mensaje);
}

function error(mensaje) {
  resultados.errores.push(mensaje);
}

function revisarArchivo(relativa) {
  if (existe(...relativa.split("/"))) {
    ok(`Existe ${relativa}`);
    return true;
  }

  error(`Falta ${relativa}`);
  return false;
}

function revisarContenido(relativa, busquedas) {
  const contenido = leerTexto(...relativa.split("/"));

  if (!contenido) {
    error(`No se pudo leer ${relativa}`);
    return;
  }

  busquedas.forEach((busqueda) => {
    if (contenido.includes(busqueda)) {
      ok(`${relativa} contiene ${busqueda}`);
    } else {
      error(`${relativa} no contiene ${busqueda}`);
    }
  });
}

function revisarPackage() {
  console.log("Revisando package.json...");

  if (!revisarArchivo("package.json")) {
    return;
  }

  const pkg = leerJson("package.json");
  const scripts = pkg.scripts || {};
  const dependencias = pkg.dependencies || {};
  const devDependencias = pkg.devDependencies || {};
  const build = pkg.build || {};

  const scriptsNecesarios = [
    "dev",
    "build",
    "electron:dev",
    "electron:build",
    "tools:check",
    "version:bump",
    "build:windows",
    "build:android",
    "release:github",
    "publicar:version",
    "actualizar:todo",
    "review:updates",
    "revisar:todo"
  ];

  scriptsNecesarios.forEach((script) => {
    if (scripts[script]) ok(`Script npm listo: ${script}`);
    else error(`Falta script npm: ${script}`);
  });

  if (dependencias["electron-updater"]) ok("Dependencia electron-updater instalada en package.json");
  else error("Falta dependencia electron-updater en package.json");

  if (devDependencias["electron-builder"]) ok("Dependencia electron-builder instalada en package.json");
  else error("Falta dependencia electron-builder en package.json");

  if (build?.publish?.[0]?.provider === "github") ok("electron-builder publica hacia GitHub Releases");
  else error("Falta configuración publish github en build");

  if (build?.directories?.output === "release") ok("Salida de build configurada en release");
  else error("La salida de build no está configurada en release");

  if (pkg.version && /^\d+\.\d+\.\d+$/.test(pkg.version)) ok(`Versión semántica correcta: ${pkg.version}`);
  else error(`Versión inválida en package.json: ${pkg.version}`);
}

function revisarPackageLock() {
  console.log("Revisando package-lock.json...");

  if (!existe("package-lock.json")) {
    ok("package-lock.json no está versionado; npm install lo generará localmente si hace falta");
    return;
  }

  const lock = leerTexto("package-lock.json");
  const pkg = leerJson("package.json");

  if (!lock.includes("electron-updater")) {
    advertencia("package-lock.json no contiene electron-updater. Ejecuta npm install para regenerarlo o mantenlo fuera de Git.");
  }

  if (!lock.includes(`\"version\": \"${pkg.version}\"`)) {
    advertencia("package-lock.json podría no estar sincronizado con package.json.");
  } else {
    ok("package-lock.json coincide con la versión principal actual");
  }
}

function revisarElectron() {
  console.log("Revisando Electron updater...");

  [
    "electron/main.js",
    "electron/preload.cjs",
    "electron/electron-ipc.service.js",
    "electron/electron-updater.service.js",
    "electron/electron-update-ipc.service.js"
  ].forEach(revisarArchivo);

  revisarContenido("electron/main.js", [
    "crearElectronUpdaterService",
    "registrarIpcElectron({ updateService })",
    "updateService.iniciar()"
  ]);

  revisarContenido("electron/preload.cjs", [
    "fitJeffDesktop",
    "updates",
    "getStatus",
    "check",
    "download",
    "quitAndInstall",
    "onEvent"
  ]);

  revisarContenido("electron/electron-updater.service.js", [
    "electron-updater",
    "download-progress",
    "quitAndInstall",
    "app.isPackaged"
  ]);
}

function revisarModuloActualizaciones() {
  console.log("Revisando módulo visual de actualizaciones...");

  [
    "src/modules/actualizaciones/actualizaciones.constants.js",
    "src/modules/actualizaciones/actualizaciones.service.js",
    "src/modules/actualizaciones/actualizaciones.view.js",
    "src/modules/actualizaciones/actualizaciones.controller.js",
    "src/modules/actualizaciones/actualizaciones.css"
  ].forEach(revisarArchivo);

  revisarContenido("src/app/app-router.js", [
    "crearActualizacionesController",
    "actualizaciones",
    "montarActualizaciones"
  ]);

  revisarContenido("src/modules/actualizaciones/actualizaciones.service.js", [
    "window.fitJeffDesktop",
    "updates.getStatus",
    "updates.check",
    "updates.download",
    "updates.quitAndInstall",
    "updates.onEvent"
  ]);
}

function revisarScriptsPublicacion() {
  console.log("Revisando scripts de publicación...");

  [
    "scripts/version-bump.cjs",
    "scripts/check-tools.cjs",
    "scripts/build-windows.cjs",
    "scripts/build-android.cjs",
    "scripts/release-github.cjs",
    "scripts/publicar-version.bat",
    "scripts/actualizar-todo.bat",
    "scripts/abrir-electron-dev.bat",
    "scripts/revisar-todo.bat"
  ].forEach(revisarArchivo);

  revisarContenido("scripts/publicar-version.bat", [
    "npm run version:bump",
    "npm run build:windows",
    "npm run build:android",
    "npm run release:github",
    "git push origin main"
  ]);

  revisarContenido("scripts/release-github.cjs", [
    "gh",
    "release",
    ".apk",
    "latest-android.json",
    "latest.yml"
  ]);
}

function revisarAndroidYRelease() {
  console.log("Revisando Android y release...");

  [
    "android/README.md",
    "android/update-config.json",
    "android/signing/README.md",
    "release/README.md",
    "release/latest.json"
  ].forEach(revisarArchivo);

  if (existe("android/update-config.json")) {
    const config = leerJson("android", "update-config.json");

    if (config.packageId === "com.jeff.fitjeff") ok("Package ID Android correcto: com.jeff.fitjeff");
    else error(`Package ID Android inesperado: ${config.packageId}`);

    if (config.versionNameSameAsWindows === true) ok("Android usará la misma versión visible que Windows");
    else error("Android no está configurado para usar la misma versión visible que Windows");
  }

  const gitignore = leerTexto(".gitignore");
  if (gitignore.includes("release/*") && gitignore.includes("!release/latest.json")) {
    ok(".gitignore permite manifiestos release y evita subir instaladores generados");
  } else {
    error(".gitignore no está equilibrado para release/");
  }
}

function imprimirResumen() {
  console.log("\n========================================");
  console.log("FitJeff - Resultado de revisión");
  console.log("========================================");
  console.log(`Correctos:     ${resultados.ok.length}`);
  console.log(`Advertencias:  ${resultados.advertencias.length}`);
  console.log(`Errores:       ${resultados.errores.length}`);

  if (resultados.errores.length) {
    console.log("\nERRORES:");
    resultados.errores.forEach((item) => console.log(`- ${item}`));
  }

  if (resultados.advertencias.length) {
    console.log("\nADVERTENCIAS:");
    resultados.advertencias.forEach((item) => console.log(`- ${item}`));
  }

  console.log("\nCorrectos principales:");
  resultados.ok.slice(0, 30).forEach((item) => console.log(`- ${item}`));

  console.log("========================================");

  if (resultados.errores.length) {
    process.exit(1);
  }
}

try {
  revisarPackage();
  revisarPackageLock();
  revisarElectron();
  revisarModuloActualizaciones();
  revisarScriptsPublicacion();
  revisarAndroidYRelease();
  imprimirResumen();
} catch (err) {
  console.error("[FitJeff] La revisión falló inesperadamente.");
  console.error(err.message);
  process.exit(1);
}
