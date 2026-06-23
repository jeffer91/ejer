/*
  Nombre completo: router.js
  Ruta o ubicación: src/ui/router.js

  Función:
    - Definir las rutas internas de FitJeff.
    - Mantener visible una navegación diaria simple.
    - Conservar las vistas técnicas como rutas internas o avanzadas.
*/

export const VISTAS_APP = {
  INICIO: "inicio",
  ENTRENAR: "entrenar",
  REGISTRAR: "registrar",
  PROGRESO: "progreso",
  ASISTENTE: "asistente",
  GUIADO: "guiado",
  HIIT: "hiit",
  AUDIO_REMOTO: "audio-remoto",
  RUTINAS: "rutinas",
  MEDIDAS: "medidas",
  REPORTES: "reportes",
  DIAGNOSTICO: "diagnostico",
  PESO: "peso",
  ESTADISTICAS: "estadisticas",
  RECOMENDACIONES: "recomendaciones",
  JARVIS: "jarvis",
  AJUSTES: "ajustes"
};

const STORAGE_KEY_VISTA = "fitjeff_vista_actual";

const VISTAS_DINAMICAS = {
  [VISTAS_APP.REGISTRAR]: {
    ruta: "../vistas/registrar.view.js",
    render: "renderRegistrarView"
  },
  [VISTAS_APP.PROGRESO]: {
    ruta: "../vistas/progreso.view.js",
    render: "renderProgresoView"
  },
  [VISTAS_APP.ASISTENTE]: {
    ruta: "../vistas/asistente.view.js",
    render: "renderAsistenteView"
  },
  [VISTAS_APP.HIIT]: {
    ruta: "../vistas/hiit.view.js",
    render: "renderHIITView"
  },
  [VISTAS_APP.AUDIO_REMOTO]: {
    ruta: "../vistas/audio-remoto.view.js",
    render: "renderAudioRemotoView"
  },
  [VISTAS_APP.MEDIDAS]: {
    ruta: "../vistas/medidas.view.js",
    render: "renderMedidasView"
  },
  [VISTAS_APP.REPORTES]: {
    ruta: "../vistas/reportes.view.js",
    render: "renderReportesView"
  },
  [VISTAS_APP.DIAGNOSTICO]: {
    ruta: "../vistas/diagnostico.view.js",
    render: "renderDiagnosticoView"
  }
};

let vistaActual = VISTAS_APP.INICIO;
let listeners = [];
let vistasRegistradas = new Map();
let routerActivo = false;
let ultimoContexto = {};

export function registrarVista(nombre, render) {
  if (!nombre || typeof render !== "function") {
    throw new Error("Para registrar una vista necesitas nombre y función render.");
  }

  vistasRegistradas.set(nombre, render);
}

export function registrarVistas(mapaVistas = {}) {
  Object.entries(mapaVistas).forEach(([nombre, render]) => {
    registrarVista(nombre, render);
  });
}

export function navegarA(nombreVista, contexto = {}) {
  const vista = normalizarVista(nombreVista);
  vistaActual = vista;
  ultimoContexto = contexto || {};

  guardarVistaActual(vista);
  marcarNavegacionActiva(vista);
  renderizarVistaActual(ultimoContexto);
  notificarCambioVista(vista, ultimoContexto);

  if (location.hash.replace("#", "") !== vista) {
    history.replaceState(null, "", `#${vista}`);
  }

  return vista;
}

export function renderizarVistaActual(contexto = ultimoContexto) {
  const render = vistasRegistradas.get(vistaActual);

  if (render) {
    return render(contexto);
  }

  const dinamica = VISTAS_DINAMICAS[vistaActual];

  if (dinamica) {
    renderizarVistaDinamica(dinamica.ruta, dinamica.render, contexto);
    return null;
  }

  console.warn(`No existe render registrado para la vista: ${vistaActual}`);
  return null;
}

export function obtenerVistaActual() {
  return vistaActual;
}

export function restaurarVistaGuardada() {
  const guardada = localStorage.getItem(STORAGE_KEY_VISTA);
  vistaActual = normalizarVista(guardada || VISTAS_APP.INICIO);
  marcarNavegacionActiva(vistaActual);
  return vistaActual;
}

export function guardarVistaActual(vista = vistaActual) {
  localStorage.setItem(STORAGE_KEY_VISTA, normalizarVista(vista));
}

export function escucharCambioVista(callback) {
  if (typeof callback !== "function") return () => {};

  listeners.push(callback);

  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

export function activarRouterDelegado(root = document.body) {
  if (!root || routerActivo) return;

  routerActivo = true;

  root.addEventListener("click", (event) => {
    const boton = event.target.closest("[data-nav]");

    if (!boton) return;

    event.preventDefault();
    navegarA(boton.dataset.nav);
  });

  window.addEventListener("hashchange", () => {
    const hash = String(location.hash || "").replace("#", "").trim();

    if (hash && hash !== vistaActual) {
      navegarA(hash);
    }
  });
}

export function marcarNavegacionActiva(vista = vistaActual) {
  document.querySelectorAll("[data-nav]").forEach((elemento) => {
    elemento.classList.toggle("activo", elemento.dataset.nav === vista);
    elemento.setAttribute("aria-current", elemento.dataset.nav === vista ? "page" : "false");
  });
}

export function obtenerListaVistas() {
  return Object.values(VISTAS_APP);
}

function normalizarVista(vista) {
  const lista = obtenerListaVistas();
  return lista.includes(vista) ? vista : VISTAS_APP.INICIO;
}

function notificarCambioVista(vista, contexto) {
  listeners.forEach((callback) => {
    try {
      callback(vista, contexto);
    } catch (error) {
      console.warn("Error en listener de navegación.", error);
    }
  });
}

async function renderizarVistaDinamica(ruta, nombreRender, contexto = {}) {
  try {
    const modulo = await import(ruta);
    const vista = document.getElementById("vista");

    if (!vista || typeof modulo[nombreRender] !== "function") return;

    vista.innerHTML = modulo[nombreRender](contexto);
    vista.focus({ preventScroll: true });
  } catch (error) {
    console.error("No se pudo cargar la vista dinámica.", error);
  }
}
