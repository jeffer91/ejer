/*
  Nombre completo: fitjeff-release-check.mjs
  Ruta o ubicación: scripts/fitjeff-release-check.mjs

  Función:
    - Revisar archivos críticos antes de publicar FitJeff.
    - Validar JSON de package, manifest, Firebase y versión.
    - Confirmar que el service worker y version.json tengan el mismo build.
    - Confirmar rutas nuevas del rediseño y estructura Firestore fitjeff/jeff.
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
  "public/fit-redesign.css",
  "src/app.js",
  "src/app-controller.js",
  "src/ui/router.js",
  "src/ui/menu.js",
  "src/ui/layout.js",
  "src/vistas/inicio.view.js",
  "src/vistas/entrenar.view.js",
  "src/vistas/registrar.view.js",
  "src/vistas/progreso.view.js",
  "src/vistas/asistente.view.js",
  "src/vistas/ajustes.view.js",
  "src/vistas/entrenamiento-guiado.view.js",
  "src/vistas/rutinas.view.js",
  "src/vistas/medidas.view.js",
  "src/vistas/reportes.view.js",
  "src/vistas/diagnostico.view.js",
  "src/vistas/jarvis.view.js",
  "src/automatizacion/fitjeff-hoy.service.js",
  "src/automatizacion/hoy-acciones.service.js",
  "src/automatizacion/hoy-pendientes.service.js",
  "src/firebase/firebase.config.js",
  "src/firebase/firebase.app.js",
  "src/firebase/firestore.paths.js",
  "src/firebase/firestore.schema.js",
  "src/firebase/firestore.service.js",
  "src/sincronizacion/sync-fitjeff.mapper.js",
  "src/sincronizacion/sincronizacion.service.js",
  "src/diagnostico/diagnostico.firebase.service.js",
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
  revisarRedisenio();
  revisarControladorIntegracion();
  revisarFirestoreFitJeff();
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
      resultados.push({ nivel: "error", area: "json", archivo, mensaje: "No existe." });
      return;
    }

    try {
      JSON.parse(fs.readFileSync(ruta, "utf8"));
      resultados.push({ nivel: "ok", area: "json", archivo, mensaje: "JSON válido." });
    } catch (error) {
      resultados.push({ nivel: "error", area: "json", archivo, mensaje: error.message });
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
    resultados.push({ nivel: "error", area: "build", archivo: "public/version.json + service-worker.js", mensaje: error.message });
  }
}

function revisarServiceWorker() {
  const contenido = leerArchivo("service-worker.js");
  const rutasNecesarias = [
    "./public/fit-redesign.css",
    "./src/vistas/registrar.view.js",
    "./src/vistas/progreso.view.js",
    "./src/vistas/asistente.view.js",
    "./src/firebase/firestore.paths.js",
    "./src/firebase/firestore.schema.js",
    "./src/sincronizacion/sync-fitjeff.mapper.js"
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

function revisarRedisenio() {
  const router = leerArchivo("src/ui/router.js");
  const menu = leerArchivo("src/ui/menu.js");
  const index = leerArchivo("index.html");

  agregarRevisionTexto("redisenio", "router.js", router, "REGISTRAR", "Router registra la vista Registrar.");
  agregarRevisionTexto("redisenio", "router.js", router, "PROGRESO", "Router registra la vista Progreso.");
  agregarRevisionTexto("redisenio", "router.js", router, "ASISTENTE", "Router registra la vista Asistente.");
  agregarRevisionTexto("redisenio", "menu.js", menu, "VISTAS_APP.REGISTRAR", "Menú usa Registrar.");
  agregarRevisionTexto("redisenio", "menu.js", menu, "VISTAS_APP.PROGRESO", "Menú usa Progreso.");
  agregarRevisionTexto("redisenio", "menu.js", menu, "VISTAS_APP.ASISTENTE", "Menú usa Asistente.");
  agregarRevisionTexto("redisenio", "index.html", index, "./public/fit-redesign.css", "Index carga estilos de rediseño.");
}

function revisarControladorIntegracion() {
  const controller = leerArchivo("src/app-controller.js");

  agregarRevisionTexto("integracion", "app-controller.js", controller, "renderRegistrarView", "Controlador importa o registra Registrar.");
  agregarRevisionTexto("integracion", "app-controller.js", controller, "renderProgresoView", "Controlador importa o registra Progreso.");
  agregarRevisionTexto("integracion", "app-controller.js", controller, "renderAsistenteView", "Controlador importa o registra Asistente.");
  agregarRevisionTexto("integracion", "app-controller.js", controller, "obtenerVistaRetornoPeso", "Guardar peso respeta vista Registrar.");
  agregarRevisionTexto("integracion", "app-controller.js", controller, "obtenerVistaRetornoAsistente", "Acciones de Jarvis respetan vista Asistente.");
  agregarRevisionTexto("integracion", "app-controller.js", controller, "obtenerVistaActual", "Controlador puede detectar la vista actual.");
}

function revisarFirestoreFitJeff() {
  const paths = leerArchivo("src/firebase/firestore.paths.js");
  const service = leerArchivo("src/firebase/firestore.service.js");
  const rules = leerArchivo("firestore.rules");

  agregarRevisionTexto("firestore", "firestore.paths.js", paths, "coleccionRaiz: \"fitjeff\"", "Colección raíz fitjeff definida.");
  agregarRevisionTexto("firestore", "firestore.paths.js", paths, "usuarioPrincipalId", "Usuario principal definido.");
  agregarRevisionTexto("firestore", "firestore.service.js", service, "FITJEFF_FIRESTORE.coleccionRaiz", "Servicio usa rutas centralizadas.");
  agregarRevisionTexto("firestore", "firestore.rules", rules, "match /fitjeff/{usuarioId}", "Reglas protegen fitjeff/{usuarioId}.");

  if (service.includes("COLECCIONES.USUARIOS") || service.includes("usuarios/")) {
    resultados.push({
      nivel: "warning",
      area: "firestore",
      archivo: "src/firebase/firestore.service.js",
      mensaje: "Aún hay referencias a usuarios/. Revisar migración."
    });
  } else {
    resultados.push({
      nivel: "ok",
      area: "firestore",
      archivo: "src/firebase/firestore.service.js",
      mensaje: "Sin referencias antiguas a usuarios/."
    });
  }
}

function agregarRevisionTexto(area, archivo, contenido, patron, mensajeOK) {
  const ok = contenido.includes(patron);
  resultados.push({
    nivel: ok ? "ok" : "error",
    area,
    archivo,
    mensaje: ok ? mensajeOK : `No contiene: ${patron}`
  });
}

function leerArchivo(archivo) {
  return fs.readFileSync(path.join(ROOT, archivo), "utf8");
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
