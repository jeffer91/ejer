/*
  Nombre completo: build-android.cjs
  Ruta o ubicación: scripts/build-android.cjs

  Función o funciones:
    - Preparar y generar la APK Android de FitJeff con la misma versión de Windows.
    - Crear automáticamente el proyecto Android de Capacitor si todavía no existe.
    - Mantener el proyecto nativo en android/native para no mezclarlo con documentos de configuración.
    - Sincronizar dist con Capacitor antes de compilar.
    - Limpiar APK/manifiestos Android anteriores antes de preparar la versión actual.
    - Generar manifiesto Android para actualización fuera de Play Store.
    - Compilar APK release si es posible y usar debug como respaldo instalable.

  Se conecta con:
    - package.json
    - capacitor.config.json
    - android/update-config.json
    - android/signing/README.md
    - release/latest-android.json
    - scripts/revision-release-final.cjs
    - scripts/publicar-version.bat
    - scripts/release-github.cjs
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const packagePath = path.join(rootDir, "package.json");
const androidMetaDir = path.join(rootDir, "android");
const releaseDir = path.join(rootDir, "release");
const capacitorConfigPath = path.join(rootDir, "capacitor.config.json");
const updateConfigPath = path.join(androidMetaDir, "update-config.json");
const latestAndroidPath = path.join(releaseDir, "latest-android.json");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function leerJson(ruta, fallback = null) {
  if (!fs.existsSync(ruta)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(ruta, "utf8"));
}

function escribirJson(ruta, data) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function requiereShellWindows(comando) {
  return process.platform === "win32" && /\.(bat|cmd)$/i.test(comando);
}

function ejecutar(comando, args, opciones = {}) {
  const resultado = spawnSync(comando, args, {
    cwd: opciones.cwd || rootDir,
    stdio: opciones.silencioso ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    shell: requiereShellWindows(comando)
  });

  if (resultado.error && opciones.fallar !== false) {
    throw new Error(`No se pudo ejecutar ${comando}: ${resultado.error.message}`);
  }

  if (resultado.status !== 0 && opciones.fallar !== false) {
    const detalle = resultado.stderr || resultado.stdout || "";
    throw new Error(`Falló el comando: ${comando} ${args.join(" ")}\n${detalle}`);
  }

  return resultado;
}

function leerCapacitorConfig() {
  return leerJson(capacitorConfigPath, null);
}

function resolverAndroidNativeDir(config = {}) {
  const capacitorConfig = leerCapacitorConfig() || {};
  const rutaConfigurada = config.androidNativePath || capacitorConfig.android?.path || "android/native";
  return path.resolve(rootDir, rutaConfigurada);
}

function existeProyectoAndroidNativo(config = {}) {
  const androidNativeDir = resolverAndroidNativeDir(config);
  return Boolean(
    fs.existsSync(path.join(androidNativeDir, "app", "build.gradle")) ||
    fs.existsSync(path.join(androidNativeDir, "app", "build.gradle.kts"))
  );
}

function existeCapacitorConfig() {
  return fs.existsSync(capacitorConfigPath);
}

function resolverGradleWrapper(config = {}) {
  const androidNativeDir = resolverAndroidNativeDir(config);
  const gradlewBat = path.join(androidNativeDir, "gradlew.bat");
  const gradlew = path.join(androidNativeDir, "gradlew");

  if (process.platform === "win32" && fs.existsSync(gradlewBat)) {
    return "gradlew.bat";
  }

  if (fs.existsSync(gradlew)) {
    return "./gradlew";
  }

  if (fs.existsSync(gradlewBat)) {
    return "gradlew.bat";
  }

  return null;
}

function limpiarArtefactosAndroidPrevios() {
  fs.mkdirSync(releaseDir, { recursive: true });

  const eliminados = [];
  fs.readdirSync(releaseDir).forEach((archivo) => {
    const lower = archivo.toLowerCase();
    const esAndroid = lower.startsWith("fitjeff-android-") && (lower.endsWith(".apk") || lower.endsWith(".aab"));
    const esManifest = lower === "latest-android.json";

    if (!esAndroid && !esManifest) return;

    fs.rmSync(path.join(releaseDir, archivo), { force: true });
    eliminados.push(archivo);
  });

  if (eliminados.length) {
    console.log("Artefactos Android anteriores eliminados:");
    eliminados.forEach((archivo) => console.log(`- ${archivo}`));
  }
}

function buscarApks(dir, encontrados = []) {
  if (!fs.existsSync(dir)) {
    return encontrados;
  }

  for (const item of fs.readdirSync(dir)) {
    const ruta = path.join(dir, item);
    const stat = fs.statSync(ruta);

    if (stat.isDirectory()) {
      buscarApks(ruta, encontrados);
    } else if (item.toLowerCase().endsWith(".apk")) {
      encontrados.push(ruta);
    }
  }

  return encontrados;
}

function copiarApkPublicable(pkg, config) {
  const androidNativeDir = resolverAndroidNativeDir(config);
  const outputsDir = path.join(androidNativeDir, "app", "build", "outputs", "apk");
  const apks = buscarApks(outputsDir).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (apks.length === 0) {
    return null;
  }

  fs.mkdirSync(releaseDir, { recursive: true });
  const destino = path.join(releaseDir, `FitJeff-Android-${pkg.version}.apk`);
  fs.copyFileSync(apks[0], destino);
  return destino;
}

function calcularVersionCode(version) {
  const partes = String(version || "0.0.1").split(".").map((parte) => Number(parte || 0));
  const major = Math.max(partes[0] || 0, 0);
  const minor = Math.max(partes[1] || 0, 0);
  const patch = Math.max(partes[2] || 0, 0);
  return major * 1000000 + minor * 1000 + patch || 1;
}

function crearManifestAndroid({ pkg, config, apkPath = null, estado = "preparado", mensaje = "APK pendiente de proyecto Android nativo." }) {
  const apkExiste = apkPath && fs.existsSync(apkPath);
  const payload = {
    app: "FitJeff",
    platform: "android",
    channel: config.channel || "stable",
    versionName: pkg.version,
    versionCode: calcularVersionCode(pkg.version),
    packageId: config.packageId || "com.jeff.fitjeff",
    repository: config.repository || "jeffer91/ejer",
    releaseProvider: config.releaseProvider || "github",
    installMode: "apk-fuera-de-play-store",
    userConfirmationRequired: true,
    status: estado,
    message: mensaje,
    generatedAt: new Date().toISOString(),
    apk: apkExiste ? {
      fileName: path.basename(apkPath),
      sizeBytes: fs.statSync(apkPath).size
    } : null
  };

  escribirJson(latestAndroidPath, payload);
  return payload;
}

function prepararSinProyectoAndroid(pkg, config, mensaje) {
  const manifest = crearManifestAndroid({
    pkg,
    config,
    estado: "preparado-sin-apk",
    mensaje: mensaje || "La configuración Android está preparada. Falta crear el proyecto Android/Capacitor para generar APK real."
  });

  console.log("----------------------------------------");
  console.log("Android preparado sin compilar APK.");
  console.log(`Manifiesto: ${latestAndroidPath}`);
  console.log(`Versión Android preparada: ${manifest.versionName}`);
  return manifest;
}

function asegurarProyectoAndroidCapacitor(pkg, config) {
  if (existeProyectoAndroidNativo(config)) {
    return true;
  }

  if (!existeCapacitorConfig()) {
    prepararSinProyectoAndroid(pkg, config, "Falta capacitor.config.json. No se puede crear el proyecto Android nativo automáticamente.");
    return false;
  }

  const androidNativeDir = resolverAndroidNativeDir(config);
  console.log("----------------------------------------");
  console.log("No existe proyecto Android nativo todavía.");
  console.log(`Creando proyecto Capacitor en: ${path.relative(rootDir, androidNativeDir)}`);

  ejecutar(npxCommand, ["cap", "add", "android"]);

  if (!existeProyectoAndroidNativo(config)) {
    throw new Error(`Capacitor no creó el proyecto Android esperado en ${androidNativeDir}. Revisa capacitor.config.json.`);
  }

  return true;
}

function sincronizarCapacitor(config) {
  if (!existeCapacitorConfig()) {
    return;
  }

  console.log("----------------------------------------");
  console.log("Sincronizando dist con Capacitor Android...");
  ejecutar(npxCommand, ["cap", "sync", "android"]);
}

function compilarAndroid(pkg, config) {
  if (!asegurarProyectoAndroidCapacitor(pkg, config)) {
    return null;
  }

  sincronizarCapacitor(config);

  const androidNativeDir = resolverAndroidNativeDir(config);
  const gradleWrapper = resolverGradleWrapper(config);

  if (!gradleWrapper) {
    throw new Error(`No se encontró gradlew/gradlew.bat dentro de ${androidNativeDir}. No se puede compilar APK todavía.`);
  }

  console.log("----------------------------------------");
  console.log("Compilando APK Android...");
  ejecutar(gradleWrapper, ["assembleRelease"], { cwd: androidNativeDir, fallar: false });

  let apkPath = copiarApkPublicable(pkg, config);

  if (!apkPath) {
    ejecutar(gradleWrapper, ["assembleDebug"], { cwd: androidNativeDir });
    apkPath = copiarApkPublicable(pkg, config);
  }

  if (!apkPath) {
    throw new Error("No se encontró APK generado en app/build/outputs/apk.");
  }

  const manifest = crearManifestAndroid({
    pkg,
    config,
    apkPath,
    estado: "apk-generado",
    mensaje: "APK generado y preparado para GitHub Releases."
  });

  console.log("----------------------------------------");
  console.log(`APK preparado: ${apkPath}`);
  console.log(`Manifiesto:    ${latestAndroidPath}`);
  console.log(`Versión:       ${manifest.versionName}`);
  return manifest;
}

function main() {
  const pkg = leerJson(packagePath);
  const config = leerJson(updateConfigPath, {});

  console.log("========================================");
  console.log("FitJeff - Preparar Android/APK");
  console.log("========================================");
  console.log(`Versión: ${pkg.version}`);
  console.log(`Paquete: ${config.packageId || "com.jeff.fitjeff"}`);
  console.log(`Proyecto nativo: ${path.relative(rootDir, resolverAndroidNativeDir(config))}`);

  limpiarArtefactosAndroidPrevios();
  compilarAndroid(pkg, config);

  console.log("========================================");
  console.log("Build Android completado.");
  console.log("========================================");
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] No se pudo preparar Android/APK.");
  console.error(error.message);
  process.exit(1);
}
