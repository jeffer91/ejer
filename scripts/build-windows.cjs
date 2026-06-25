/*
  Nombre completo: build-windows.cjs
  Ruta o ubicación: scripts/build-windows.cjs

  Función o funciones:
    - Compilar FitJeff para Windows con Vite y electron-builder.
    - Generar instalador NSIS y archivos de actualización en la carpeta release.
    - Validar que existan artefactos mínimos antes de publicar en GitHub Releases.
    - Mantener la compilación separada del script que crea releases.

  Se conecta con:
    - package.json
    - electron/main.js
    - electron/electron-updater.service.js
    - release/latest.json
    - scripts/release-github.cjs
    - scripts/publicar-version.bat
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const releaseDir = path.join(rootDir, "release");
const packagePath = path.join(rootDir, "package.json");

function ejecutar(comando, args) {
  const resultado = spawnSync(comando, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

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

function validarArtefactos() {
  const archivos = listarArchivosRelease();
  const tieneInstalador = archivos.some((archivo) => archivo.toLowerCase().endsWith(".exe"));
  const tieneMetadata = archivos.some((archivo) => archivo.toLowerCase() === "latest.yml");

  if (!tieneInstalador) {
    throw new Error("No se encontró instalador .exe en la carpeta release.");
  }

  if (!tieneMetadata) {
    throw new Error("No se encontró latest.yml en la carpeta release. El autoupdater lo necesita.");
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

  fs.mkdirSync(releaseDir, { recursive: true });

  ejecutar("npm", ["run", "build"]);
  ejecutar("npx", ["electron-builder", "--win", "nsis", "--publish", "never"]);

  const archivos = validarArtefactos();

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
