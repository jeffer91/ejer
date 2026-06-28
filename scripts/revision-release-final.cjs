/*
  Nombre completo: revision-release-final.cjs
  Ruta o ubicación: scripts/revision-release-final.cjs

  Función o funciones:
    - Ejecutar la revisión final antes de publicar FitJeff.
    - Validar configuración de instalador Windows, updater, GitHub Releases y Android/APK.
    - Detectar artefactos viejos para evitar publicar instaladores o APK de versiones anteriores.
    - Funcionar en modo preflight y en modo after-build.

  Se conecta con:
    - package.json
    - scripts/build-windows.cjs
    - scripts/build-android.cjs
    - scripts/release-github.cjs
    - scripts/publicar-version.bat
    - scripts/publicar-version-automatica.bat
    - release/latest.json
    - release/latest-android.json
*/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RELEASE_DIR = path.join(ROOT, "release");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const ANDROID_CONFIG_PATH = path.join(ROOT, "android", "update-config.json");
const LATEST_JSON_PATH = path.join(RELEASE_DIR, "latest.json");
const LATEST_ANDROID_PATH = path.join(RELEASE_DIR, "latest-android.json");
const modoAfterBuild = process.argv.includes("--after-build");

const resultado = {
  ok: [],
  advertencias: [],
  errores: []
};

function ruta(relativa) {
  return path.join(ROOT, ...relativa.split("/"));
}

function existe(relativa) {
  return fs.existsSync(ruta(relativa));
}

function leerTexto(relativa) {
  const archivo = ruta(relativa);
  return fs.existsSync(archivo) ? fs.readFileSync(archivo, "utf8") : "";
}

function leerJsonSeguro(archivo, fallback = null) {
  try {
    if (!fs.existsSync(archivo)) return fallback;
    return JSON.parse(fs.readFileSync(archivo, "utf8"));
  } catch {
    return fallback;
  }
}

function ok(mensaje) {
  resultado.ok.push(mensaje);
}

function advertencia(mensaje) {
  resultado.advertencias.push(mensaje);
}

function error(mensaje) {
  resultado.errores.push(mensaje);
}

function validarArchivo(relativa, obligatorio = true) {
  if (existe(relativa)) {
    ok(`Existe ${relativa}`);
    return true;
  }

  if (obligatorio) error(`Falta ${relativa}`);
  else advertencia(`Opcional pendiente: ${relativa}`);
  return false;
}

function validarContenido(relativa, textos, obligatorio = true) {
  const contenido = leerTexto(relativa);

  if (!contenido) {
    if (obligatorio) error(`No se pudo leer ${relativa}`);
    else advertencia(`No se pudo leer archivo opcional ${relativa}`);
    return;
  }

  textos.forEach((texto) => {
    if (contenido.includes(texto)) ok(`${relativa} contiene ${texto}`);
    else if (obligatorio) error(`${relativa} no contiene ${texto}`);
    else advertencia(`${relativa} no contiene ${texto}`);
  });
}

function leerPackage() {
  const pkg = leerJsonSeguro(PACKAGE_PATH, null);

  if (!pkg) {
    error("No se pudo leer package.json.");
    return null;
  }

  return pkg;
}

function listarRelease() {
  if (!fs.existsSync(RELEASE_DIR)) return [];

  return fs.readdirSync(RELEASE_DIR)
    .map((nombre) => path.join(RELEASE_DIR, nombre))
    .filter((archivo) => fs.statSync(archivo).isFile());
}

function nombre(archivo) {
  return path.basename(archivo);
}

function contieneVersion(archivo, version) {
  return nombre(archivo).toLowerCase().includes(String(version).toLowerCase());
}

function revisarPackage(pkg) {
  if (!pkg) return;

  console.log("Revisando package.json y electron-builder...");

  if (/^\d+\.\d+\.\d+$/.test(pkg.version || "")) ok(`Versión semántica válida: ${pkg.version}`);
  else error(`Versión inválida: ${pkg.version}`);

  const scripts = pkg.scripts || {};
  const scriptsEsperados = {
    "build:windows": "node scripts/build-windows.cjs",
    "build:android": "node scripts/build-android.cjs",
    "release:github": "node scripts/release-github.cjs",
    "release:check": "node scripts/revision-release-final.cjs",
    "release:check:built": "node scripts/revision-release-final.cjs --after-build",
    "publicar:automatico": "scripts\\publicar-version-automatica.bat"
  };

  Object.entries(scriptsEsperados).forEach(([clave, valor]) => {
    if (scripts[clave] === valor) ok(`Script ${clave} correcto`);
    else error(`Script ${clave} debe ser: ${valor}`);
  });

  const build = pkg.build || {};
  if (build.appId === "com.jeff.fitjeff") ok("appId Windows correcto: com.jeff.fitjeff");
  else error(`appId inesperado: ${build.appId}`);

  if (build.productName === "FitJeff") ok("productName correcto: FitJeff");
  else error(`productName inesperado: ${build.productName}`);

  if (build.directories?.output === "release") ok("Salida del instalador configurada en release/");
  else error("electron-builder debe generar en release/.");

  if (String(build.artifactName || "").includes("${version}")) ok("artifactName incluye versión");
  else error("artifactName debe incluir ${version} para evitar publicar instaladores viejos.");

  if (build.publish?.[0]?.provider === "github" && build.publish?.[0]?.owner === "jeffer91" && build.publish?.[0]?.repo === "ejer") {
    ok("publish GitHub configurado para jeffer91/ejer");
  } else {
    error("publish GitHub debe apuntar a jeffer91/ejer.");
  }

  if (build.win?.target?.[0]?.target === "nsis") ok("Target Windows NSIS configurado");
  else error("Windows debe compilar con target nsis.");

  if (build.nsis?.oneClick === false && build.nsis?.allowToChangeInstallationDirectory === true) {
    ok("NSIS permite instalador guiado y carpeta configurable");
  } else {
    advertencia("NSIS debería mantener oneClick=false y allowToChangeInstallationDirectory=true.");
  }
}

function revisarArchivosBase() {
  console.log("Revisando archivos base de publicación...");

  [
    "scripts/build-windows.cjs",
    "scripts/build-android.cjs",
    "scripts/release-github.cjs",
    "scripts/publicar-version.bat",
    "scripts/publicar-version-automatica.bat",
    "electron/electron-updater.service.js",
    "electron/electron-update-ipc.service.js",
    "electron/preload.cjs",
    "android/update-config.json",
    "android/signing/README.md",
    "release/README.md",
    "release/latest.json",
    "release/latest-android.json"
  ].forEach((archivo) => validarArchivo(archivo));

  validarContenido("scripts/build-windows.cjs", [
    "limpiarArtefactosWindowsPrevios",
    "latest.yml",
    "electron-builder",
    "validarArtefactos"
  ]);

  validarContenido("scripts/build-android.cjs", [
    "limpiarArtefactosAndroidPrevios",
    "latest-android.json",
    "FitJeff-Android",
    "preparado-sin-apk",
    "apk-generado"
  ]);

  validarContenido("scripts/release-github.cjs", [
    "listarArchivosPublicables",
    "archivoPerteneceVersion",
    "latest-android.json",
    "latest.yml",
    "gh"
  ]);

  validarContenido("electron/electron-updater.service.js", [
    "electron-updater",
    "app.isPackaged",
    "download-progress",
    "quitAndInstall"
  ]);
}

function revisarAndroid(pkg) {
  console.log("Revisando Android/APK...");

  const config = leerJsonSeguro(ANDROID_CONFIG_PATH, null);
  if (!config) {
    error("No se pudo leer android/update-config.json.");
    return;
  }

  if (config.packageId === "com.jeff.fitjeff") ok("Android packageId correcto: com.jeff.fitjeff");
  else error(`Android packageId inesperado: ${config.packageId}`);

  if (config.versionNameSameAsWindows === true && config.versionSource === "package.json") {
    ok("Android usa la versión de package.json");
  } else {
    error("Android debe usar la misma versión visible que Windows desde package.json.");
  }

  if (config.apkFilePattern === "FitJeff-Android-${version}.apk") ok("Patrón de APK correcto");
  else advertencia("El patrón de APK debería ser FitJeff-Android-${version}.apk.");

  const latestAndroid = leerJsonSeguro(LATEST_ANDROID_PATH, null);
  if (!latestAndroid) {
    if (modoAfterBuild) error("Falta release/latest-android.json después del build Android.");
    else advertencia("release/latest-android.json se generará al preparar Android.");
    return;
  }

  if (!pkg) return;

  if (latestAndroid.versionName === pkg.version) ok("latest-android.json coincide con la versión actual");
  else if (modoAfterBuild) error(`latest-android.json tiene versión ${latestAndroid.versionName}, se esperaba ${pkg.version}`);
  else advertencia(`latest-android.json no coincide todavía con package.json (${latestAndroid.versionName} vs ${pkg.version}).`);
}

function revisarGitignore() {
  console.log("Revisando .gitignore de release...");

  const gitignore = leerTexto(".gitignore");
  if (!gitignore) {
    error("Falta .gitignore.");
    return;
  }

  if (gitignore.includes("release/*")) ok("release/* está ignorado para no subir instaladores pesados");
  else error(".gitignore debe ignorar release/*.");

  if (gitignore.includes("!release/latest.json")) ok("release/latest.json está permitido");
  else error(".gitignore debe permitir !release/latest.json.");

  if (gitignore.includes("!release/latest-android.json")) ok("release/latest-android.json está permitido");
  else error(".gitignore debe permitir !release/latest-android.json.");
}

function revisarArtefactosRelease(pkg) {
  console.log("Revisando artefactos de release...");

  const archivos = listarRelease();
  const version = pkg?.version || "";
  const instaladores = archivos.filter((archivo) => nombre(archivo).toLowerCase().endsWith(".exe"));
  const apks = archivos.filter((archivo) => nombre(archivo).toLowerCase().endsWith(".apk"));
  const latestYml = archivos.find((archivo) => nombre(archivo).toLowerCase() === "latest.yml");
  const instaladoresActuales = instaladores.filter((archivo) => contieneVersion(archivo, version));
  const apksActuales = apks.filter((archivo) => contieneVersion(archivo, version));
  const stale = [...instaladores, ...apks].filter((archivo) => !contieneVersion(archivo, version));

  if (modoAfterBuild) {
    if (instaladoresActuales.length > 0) ok(`Instalador Windows actual detectado: ${nombre(instaladoresActuales[0])}`);
    else error(`No se encontró instalador Windows de la versión ${version}.`);

    if (latestYml) ok("latest.yml detectado para electron-updater");
    else error("Falta latest.yml después de compilar Windows.");

    if (fs.existsSync(LATEST_ANDROID_PATH)) ok("latest-android.json detectado");
    else error("Falta latest-android.json después de preparar Android.");

    if (stale.length) error(`Hay artefactos viejos que podrían publicarse: ${stale.map(nombre).join(", ")}`);
    else ok("No hay instaladores/APK viejos mezclados en release/.");

    if (apks.length && apksActuales.length === 0) error(`Hay APK, pero ninguna corresponde a ${version}.`);
    else if (apksActuales.length) ok(`APK actual detectada: ${nombre(apksActuales[0])}`);
    else ok("Android preparado sin APK real; no bloquea Windows.");
  } else {
    if (stale.length) advertencia(`Release contiene artefactos de otra versión: ${stale.map(nombre).join(", ")}. Se limpiarán al compilar.`);
    else ok("No se detectan artefactos viejos en release/.");
  }

  const latestJson = leerJsonSeguro(LATEST_JSON_PATH, null);
  if (latestJson?.repository === "jeffer91/ejer") ok("latest.json apunta al repositorio correcto");
  else advertencia("latest.json se regenerará al publicar release.");
}

function imprimirResumen() {
  console.log("\n========================================");
  console.log("FitJeff - Revisión final release");
  console.log("========================================");
  console.log(`Modo:          ${modoAfterBuild ? "after-build" : "preflight"}`);
  console.log(`Correctos:     ${resultado.ok.length}`);
  console.log(`Advertencias:  ${resultado.advertencias.length}`);
  console.log(`Errores:       ${resultado.errores.length}`);

  if (resultado.errores.length) {
    console.log("\nERRORES:");
    resultado.errores.forEach((item) => console.log(`- ${item}`));
  }

  if (resultado.advertencias.length) {
    console.log("\nADVERTENCIAS:");
    resultado.advertencias.forEach((item) => console.log(`- ${item}`));
  }

  console.log("\nCorrectos principales:");
  resultado.ok.slice(0, 35).forEach((item) => console.log(`- ${item}`));
  console.log("========================================");

  if (resultado.errores.length) {
    process.exit(1);
  }
}

try {
  const pkg = leerPackage();
  revisarPackage(pkg);
  revisarArchivosBase();
  revisarAndroid(pkg);
  revisarGitignore();
  revisarArtefactosRelease(pkg);
  imprimirResumen();
} catch (err) {
  console.error("[FitJeff] La revisión final de release falló inesperadamente.");
  console.error(err.message);
  process.exit(1);
}
