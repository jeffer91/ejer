/*
  Nombre completo: fitjeff-release-check.mjs
  Ruta o ubicación: scripts/fitjeff-release-check.mjs

  Función:
    - Revisar archivos críticos antes de publicar FitJeff.
    - Validar JSON de package, manifest, Firebase y versión.
    - Confirmar que el service worker y version.json tengan el mismo build.

  Se conecta con:
    - package.json
    - public/manifest.json
    - public/version.json
    - service-worker.js
    - firebase.json
*/

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const ARCHIVOS_OBLIGATORIOS = [
  "index.html",
  "package.json",
  "firebase.json",
  "firestore.rules",
  "service-worker.js",
  "public/manifest.json",
  "public/version.json",
  "src/app.js",
  "src/app-controller.js",
  "src/ui/router.js",
  "src/ui/menu.js",
  "src/vistas/inicio.view.js",
  "src/vistas/entrenar.view.js",
  "src/vistas/entrenamiento-guiado.view.js",
  "src/vistas/rutinas.view.js",
  "src/vistas/medidas.view.js",
  "src/vistas/reportes.view.js",
  "src/vistas/diagnostico.view.js",
  "src/vistas/jarvis.view.js",
  "src/diagnostico/diagnostico.completo.service.js",
  "functions/index.js",
  "functions/jarvis.service.js"
];

const JSON_OBLIGATORIOS = [
  "package.json",
  "firebase.json",
  "public/manifest.json",
  "public/version.json",
  "functions/package.json"
];

const resultados = [];

main();

function main() {
  revisarArchivos();
  revisarJSON();
  revisarBuild();
  revisarServiceWorker();
  imprimirResultado();

  const hayError = resultados.some((item) => item.nivel === "error");
  process.exit(hayError ? 1 : 0);
}

function revisarArchivos() {
  ARCHIVOS_OBLIGATORIOS.forEach((archivo) => {
    const existe = fs.existsSync(path.join(ROOT, archivo));

    resultados.push({
      nivel: existe ? "ok" : "error",
      area: "archivo",
      archivo,
      mensaje: existe ? "Existe." : "No existe."
    });
  });
}

function revisarJSON() {
  JSON_OBLIGATORIOS.forEach((archivo) => {
    const ruta = path.join(ROOT, archivo);

    if (!fs.existsSync(ruta)) {
      resultados.push({
        nivel: "error",
        area: "json",
        archivo,
        mensaje: "No existe."
      });
      return;
    }

    try {
      JSON.parse(fs.readFileSync(ruta, "utf8"));
      resultados.push({
        nivel: "ok",
        area: "json",
        archivo,
        mensaje: "JSON válido."
      });
    } catch (error) {
      resultados.push({
        nivel: "error",
        area: "json",
        archivo,
        mensaje: error.message
      });
    }
  });
}

function revisarBuild() {
  try {
    const version = JSON.parse(fs.readFileSync(path.join(ROOT, "public/version.json"), "utf8"));
    const sw = fs.readFileSync(path.join(ROOT, "service-worker.js"), "utf8");
    const buildVersion = Number(version.build);
    const buildSW = extraerBuildServiceWorker(sw);

    resultados.push({
      nivel: buildVersion === buildSW ? "ok" : "warning",
      area: "build",
      archivo: "public/version.json + service-worker.js",
      mensaje: buildVersion === buildSW
        ? `Build sincronizado: ${buildVersion}.`
        : `Build diferente. version.json=${buildVersion}, service-worker=${buildSW}.`
    });
  } catch (error) {
    resultados.push({
      nivel: "error",
      area: "build",
      archivo: "public/version.json + service-worker.js",
      mensaje: error.message
    });
  }
}

function revisarServiceWorker() {
  const contenido = fs.readFileSync(path.join(ROOT, "service-worker.js"), "utf8");
  const rutasNecesarias = [
    "./src/vistas/diagnostico.view.js",
    "./src/vistas/reportes.view.js",
    "./src/vistas/medidas.view.js",
    "./src/vistas/rutinas.view.js",
    "./src/jarvis/jarvis.inteligente.service.js"
  ];

  rutasNecesarias.forEach((ruta) => {
    const existe = contenido.includes(ruta);

    resultados.push({
      nivel: existe ? "ok" : "warning",
      area: "service-worker",
      archivo: ruta,
      mensaje: existe ? "Incluido en caché." : "No está incluido en caché."
    });
  });
}

function extraerBuildServiceWorker(contenido) {
  const match = contenido.match(/build-(\d+)/);
  return match ? Number(match[1]) : null;
}

function imprimirResultado() {
  const resumen = {
    total: resultados.length,
    ok: resultados.filter((item) => item.nivel === "ok").length,
    warning: resultados.filter((item) => item.nivel === "warning").length,
    error: resultados.filter((item) => item.nivel === "error").length
  };

  console.log("\nFITJEFF RELEASE CHECK");
  console.log("=====================");
  console.log(resumen);

  resultados.forEach((item) => {
    const marca = item.nivel === "ok" ? "OK" : item.nivel === "warning" ? "WARN" : "ERROR";
    console.log(`[${marca}] ${item.area} :: ${item.archivo} :: ${item.mensaje}`);
  });

  console.log("");
}
