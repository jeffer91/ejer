/*
  Nombre completo: start-electron-dev.cjs
  Ruta o ubicación: scripts/start-electron-dev.cjs

  Función o funciones:
    - Abrir FitJeff con npm start sin fallar cuando el puerto 5173 está ocupado.
    - Buscar automáticamente un puerto libre para Vite.
    - Pasar a Electron la URL real del servidor de desarrollo.
    - Mantener el flujo de desarrollo separado del instalador de producción.

  Se conecta con:
    - package.json
    - electron/electron-path.service.js
    - electron/main.js
*/

const net = require("node:net");
const { spawn } = require("node:child_process");

const HOST = "localhost";
const PUERTO_BASE = Number(process.env.FITJEFF_DEV_PORT || 5173);
const PUERTO_MAXIMO = PUERTO_BASE + 30;
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function puertoDisponible(puerto) {
  return new Promise((resolve) => {
    const servidor = net.createServer();

    servidor.once("error", () => resolve(false));
    servidor.once("listening", () => {
      servidor.close(() => resolve(true));
    });

    servidor.listen(puerto, HOST);
  });
}

async function encontrarPuertoDisponible() {
  for (let puerto = PUERTO_BASE; puerto <= PUERTO_MAXIMO; puerto += 1) {
    // eslint-disable-next-line no-await-in-loop
    const disponible = await puertoDisponible(puerto);
    if (disponible) return puerto;
  }

  throw new Error(`No se encontró puerto libre entre ${PUERTO_BASE} y ${PUERTO_MAXIMO}.`);
}

function crearComandoVite(puerto) {
  return `vite --host ${HOST} --port ${puerto} --strictPort`;
}

function crearComandoElectron(url) {
  return `wait-on ${url} && cross-env FITJEFF_ELECTRON_DEV=1 FITJEFF_DEV_SERVER_URL=${url} electron .`;
}

async function main() {
  const puerto = await encontrarPuertoDisponible();
  const url = `http://${HOST}:${puerto}/`;

  console.log("========================================");
  console.log("FitJeff - npm start seguro");
  console.log("========================================");
  console.log(puerto === PUERTO_BASE ? `Puerto listo: ${puerto}` : `Puerto ${PUERTO_BASE} ocupado. Usando puerto libre: ${puerto}`);
  console.log(`URL de desarrollo: ${url}`);
  console.log("----------------------------------------");

  const proceso = spawn(npxCommand, [
    "concurrently",
    "-k",
    "-n",
    "VITE,ELECTRON",
    "-c",
    "green,blue",
    crearComandoVite(puerto),
    crearComandoElectron(url)
  ], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false
  });

  proceso.on("exit", (codigo) => {
    process.exitCode = codigo || 0;
  });

  proceso.on("error", (error) => {
    console.error("[FitJeff] No se pudo iniciar npm start seguro.");
    console.error(error.message);
    process.exitCode = 1;
  });
}

main().catch((error) => {
  console.error("[FitJeff] npm start no pudo abrir la app.");
  console.error(error.message);
  process.exitCode = 1;
});
