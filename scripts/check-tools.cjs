/*
  Nombre completo: check-tools.cjs
  Ruta o ubicación: scripts/check-tools.cjs

  Función o funciones:
    - Revisar herramientas necesarias para desarrollo y publicación de FitJeff.
    - Validar Node.js, npm, Git y GitHub CLI.
    - Confirmar que package.json tenga los scripts base de Electron y publicación.
    - Avisar claramente qué falta antes de compilar o publicar.

  Se conecta con:
    - package.json
    - scripts/abrir-electron-dev.bat
    - scripts/build-windows.cjs
    - scripts/release-github.cjs
    - scripts/publicar-version.bat
    - scripts/actualizar-todo.bat
*/

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const packagePath = path.join(rootDir, "package.json");

function ejecutar(comando) {
  return execSync(comando, {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8"
  }).trim();
}

function revisarComando(nombre, comando, requerido = true) {
  try {
    const salida = ejecutar(comando);
    return {
      nombre,
      requerido,
      ok: true,
      detalle: salida.split("\n")[0]
    };
  } catch {
    return {
      nombre,
      requerido,
      ok: false,
      detalle: requerido ? "FALTA" : "Opcional no configurado"
    };
  }
}

function revisarPackage() {
  if (!fs.existsSync(packagePath)) {
    return {
      ok: false,
      errores: ["No se encontró package.json en la raíz del proyecto."]
    };
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const scripts = pkg.scripts || {};
  const scriptsNecesarios = [
    "dev",
    "build",
    "electron:dev",
    "electron:build",
    "desktop:win",
    "version:bump",
    "tools:check",
    "build:windows",
    "release:github",
    "publicar:version",
    "actualizar:todo"
  ];
  const faltantes = scriptsNecesarios.filter((script) => !scripts[script]);

  return {
    ok: faltantes.length === 0,
    errores: faltantes.map((script) => `Falta script npm: ${script}`),
    version: pkg.version || "sin-version"
  };
}

function imprimirResultado(resultado) {
  const marca = resultado.ok ? "OK" : resultado.requerido ? "ERROR" : "AVISO";
  console.log(`${marca.padEnd(6)} ${resultado.nombre.padEnd(18)} ${resultado.detalle}`);
}

function main() {
  console.log("========================================");
  console.log("FitJeff - Revisión de herramientas");
  console.log("========================================");

  const resultados = [
    revisarComando("Node.js", "node --version", true),
    revisarComando("npm", "npm --version", true),
    revisarComando("Git", "git --version", true),
    revisarComando("GitHub CLI", "gh --version", false)
  ];

  resultados.forEach(imprimirResultado);

  const packageResultado = revisarPackage();
  console.log("----------------------------------------");

  if (packageResultado.ok) {
    console.log(`OK     package.json       versión ${packageResultado.version}`);
  } else {
    console.log("ERROR  package.json       incompleto");
    packageResultado.errores.forEach((error) => console.log(`       - ${error}`));
  }

  const erroresCriticos = resultados.filter((resultado) => resultado.requerido && !resultado.ok).length;

  console.log("========================================");

  if (erroresCriticos > 0 || !packageResultado.ok) {
    console.log("Resultado: faltan herramientas o scripts obligatorios.");
    process.exit(1);
  }

  console.log("Resultado: herramientas principales listas.");

  if (!resultados.find((resultado) => resultado.nombre === "GitHub CLI")?.ok) {
    console.log("Aviso: GitHub CLI será necesario para crear releases automáticos.");
    console.log("Instalación recomendada: winget install GitHub.cli");
    console.log("Después ejecuta: gh auth login");
  }
}

try {
  main();
} catch (error) {
  console.error("[FitJeff] No se pudo revisar el entorno.");
  console.error(error.message);
  process.exit(1);
}
