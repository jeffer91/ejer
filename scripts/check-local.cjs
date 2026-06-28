/*
  Nombre completo: check-local.cjs
  Ruta o ubicacion: scripts/check-local.cjs

  Funcion o funciones:
    - Ejecutar una revision local completa antes de abrir la app.
    - Revisar herramientas, estructura modular, auditoria estatica y build de Vite.
    - Detenerse en el primer error para que sea facil copiar la consola.
    - Servir como punto de prueba despues de cada bloque grande.

  Se conecta con:
    - package.json
    - scripts/check-tools.cjs
    - scripts/check-structure.cjs
    - scripts/auditar-app.cjs
    - vite build
*/

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const pasos = [
  {
    nombre: "Herramientas base",
    comando: "node",
    args: ["scripts/check-tools.cjs"],
    requerido: true
  },
  {
    nombre: "Estructura modular",
    comando: "node",
    args: ["scripts/check-structure.cjs"],
    requerido: true
  },
  {
    nombre: "Auditoría estática",
    comando: "node",
    args: ["scripts/auditar-app.cjs"],
    requerido: true
  },
  {
    nombre: "Build de Vite",
    comando: npmCommand,
    args: ["run", "build", "--", "--clearScreen", "false"],
    requerido: true
  }
];

function existeScript(args) {
  const archivo = args.find((arg) => String(arg).startsWith("scripts/"));
  return !archivo || fs.existsSync(path.join(ROOT, archivo));
}

function ejecutarPaso(paso, indice) {
  console.log(`\n[${indice + 1}/${pasos.length}] ${paso.nombre}`);
  console.log(`> ${paso.comando} ${paso.args.join(" ")}`);

  if (!existeScript(paso.args)) {
    const mensaje = `No existe el archivo requerido para este paso: ${paso.args.join(" ")}`;

    if (paso.requerido) {
      console.error(mensaje);
      return false;
    }

    console.warn(`${mensaje}. Paso omitido.`);
    return true;
  }

  const resultado = spawnSync(paso.comando, paso.args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: false
  });

  if (resultado.error) {
    console.error(`Error ejecutando ${paso.nombre}: ${resultado.error.message}`);
    return false;
  }

  if (resultado.status !== 0) {
    console.error(`Fallo en ${paso.nombre}. Copia la consola desde este punto para corregir el error.`);
    return false;
  }

  console.log(`${paso.nombre}: OK`);
  return true;
}

function run() {
  console.log("Revision local FitJeff");
  console.log("Objetivo: detectar errores reales antes de abrir Electron o seguir programando.");

  for (let i = 0; i < pasos.length; i += 1) {
    const ok = ejecutarPaso(pasos[i], i);

    if (!ok) {
      process.exitCode = 1;
      return;
    }
  }

  console.log("\nRevision local OK.");
  console.log("Puedes ejecutar npm start, npm run dev o npm run electron:dev.");
}

run();
