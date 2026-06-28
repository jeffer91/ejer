/*
  Nombre completo: mapa-corporal.view.js
  Ruta o ubicacion: src/features/control-corporal/registro/mapa-corporal.view.js

  Funcion o funciones:
    - Construir una guia visual simple del cuerpo para medidas.
    - Reforzar donde se mide sin abrir otra pantalla.
    - Mantener la pantalla Registro compacta y entendible.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.view.js
    - src/features/control-corporal/registro/mapa-corporal.css
*/

import "./mapa-corporal.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearSvgElemento(etiqueta, atributos = {}) {
  const elemento = document.createElementNS("http://www.w3.org/2000/svg", etiqueta);

  Object.entries(atributos).forEach(([clave, valor]) => {
    elemento.setAttribute(clave, String(valor));
  });

  return elemento;
}

function crearLinea(y) {
  return crearSvgElemento("line", {
    x1: 70,
    x2: 170,
    y1: y,
    y2: y,
    class: "mapa-corporal__line"
  });
}

function crearPunto(cx, cy) {
  return crearSvgElemento("circle", {
    cx,
    cy,
    r: 6,
    class: "mapa-corporal__point"
  });
}

function crearSvgCuerpo() {
  const svg = crearSvgElemento("svg", {
    viewBox: "0 0 240 280",
    role: "img",
    "aria-label": "Guia visual para ubicar medidas corporales",
    class: "mapa-corporal__svg"
  });

  const cabeza = crearSvgElemento("circle", {
    cx: 120,
    cy: 34,
    r: 24,
    class: "mapa-corporal__body"
  });

  const torso = crearSvgElemento("path", {
    d: "M82 68 C72 96 72 130 86 158 C95 174 145 174 154 158 C168 130 168 96 158 68 C142 78 98 78 82 68 Z",
    class: "mapa-corporal__body"
  });

  const brazoIzq = crearSvgElemento("path", {
    d: "M82 78 C54 94 46 124 44 158",
    class: "mapa-corporal__body",
    fill: "none"
  });

  const brazoDer = crearSvgElemento("path", {
    d: "M158 78 C186 94 194 124 196 158",
    class: "mapa-corporal__body",
    fill: "none"
  });

  const piernaIzq = crearSvgElemento("path", {
    d: "M102 172 C94 206 90 236 88 268",
    class: "mapa-corporal__body",
    fill: "none"
  });

  const piernaDer = crearSvgElemento("path", {
    d: "M138 172 C146 206 150 236 152 268",
    class: "mapa-corporal__body",
    fill: "none"
  });

  svg.appendChild(cabeza);
  svg.appendChild(torso);
  svg.appendChild(brazoIzq);
  svg.appendChild(brazoDer);
  svg.appendChild(piernaIzq);
  svg.appendChild(piernaDer);
  svg.appendChild(crearLinea(92));
  svg.appendChild(crearLinea(122));
  svg.appendChild(crearLinea(154));
  svg.appendChild(crearPunto(120, 92));
  svg.appendChild(crearPunto(120, 122));
  svg.appendChild(crearPunto(120, 154));
  svg.appendChild(crearPunto(54, 122));
  svg.appendChild(crearPunto(98, 218));

  return svg;
}

export function crearMapaCorporal() {
  const seccion = crearElemento("aside", "mapa-corporal");
  const info = crearElemento("div", "mapa-corporal__info");
  const chips = crearElemento("div", "mapa-corporal__chips");
  const etiquetas = ["Cintura", "Abdomen", "Pecho", "Brazo", "Pierna", "Cadera"];

  etiquetas.forEach((etiqueta) => {
    chips.appendChild(crearElemento("span", "mapa-corporal__chip", etiqueta));
  });

  info.appendChild(crearElemento("h4", "", "Guía rápida de medidas"));
  info.appendChild(crearElemento("p", "", "Usa los botones ? de cada campo para ver una aclaración corta sin salir de esta pantalla."));
  info.appendChild(chips);

  seccion.appendChild(crearSvgCuerpo());
  seccion.appendChild(info);

  return seccion;
}
