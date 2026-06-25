/*
  Nombre completo: build-android.cjs
  Ruta o ubicación: scripts/build-android.cjs

  Función o funciones:
    - Preparar la publicación Android/APK de FitJeff con la misma versión de Windows.
    - Generar manifiesto Android para actualización fuera de Play Store.
    - Detectar si ya existe proyecto Android/Capacitor y compilar APK cuando esté disponible.
    - No bloquear la publicación Windows mientras el proyecto Android nativo aún no exista.

  Se conecta con:
    - package.json
    - android/update-config.json
    - android/signing/README.md
    - release/latest-android.json
    - scripts/publicar-version.bat
    - scripts/release-github.cjs
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const packagePath = path.join(rootDir, "package.json");
const androidDir = path.join(rootDir, "android");
const releaseDir = path.join(rootDir, "release");
const updateConfigPath = path.join(androidDir, "update-config.json");
const latestAndroidPath = path.join(releaseDir, "latest-android.json");

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

function ejecutar(comando, args, opciones = {}) {
  const resultado = spawnSync(comando, args, {
    cwd: opciones.cwd || rootDir,
    stdio: opciones.silencioso ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    shell: process.platform === "win32"
  });

  if (resultado.status !== 0 && opciones.fallar !== false) {
    const detalle = resultado.stderr || resultado.stdout || "";
    throw new Error(`Falló el comando: ${comando} ${args.join(" ")}\n${detalle}`);
  }

  return resultado;
}

function existeProyectoAndroidNativo() {
  return Boolean(
    fs.existsSync(path.join(androidDir, "app", "build.gradle")) ||
    fs.existsSync(path.join(androidDir, "app", "build.gradle.kts"))
  );
}

function existeCapacitorConfig() {
  return Boolean(
    fs.existsSync(path.join(rootDir, "capacitor.config.json")) ||
    fs.existsSync(path.join(rootDir, "capacitor.config.ts")) ||
    fs.existsSync(path.join(rootDir, "capacitor.config.js"))
  );
}

function resolverGradleWrapper() {
  const gradlewBat = path.join(androidDir, "gradlew.bat");
  const gradlew = path.join(androidDir, "gradlew");

  if (process.platform === "win32" && fs.existsSync(gradlewBat)) {
    return "gradlew.bat";
  }

  if (fs.existsSync(gradlew)) {
    return "./gradlew";
  }

  return null;
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

function copiarApkPublicable(pkg) {
  const outputsDir = path.join(androidDir, "app", "build", "outputs", "apk");
  const apks = buscarApks(outputsDir).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (apks.length === 0) {
    return null;
  }

  fs.mkdirSync(releaseDir, { recursive: true });
  const destino = path.join(releaseDir, `FitJeff-Android-${pkg.version}.apk`);
  fs.copyFileSync(apks[0], destino);
  return destino;
}

function crearManifestAndroid({ pkg, config, apkPath = null, estado = "preparado", mensaje = "APK pendiente de proyecto Android nativo." }) {
  const apkExiste = apkPath && fs.existsSync(apkPath);
  const payload = {
    app: "FitJeff",
    platform: "android",
    channel: "stable",
    versionName: pkg.version,
    versionCode: Number(String(pkg.version).split(".").reduce((acc, parte) => `${acc}${String(parte).padStart(3, "0")}`, "")) || 1,
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

function prepararSinProyectoAndroid(pkg, config) {
  const manifest = crearManifestAndroid({
    pkg,
    config,
    estado: "preparado-sin-apk",
    mensaje: "La configuración Android está preparada. Falta crear el proyecto Android/Capacitor para generar APK real."
  });

  console.log("----------------------------------------");
  console.log("Android preparado sin compilar APK.");
  console.log("Motivo: todavía no existe proyecto Android nativo en android/app.");
  console.log(`Manifiesto: ${latestAndroidPath}`);
  console.log(`Versión Android preparada: ${manifest.versionName}`);
  return manifest;
}

function compilarAndroid(pkg, config) {
  if (existeCapacitorConfig()) {
    ejecutar("npx", ["cap", "sync", "android"]);
  }

  const gradleWrapper = resolverGradleWrapper();

  if (!gradleWrapper) {
    throw new Error("No se encontró gradlew/gradlew.bat dentro de android. No se puede compilar APK todavía.");
  }

  ejecutar(gradleWrapper, ["assembleRelease"], { cwd: androidDir, fallar: false });

  let apkPath = copiarApkPublicable(pkg);

  if (!apkPath) {
    ejecutar(gradleWrapper, ["assembleDebug"], { cwd: androidDir });
    apkPath = copiarApkPublicable(pkg);
  }

  if (!apkPath) {
    throw new Error("No se encontró APK generado en android/app/build/outputs/apk.");
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

  fs.mkdirSync(releaseDir, { recursive: true });

  if (!existeProyectoAndroidNativo()) {
    prepararSinProyectoAndroid(pkg, config);
    console.log("========================================");
    console.log("Preparación Android completada sin APK real.");
    console.log("========================================");
    return;
  }

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
