/*
  Nombre completo: menu.js
  Ruta o ubicación: src/ui/menu.js
*/

import { VISTAS_APP } from "./router.js";
import { escaparHTML } from "./helpers.js";

export const MENU_PRINCIPAL = [
  {
    id: VISTAS_APP.INICIO,
    texto: "Inicio",
    descripcion: "Resumen de hoy"
  },
  {
    id: VISTAS_APP.ENTRENAR,
    texto: "Entrenar",
    descripcion: "Registrar rutina"
  },
  {
    id: VISTAS_APP.GUIADO,
    texto: "Guiado",
    descripcion: "Entrenamiento visual"
  },
  {
    id: VISTAS_APP.RUTINAS,
    texto: "Rutinas",
    descripcion: "Importar y editar"
  },
  {
    id: VISTAS_APP.MEDIDAS,
    texto: "Medidas",
    descripcion: "Registro semanal"
  },
  {
    id: VISTAS_APP.REPORTES,
    texto: "Reportes",
    descripcion: "Historial y exportación"
  },
  {
    id: VISTAS_APP.JARVIS,
    texto: "Jarvis",
    descripcion: "Asistente de voz"
  },
  {
    id: VISTAS_APP.PESO,
    texto: "Peso",
    descripcion: "Registrar peso"
  },
  {
    id: VISTAS_APP.ESTADISTICAS,
    texto: "Estadísticas",
    descripcion: "Ver progreso"
  },
  {
    id: VISTAS_APP.RECOMENDACIONES,
    texto: "Recomendaciones",
    descripcion: "Ajustes sugeridos"
  },
  {
    id: VISTAS_APP.AJUSTES,
    texto: "Ajustes",
    descripcion: "Configurar app"
  }
];

export function crearMenuPrincipal(items = MENU_PRINCIPAL) {
  return `
    <nav class="fit-nav" aria-label="Navegación principal">
      ${items.map(crearItemMenu).join("")}
    </nav>
  `;
}

export function crearItemMenu(item) {
  return `
    <button
      type="button"
      data-nav="${escaparHTML(item.id)}"
      title="${escaparHTML(item.descripcion || item.texto)}"
      aria-label="${escaparHTML(item.texto)}"
    >
      ${escaparHTML(item.texto)}
    </button>
  `;
}

export function obtenerItemMenu(id) {
  return MENU_PRINCIPAL.find((item) => item.id === id) || MENU_PRINCIPAL[0];
}

export function obtenerTituloVista(id) {
  return obtenerItemMenu(id).texto;
}

export function filtrarMenuPorAjustes(ajustes = {}) {
  return MENU_PRINCIPAL.filter((item) => {
    if (item.id === VISTAS_APP.RECOMENDACIONES && ajustes.mostrarRecomendaciones === false) {
      return false;
    }

    if (item.id === VISTAS_APP.ESTADISTICAS && ajustes.mostrarEstadisticas === false) {
      return false;
    }

    return true;
  });
}

export function reemplazarMenu(items = MENU_PRINCIPAL) {
  const nav = document.querySelector(".fit-nav");

  if (!nav) return;

  nav.innerHTML = items.map(crearItemMenu).join("");
}
