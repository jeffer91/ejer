/*
  Nombre completo: build-windows.cjs
  Ruta o ubicación: scripts/build-windows.cjs

  Función o funciones:
    - Compilar FitJeff para Windows con Vite y electron-builder.
    - Limpiar artefactos Windows antiguos antes de compilar.
    - Generar instalador NSIS y latest.yml en la carpeta release.
    - Validar que el instalador generado corresponda a la versión actual.
    - Mantener la compilación separada del script que crea releases.

  Se conecta con:
    - package.json
    - electron/main.js
    - electron/electron-updater.service.js
    - release/latest.yml
    - scripts/revision-release-final.cjs
    - scripts/release-github.cjs
    - scripts/publicar-version.bat
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const releaseDir = path.join(rootDir, "release");
const packagePath = path.join(rootDir, "package.json");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function ejecutar(comando, args) {
  const resultado = spawnSync(comando, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false
  });

  if (resultado.error) {
    throw new Error(`No se pudo ejecutar ${comando}: ${resultado.error.message}`);
  }

  if (resultado.status !== 0) {
    throw new Error(`Falló el comando: ${comando} ${args.join(" ")}`);
  }
}

function leerPackage() {
  return JSON.parse(fs.readFileSync(packagePath, "utf8"));
}

function listarArchivosRelease() {
  if (!fs.existsSync(releaseDir)) {
    return [];
  }

  return fs.readdirSync(releaseDir).filter((nombre) => {
    const ruta = path.join(releaseDir, nombre);
    return fs.statSync(ruta).isFile();
  });
}

function limpiarArtefactosWindowsPrevios() {
  fs.mkdirSync(releaseDir, { recursive: true });

  const extensionesWindows = new Set([".exe", ".blockmap", ".yml", ".yaml"]);
  const eliminados = [];

  listarArchivosRelease().forEach((archivo) => {
    const extension = path.extname(archivo).toLowerCase();
    const nombre = archivo.toLowerCase();
    const esArtefactoWindows = extensionesWindows.has(extension) || nombre === "builder-debug.yml" || nombre === "builder-effective-config.yaml";

    if (!esArtefactoWindows) return;

    fs.rmSync(path.join(releaseDir, archivo), { force: true });
    eliminados.push(archivo);
  });

  if (eliminados.length) {
    console.log("Artefactos Windows anteriores eliminados:");
    eliminados.forEach((archivo) => console.log(`- ${archivo}`));
  }
}

function validarArtefactos(pkg) {
  const archivos = listarArchivosRelease();
  const version = String(pkg.version || "");
  const instaladores = archivos.filter((archivo) => archivo.toLowerCase().endsWith(".exe"));
  const instaladorActual = instaladores.find((archivo) => archivo.includes(version));
  const tieneMetadata = archivos.some((archivo) => archivo.toLowerCase() === "latest.yml");
  const instaladoresViejos = instaladores.filter((archivo) => !archivo.includes(version));

  if (!instaladorActual) {
    throw new Error(`No se encontró instalador .exe de la versión actual ${version} en la carpeta release.`);
  }

  if (!tieneMetadata) {
    throw new Error("No se encontró latest.yml en la carpeta release. El autoupdater lo necesita.");
  }

  if (instaladoresViejos.length) {
    throw new Error(`Hay instaladores viejos mezclados en release: ${instaladoresViejos.join(", ")}`);
  }

  return archivos;
}

function main() {
  const pkg = leerPackage();

  console.log("========================================");
  console.log("FitJeff - Build Windows");
  console.log("========================================");
  console.log(`Versión: ${pkg.version}`);
  console.log(`Salida:  ${releaseDir}`);
  console.log("----------------------------------------");

  limpiarArtefactosWindowsPrevios();

  ejecutar(npmCommand, ["run", "build"]);
  ejecutar(npxCommand, ["electron-builder", "--win", "nsis", "--publish", "never"]);

  const archivos = validarArtefactos(pkg);

  console.log("----------------------------------------");
  console.log("Artefactos Windows detectados:");
  archivos.forEach((archivo) => console.log(`- ${archivo}`));
  console.log("========================================");
  console.log("Build Windows completado.");
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] No se pudo compilar Windows.");
  console.error(error.message);
  process.exit(1);
}
