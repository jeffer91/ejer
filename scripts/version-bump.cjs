/*
  Nombre completo: version-bump.cjs
  Ruta o ubicación: scripts/version-bump.cjs

  Función o funciones:
    - Aumentar automáticamente la versión pequeña de FitJeff.
    - Actualizar package.json y package-lock.json si existe.
    - Mantener una sola fuente principal de versión para Electron, PWA y futura APK.
    - Preparar el flujo para publicación automática en GitHub Releases.

  Se conecta con:
    - package.json
    - package-lock.json
    - src/core/config/app.config.js
    - scripts/publicar-version.bat
    - scripts/actualizar-todo.bat
*/

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const packagePath = path.join(rootDir, "package.json");
const packageLockPath = path.join(rootDir, "package-lock.json");

function leerJson(ruta) {
  return JSON.parse(fs.readFileSync(ruta, "utf8"));
}

function escribirJson(ruta, data) {
  fs.writeFileSync(ruta, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function validarVersion(version) {
  const partes = String(version || "").split(".").map((parte) => Number(parte));

  if (partes.length !== 3 || partes.some((parte) => !Number.isInteger(parte) || parte < 0)) {
    throw new Error(`Versión inválida: ${version}`);
  }

  return partes;
}

function aumentarPatch(versionActual) {
  const [major, minor, patch] = validarVersion(versionActual);
  return `${major}.${minor}.${patch + 1}`;
}

function actualizarPackageLock(nuevaVersion) {
  if (!fs.existsSync(packageLockPath)) {
    return false;
  }

  const lock = leerJson(packageLockPath);
  lock.version = nuevaVersion;

  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = nuevaVersion;
  }

  escribirJson(packageLockPath, lock);
  return true;
}

function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error("No se encontró package.json en la raíz del proyecto.");
  }

  const pkg = leerJson(packagePath);
  const versionAnterior = pkg.version || "0.1.0";
  const nuevaVersion = aumentarPatch(versionAnterior);

  pkg.version = nuevaVersion;
  escribirJson(packagePath, pkg);

  const lockActualizado = actualizarPackageLock(nuevaVersion);

  console.log("========================================");
  console.log("FitJeff - Versión actualizada");
  console.log("========================================");
  console.log(`Versión anterior: ${versionAnterior}`);
  console.log(`Nueva versión:    ${nuevaVersion}`);
  console.log(`package-lock:     ${lockActualizado ? "actualizado" : "no existe / omitido"}`);
  console.log("========================================");
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] No se pudo actualizar la versión.");
  console.error(error.message);
  process.exit(1);
}
