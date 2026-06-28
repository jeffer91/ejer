import { MEDIDAS_MODAL_TEXTOS, obtenerMedidaModalInfo } from "./medidas-modal.constants.js";
import { crearFiguraMedicion } from "./medidas-figura.svg.js";
import "./medidas-modal.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null && texto !== "") elemento.textContent = String(texto);
  return elemento;
}

function crearFila(titulo, texto) {
  const fila = crearElemento("article", "medidas-modal__row");
  fila.appendChild(crearElemento("strong", "", titulo));
  fila.appendChild(crearElemento("p", "", texto));
  return fila;
}

function limpiarNodo(nodo) {
  while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
}

function renderContenido(modal, campo) {
  const info = obtenerMedidaModalInfo(campo);

  modal.titulo.textContent = info.titulo;
  modal.resumen.textContent = info.resumen;
  modal.footerNota.textContent = info.nota || MEDIDAS_MODAL_TEXTOS.SUBTITULO;
  limpiarNodo(modal.figura);
  limpiarNodo(modal.detalle);

  modal.figura.appendChild(crearFiguraMedicion(info.zona));
  modal.detalle.appendChild(crearFila("Dónde medir", info.donde));
  modal.detalle.appendChild(crearFila("Cómo colocarte", info.como));
  modal.detalle.appendChild(crearFila("Cinta", info.cinta));
  modal.detalle.appendChild(crearFila("Evita", info.evitar));
  modal.detalle.appendChild(crearFila("Consejo", info.consejo));
}

export function crearMedidasModal() {
  const overlay = crearElemento("div", "medidas-modal", "");
  const caja = crearElemento("section", "medidas-modal__box");
  const header = crearElemento("header", "medidas-modal__header");
  const kicker = crearElemento("p", "medidas-modal__kicker", MEDIDAS_MODAL_TEXTOS.TITULO);
  const titulo = crearElemento("h3", "", "");
  const resumen = crearElemento("p", "medidas-modal__summary", "");
  const cerrar = crearElemento("button", "medidas-modal__close", "×");
  const cuerpo = crearElemento("div", "medidas-modal__body");
  const figura = crearElemento("div", "medidas-modal__figure");
  const detalle = crearElemento("div", "medidas-modal__detail");
  const footer = crearElemento("footer", "medidas-modal__footer");
  const footerNota = crearElemento("p", "", MEDIDAS_MODAL_TEXTOS.SUBTITULO);
  const cerrarFooter = crearElemento("button", "medidas-modal__button", MEDIDAS_MODAL_TEXTOS.CERRAR);

  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", MEDIDAS_MODAL_TEXTOS.TITULO);

  cerrar.type = "button";
  cerrar.setAttribute("aria-label", "Cerrar guía visual");
  cerrarFooter.type = "button";

  header.appendChild(kicker);
  header.appendChild(titulo);
  header.appendChild(resumen);
  header.appendChild(cerrar);
  cuerpo.appendChild(figura);
  cuerpo.appendChild(detalle);
  footer.appendChild(footerNota);
  footer.appendChild(cerrarFooter);
  caja.appendChild(header);
  caja.appendChild(cuerpo);
  caja.appendChild(footer);
  overlay.appendChild(caja);

  const modal = {
    overlay,
    caja,
    titulo,
    resumen,
    figura,
    detalle,
    footerNota,
    cerrar,
    cerrarFooter
  };

  function cerrarModal() {
    overlay.hidden = true;
    document.body.classList.remove("medidas-modal-open");
  }

  function abrir(campo) {
    renderContenido(modal, campo);
    overlay.hidden = false;
    document.body.classList.add("medidas-modal-open");
    cerrar.focus();
  }

  cerrar.addEventListener("click", cerrarModal);
  cerrarFooter.addEventListener("click", cerrarModal);
  overlay.addEventListener("click", (evento) => {
    if (evento.target === overlay) cerrarModal();
  });
  overlay.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarModal();
  });

  return {
    elemento: overlay,
    abrir,
    cerrar: cerrarModal
  };
}
