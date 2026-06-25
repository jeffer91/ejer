/*
  Nombre completo: release-github.cjs
  Ruta o ubicación: scripts/release-github.cjs

  Función o funciones:
    - Crear un GitHub Release estable usando GitHub CLI.
    - Publicar instalador Windows, latest.yml, blockmap y latest.json.
    - Generar un manifiesto local de versión para trazabilidad.
    - Evitar publicar dos veces la misma versión.

  Se conecta con:
    - package.json
    - release/latest.json
    - release/*.exe
    - release/latest.yml
    - scripts/build-windows.cjs
    - scripts/publicar-version.bat
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const releaseDir = path.join(rootDir, "release");
const packagePath = path.join(rootDir, "package.json");
const latestJsonPath = path.join(releaseDir, "latest.json");
const repo = "jeffer91/ejer";

function ejecutar(comando, args, opciones = {}) {
  const resultado = spawnSync(comando, args, {
    cwd: rootDir,
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

function leerPackage() {
  return JSON.parse(fs.readFileSync(packagePath, "utf8"));
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

function listarArchivosPublicables() {
  if (!fs.existsSync(releaseDir)) {
    return [];
  }

  const permitidos = new Set([".exe", ".yml", ".yaml", ".blockmap", ".json"]);

  return fs.readdirSync(releaseDir)
    .map((nombre) => path.join(releaseDir, nombre))
    .filter((ruta) => fs.statSync(ruta).isFile())
    .filter((ruta) => permitidos.has(path.extname(ruta).toLowerCase()))
    .filter((ruta) => path.basename(ruta).toLowerCase() !== "builder-debug.yml")
    .filter((ruta) => path.basename(ruta).toLowerCase() !== "builder-effective-config.yaml");
}

function validarArtefactos(archivos) {
  const tieneInstalador = archivos.some((archivo) => archivo.toLowerCase().endsWith(".exe"));
  const tieneLatestYml = archivos.some((archivo) => path.basename(archivo).toLowerCase() === "latest.yml");

  if (!tieneInstalador) {
    throw new Error("No se encontró instalador .exe para publicar.");
  }

  if (!tieneLatestYml) {
    throw new Error("No se encontró latest.yml para publicar. Es necesario para electron-updater.");
  }
}

function generarLatestJson({ pkg, tag, archivos }) {
  fs.mkdirSync(releaseDir, { recursive: true });

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
      enabled: false,
      note: "La publicación de APK se agregará en el bloque Android."
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

  return [
    `FitJeff ${tag}`,
    "",
    "Actualización estable generada automáticamente desde Visual Studio Code.",
    "",
    `Versión: ${pkg.version}`,
    "Canal: estable",
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

  let archivos = listarArchivosPublicables();
  validarArtefactos(archivos);

  const latestJson = generarLatestJson({ pkg, tag, archivos });
  archivos = [...archivos.filter((archivo) => archivo !== latestJson), latestJson];

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
