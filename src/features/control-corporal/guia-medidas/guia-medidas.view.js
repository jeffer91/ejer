/*
  Nombre completo: guia-medidas.view.js
  Ruta o ubicación: src/features/control-corporal/guia-medidas/guia-medidas.view.js

  Función o funciones:
    - Construir la pantalla Guía visual de medidas corporales.
    - Dibujar una silueta frontal/posterior con puntos de medición.
    - Mostrar instrucciones de dónde medir, postura, errores comunes y frecuencia.
    - Permitir seleccionar una zona desde la silueta o desde tarjetas.

  Se conecta con:
    - src/features/control-corporal/guia-medidas/guia-medidas.controller.js
    - src/features/control-corporal/guia-medidas/guia-medidas.data.js
    - src/features/control-corporal/guia-medidas/guia-medidas.css
*/

import { GUIA_MEDIDAS_PASOS, GUIA_MEDIDAS_TEXTOS, GUIA_MEDIDAS_ZONAS } from "./guia-medidas.data.js";
import "./guia-medidas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearSvgElemento(nombre) {
  return document.createElementNS("http://www.w3.org/2000/svg", nombre);
}

function configurarAtributos(elemento, atributos = {}) {
  Object.entries(atributos).forEach(([clave, valor]) => elemento.setAttribute(clave, String(valor)));
  return elemento;
}

function crearSiluetaBase() {
  const grupo = crearSvgElemento("g");

  grupo.appendChild(configurarAtributos(crearSvgElemento("circle"), { cx: 50, cy: 12, r: 7, class: "guia-medidas-body" }));
  grupo.appendChild(configurarAtributos(crearSvgElemento("path"), {
    d: "M41 22 C39 32 38 46 40 58 C42 68 44 80 43 94 M59 22 C61 32 62 46 60 58 C58 68 56 80 57 94 M41 22 C46 25 54 25 59 22 M40 58 C45 62 55 62 60 58",
    class: "guia-medidas-body-line"
  }));
  grupo.appendChild(configurarAtributos(crearSvgElemento("path"), {
    d: "M40 28 C31 34 27 45 24 58 M60 28 C69 34 73 45 76 58 M43 94 L42 108 M57 94 L58 108",
    class: "guia-medidas-body-line guia-medidas-body-line--soft"
  }));

  return grupo;
}

function crearPuntoZona(zona, seleccionada, onSeleccionar) {
  const grupo = crearSvgElemento("g");
  const circulo = configurarAtributos(crearSvgElemento("circle"), {
    cx: zona.x,
    cy: zona.y,
    r: seleccionada ? 4.8 : 3.9,
    class: seleccionada ? "guia-medidas-point guia-medidas-point--active" : "guia-medidas-point",
    tabindex: 0,
    role: "button",
    "aria-label": `Seleccionar ${zona.nombre}`
  });
  const etiqueta = configurarAtributos(crearSvgElemento("text"), {
    x: zona.x + 6,
    y: zona.y + 1.5,
    class: "guia-medidas-point-label"
  });

  etiqueta.textContent = zona.nombre;
  grupo.dataset.zona = zona.id;
  grupo.addEventListener("click", () => onSeleccionar?.(zona.id));
  grupo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      onSeleccionar?.(zona.id);
    }
  });
  grupo.appendChild(circulo);
  grupo.appendChild(etiqueta);
  return grupo;
}

function crearSilueta({ lado, zonaActivaId, onSeleccionar }) {
  const zonas = GUIA_MEDIDAS_ZONAS.filter((zona) => zona.lado === lado);
  const tarjeta = crearElemento("article", "guia-medidas-silhouette-card");
  const svg = configurarAtributos(crearSvgElemento("svg"), {
    viewBox: "0 0 100 114",
    class: "guia-medidas-silhouette",
    role: "img",
    "aria-label": lado === "frontal" ? "Silueta frontal con zonas de medición" : "Silueta posterior con zonas de medición"
  });

  tarjeta.appendChild(crearElemento("h3", "", lado === "frontal" ? "Vista frontal" : "Vista posterior"));
  svg.appendChild(crearSiluetaBase());
  zonas.forEach((zona) => svg.appendChild(crearPuntoZona(zona, zona.id === zonaActivaId, onSeleccionar)));
  tarjeta.appendChild(svg);
  tarjeta.appendChild(crearElemento("p", "", lado === "frontal" ? "Puntos principales para registrar medidas frecuentes." : "Puntos de referencia opcionales o complementarios."));
  return tarjeta;
}

function crearDetalleZona(zona) {
  const detalle = crearElemento("section", "guia-medidas-detail");
  const lista = crearElemento("div", "guia-medidas-detail__grid");

  detalle.appendChild(crearElemento("p", "guia-medidas-kicker", "Zona seleccionada"));
  detalle.appendChild(crearElemento("h3", "", zona.nombre));
  detalle.appendChild(crearElemento("strong", "guia-medidas-register", `Registrar como: ${zona.registrarComo}`));

  [
    ["Dónde medir", zona.donde],
    ["Postura", zona.postura],
    ["Evita", zona.errorComun],
    ["Frecuencia", zona.frecuencia]
  ].forEach(([label, textoDetalle]) => {
    const item = crearElemento("article", "guia-medidas-tip");
    item.appendChild(crearElemento("span", "", label));
    item.appendChild(crearElemento("p", "", textoDetalle));
    lista.appendChild(item);
  });

  detalle.appendChild(lista);
  return detalle;
}

function crearTarjetaZona(zona, activa, onSeleccionar) {
  const tarjeta = crearElemento("button", activa ? "guia-medidas-zone guia-medidas-zone--active" : "guia-medidas-zone");
  tarjeta.type = "button";
  tarjeta.dataset.zona = zona.id;
  tarjeta.appendChild(crearElemento("strong", "", zona.nombre));
  tarjeta.appendChild(crearElemento("span", "", zona.registrarComo));
  tarjeta.addEventListener("click", () => onSeleccionar?.(zona.id));
  return tarjeta;
}

function crearZonasGrid(zonaActivaId, onSeleccionar) {
  const seccion = crearElemento("section", "guia-medidas-panel");
  const grid = crearElemento("div", "guia-medidas-zones");

  seccion.appendChild(crearElemento("h3", "", "Partes recomendadas"));
  GUIA_MEDIDAS_ZONAS.forEach((zona) => grid.appendChild(crearTarjetaZona(zona, zona.id === zonaActivaId, onSeleccionar)));
  seccion.appendChild(grid);
  return seccion;
}

function crearPasos() {
  const seccion = crearElemento("section", "guia-medidas-panel guia-medidas-panel--steps");
  const lista = crearElemento("ol", "guia-medidas-steps");

  seccion.appendChild(crearElemento("h3", "", "Cómo medirte bien"));
  GUIA_MEDIDAS_PASOS.forEach((paso) => {
    const item = crearElemento("li", "", paso);
    lista.appendChild(item);
  });
  seccion.appendChild(lista);
  return seccion;
}

export function crearGuiaMedidasView() {
  let zonaActivaId = "cintura";
  const pantalla = crearElemento("section", "guia-medidas-screen");
  const header = crearElemento("header", "guia-medidas-header");
  const layout = crearElemento("section", "guia-medidas-layout");
  const siluetas = crearElemento("div", "guia-medidas-silhouettes");
  const contenido = crearElemento("div", "guia-medidas-content");

  function render() {
    const zonaActiva = GUIA_MEDIDAS_ZONAS.find((zona) => zona.id === zonaActivaId) || GUIA_MEDIDAS_ZONAS[0];

    siluetas.innerHTML = "";
    contenido.innerHTML = "";
    siluetas.appendChild(crearSilueta({ lado: "frontal", zonaActivaId, onSeleccionar }));
    siluetas.appendChild(crearSilueta({ lado: "posterior", zonaActivaId, onSeleccionar }));
    contenido.appendChild(crearDetalleZona(zonaActiva));
    contenido.appendChild(crearZonasGrid(zonaActivaId, onSeleccionar));
    contenido.appendChild(crearPasos());
  }

  function onSeleccionar(id) {
    zonaActivaId = id;
    render();
  }

  header.appendChild(crearElemento("p", "guia-medidas-kicker", "Control corporal"));
  header.appendChild(crearElemento("h2", "", GUIA_MEDIDAS_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", GUIA_MEDIDAS_TEXTOS.SUBTITULO));

  const reglas = crearElemento("section", "guia-medidas-rules");
  reglas.appendChild(crearElemento("strong", "", GUIA_MEDIDAS_TEXTOS.REGLA_FIJA));
  reglas.appendChild(crearElemento("span", "", GUIA_MEDIDAS_TEXTOS.FRECUENCIA));
  reglas.appendChild(crearElemento("small", "", GUIA_MEDIDAS_TEXTOS.NOTA_SEGURA));

  layout.appendChild(siluetas);
  layout.appendChild(contenido);
  pantalla.appendChild(header);
  pantalla.appendChild(reglas);
  pantalla.appendChild(layout);
  render();

  return pantalla;
}
