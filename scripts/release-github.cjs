/*
  Nombre completo: release-github.cjs
  Ruta o ubicación: scripts/release-github.cjs

  Función o funciones:
    - Crear un GitHub Release estable usando GitHub CLI.
    - Publicar solo artefactos de la versión actual.
    - Publicar instalador Windows, latest.yml, blockmap, APK si existe y manifiestos JSON.
    - Generar un manifiesto local de versión para trazabilidad.
    - Evitar publicar dos veces la misma versión.

  Se conecta con:
    - package.json
    - release/latest.json
    - release/latest-android.json
    - release/*.exe
    - release/*.apk
    - release/latest.yml
    - scripts/build-windows.cjs
    - scripts/build-android.cjs
    - scripts/revision-release-final.cjs
    - scripts/publicar-version.bat
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const releaseDir = path.join(rootDir, "release");
const packagePath = path.join(rootDir, "package.json");
const latestJsonPath = path.join(releaseDir, "latest.json");
const latestAndroidPath = path.join(releaseDir, "latest-android.json");
const repo = "jeffer91/ejer";

function comandoLocal(comando) {
  if (process.platform !== "win32") return comando;
  if (["gh", "git", "npm", "npx"].includes(comando)) return `${comando}.cmd`;
  return comando;
}

function ejecutar(comando, args, opciones = {}) {
  const resultado = spawnSync(comandoLocal(comando), args, {
    cwd: rootDir,
    stdio: opciones.silencioso ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    shell: false
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

function leerPackage() {
  return JSON.parse(fs.readFileSync(packagePath, "utf8"));
}

function leerJsonOpcional(ruta, fallback = null) {
  if (!fs.existsSync(ruta)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(ruta, "utf8"));
}

function existeGh() {
  const resultado = ejecutar("gh", ["--version"], { silencioso: true, fallar: false });
  return resultado.status === 0;
}

function validarAutenticacionGh() {
  const resultado = ejecutar("gh", ["auth", "status"], { silencioso: true, fallar: false });

  if (resultado.status !== 0) {
    throw new Error("GitHub CLI no está autenticado. Ejecuta: gh auth login");
  }
}

function releaseExiste(tag) {
  const resultado = ejecutar("gh", ["release", "view", tag, "--repo", repo], {
    silencioso: true,
    fallar: false
  });

  return resultado.status === 0;
}

function archivoPerteneceVersion(ruta, pkg) {
  const base = path.basename(ruta).toLowerCase();
  const ext = path.extname(ruta).toLowerCase();
  const version = String(pkg.version || "").toLowerCase();

  if ([".exe", ".apk", ".aab", ".blockmap"].includes(ext)) {
    return base.includes(version);
  }

  return ["latest.yml", "latest.yaml", "latest.json", "latest-android.json"].includes(base);
}

function listarArchivosPublicables(pkg) {
  if (!fs.existsSync(releaseDir)) {
    return [];
  }

  const permitidos = new Set([".exe", ".apk", ".aab", ".yml", ".yaml", ".blockmap", ".json"]);

  return fs.readdirSync(releaseDir)
    .map((nombre) => path.join(releaseDir, nombre))
    .filter((ruta) => fs.statSync(ruta).isFile())
    .filter((ruta) => permitidos.has(path.extname(ruta).toLowerCase()))
    .filter((ruta) => path.basename(ruta).toLowerCase() !== "builder-debug.yml")
    .filter((ruta) => path.basename(ruta).toLowerCase() !== "builder-effective-config.yaml")
    .filter((ruta) => archivoPerteneceVersion(ruta, pkg));
}

function validarArtefactos(archivos, pkg) {
  const version = String(pkg.version || "");
  const tieneInstalador = archivos.some((archivo) => {
    return archivo.toLowerCase().endsWith(".exe") && path.basename(archivo).includes(version);
  });
  const tieneLatestYml = archivos.some((archivo) => path.basename(archivo).toLowerCase() === "latest.yml");

  if (!tieneInstalador) {
    throw new Error(`No se encontró instalador .exe de la versión ${version} para publicar.`);
  }

  if (!tieneLatestYml) {
    throw new Error("No se encontró latest.yml para publicar. Es necesario para electron-updater.");
  }
}

function obtenerInfoAndroid(pkg) {
  const manifest = leerJsonOpcional(latestAndroidPath, null);
  const apk = listarArchivosPublicables(pkg).find((archivo) => archivo.toLowerCase().endsWith(".apk"));

  return {
    enabled: Boolean(apk),
    manifest,
    apkFileName: apk ? path.basename(apk) : "",
    note: apk ? "APK incluida en este release." : "Android preparado sin APK real todavía."
  };
}

function generarLatestJson({ pkg, tag, archivos }) {
  fs.mkdirSync(releaseDir, { recursive: true });

  const android = obtenerInfoAndroid(pkg);

  const payload = {
    app: "FitJeff",
    repository: repo,
    channel: "stable",
    version: pkg.version,
    tag,
    generatedAt: new Date().toISOString(),
    windows: {
      enabled: true,
      provider: "github",
      owner: "jeffer91",
      repo: "ejer"
    },
    android: {
      enabled: android.enabled,
      apkFileName: android.apkFileName,
      manifestFile: fs.existsSync(latestAndroidPath) ? "latest-android.json" : "",
      note: android.note
    },
    files: archivos.map((archivo) => ({
      name: path.basename(archivo),
      sizeBytes: fs.statSync(archivo).size
    }))
  };

  fs.writeFileSync(latestJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return latestJsonPath;
}

function crearNotasRelease(pkg, tag, archivos) {
  const lista = archivos.map((archivo) => `- ${path.basename(archivo)}`).join("\n");
  const incluyeApk = archivos.some((archivo) => archivo.toLowerCase().endsWith(".apk"));

  return [
    `FitJeff ${tag}`,
    "",
    "Actualización estable generada automáticamente desde Visual Studio Code.",
    "",
    `Versión: ${pkg.version}`,
    "Canal: estable",
    "Windows: incluido",
    `Android/APK: ${incluyeApk ? "incluido" : "preparado sin APK real"}`,
    "",
    "Archivos publicados:",
    lista
  ].join("\n");
}

function main() {
  const pkg = leerPackage();
  const tag = `v${pkg.version}`;

  console.log("========================================");
  console.log("FitJeff - Publicar GitHub Release");
  console.log("========================================");
  console.log(`Repositorio: ${repo}`);
  console.log(`Tag:         ${tag}`);
  console.log("----------------------------------------");

  if (!existeGh()) {
    throw new Error("GitHub CLI no está instalado. Instálalo y ejecuta: gh auth login");
  }

  validarAutenticacionGh();

  if (releaseExiste(tag)) {
    throw new Error(`Ya existe un release con el tag ${tag}. Sube la versión antes de publicar.`);
  }

  let archivos = listarArchivosPublicables(pkg);
  validarArtefactos(archivos, pkg);

  const latestJson = generarLatestJson({ pkg, tag, archivos });
  archivos = listarArchivosPublicables(pkg);
  if (!archivos.includes(latestJson)) archivos.push(latestJson);
  archivos = [...new Set(archivos)];

  const notas = crearNotasRelease(pkg, tag, archivos);

  ejecutar("gh", [
    "release",
    "create",
    tag,
    "--repo",
    repo,
    "--target",
    "main",
    "--title",
    `FitJeff ${tag}`,
    "--notes",
    notas,
    "--latest",
    ...archivos
  ]);

  console.log("========================================");
  console.log(`Release publicado: ${tag}`);
  console.log("========================================");
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] No se pudo publicar el release.");
  console.error(error.message);
  process.exit(1);
}
