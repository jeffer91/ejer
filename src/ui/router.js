/*
  Nombre completo: router.js
  Ruta o ubicación: src/ui/router.js
*/

export const VISTAS_APP = {
  INICIO: "inicio",
  ENTRENAR: "entrenar",
  GUIADO: "guiado",
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

let vistaActual = VISTAS_APP.INICIO;
let listeners = [];
let vistasRegistradas = new Map();
let routerActivo = false;

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

  guardarVistaActual(vista);
  marcarNavegacionActiva(vista);
  renderizarVistaActual(contexto);
  notificarCambioVista(vista, contexto);

  if (location.hash.replace("#", "") !== vista) {
    history.replaceState(null, "", `#${vista}`);
  }

  return vista;
}

export function renderizarVistaActual(contexto = {}) {
  const render = vistasRegistradas.get(vistaActual);

  if (!render && vistaActual === VISTAS_APP.MEDIDAS) {
    renderizarVistaDinamica("../vistas/medidas.view.js", "renderMedidasView");
    return null;
  }

  if (!render && vistaActual === VISTAS_APP.REPORTES) {
    renderizarVistaDinamica("../vistas/reportes.view.js", "renderReportesView");
    return null;
  }

  if (!render && vistaActual === VISTAS_APP.DIAGNOSTICO) {
    renderizarVistaDinamica("../vistas/diagnostico.view.js", "renderDiagnosticoView");
    return null;
  }

  if (!render) {
    console.warn(`No existe render registrado para la vista: ${vistaActual}`);
    return null;
  }

  return render(contexto);
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

async function renderizarVistaDinamica(ruta, nombreRender) {
  try {
    const modulo = await import(ruta);
    const vista = document.getElementById("vista");

    if (!vista || typeof modulo[nombreRender] !== "function") return;

    vista.innerHTML = modulo[nombreRender]();
    vista.focus({ preventScroll: true });
  } catch (error) {
    console.error("No se pudo cargar la vista dinámica.", error);
  }
}
