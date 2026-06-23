import { VISTAS_APP } from "./router.js";
import { escaparHTML } from "./helpers.js";

export const MENU_PRINCIPAL = [
  { id: VISTAS_APP.INICIO, texto: "Inicio", descripcion: "Resumen diario" },
  { id: VISTAS_APP.ENTRENAR, texto: "Entrenar", descripcion: "Entrenar hoy" },
  { id: VISTAS_APP.REGISTRAR, texto: "Registrar", descripcion: "Peso y medidas" },
  { id: VISTAS_APP.PROGRESO, texto: "Progreso", descripcion: "Avance" },
  { id: VISTAS_APP.ASISTENTE, texto: "Asistente", descripcion: "Control" },
  { id: VISTAS_APP.AJUSTES, texto: "Ajustes", descripcion: "Sistema" }
];

export function crearMenuPrincipal(items = MENU_PRINCIPAL) {
  return `
    <nav class="fit-nav" aria-label="Navegacion principal">
      ${items.map(crearItemMenu).join("")}
    </nav>
  `;
}

export function crearItemMenu(item) {
  return `
    <button type="button" data-nav="${escaparHTML(item.id)}" title="${escaparHTML(item.descripcion || item.texto)}" aria-label="${escaparHTML(item.texto)}">
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

export function filtrarMenuPorAjustes() {
  return MENU_PRINCIPAL;
}

export function reemplazarMenu(items = MENU_PRINCIPAL) {
  const nav = document.querySelector(".fit-nav");
  if (!nav) return;
  nav.innerHTML = items.map(crearItemMenu).join("");
}
