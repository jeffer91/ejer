/*
  Nombre completo: hoy.view.js
  Ruta o ubicacion: src/features/control-corporal/hoy/hoy.view.js

  Funcion o funciones:
    - Construir la pantalla principal Hoy.
    - Mostrar conclusion, accion, tarjetas compactas y mini grafico.
    - Mantener una vista visual, clara y sin exceso de numeros.

  Se conecta con:
    - src/features/control-corporal/hoy/hoy.controller.js
    - src/features/control-corporal/hoy/hoy.constants.js
    - src/features/control-corporal/hoy/hoy.css
*/

import { CONTROL_CORPORAL_ROUTES } from "../control-corporal.routes.js";
import { HOY_TEXTOS } from "./hoy.constants.js";
import "./hoy.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null && texto !== "") elemento.textContent = texto;
  return elemento;
}

function crearBotonRuta(texto, ruta, clase = "hoy-button") {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  boton.dataset.rutaDestino = ruta;
  return boton;
}

function crearHero(resumen) {
  const hero = crearElemento("section", `hoy-hero hoy-hero--${resumen.accionPrincipal.estado}`);
  const texto = crearElemento("div", "hoy-hero__text");
  const accion = crearElemento("div", "hoy-hero__action");

  texto.appendChild(crearElemento("p", "hoy-kicker", HOY_TEXTOS.KICKER));
  texto.appendChild(crearElemento("h2", "", resumen.accionPrincipal.titulo));
  texto.appendChild(crearElemento("p", "", resumen.accionPrincipal.descripcion));

  accion.appendChild(crearBotonRuta(resumen.accionPrincipal.boton, resumen.accionPrincipal.ruta, "hoy-button hoy-button--primary"));

  hero.appendChild(texto);
  hero.appendChild(accion);

  return hero;
}

function crearTarjeta(tarjeta) {
  const card = crearElemento("article", `hoy-card hoy-card--${tarjeta.estado}`);
  const top = crearElemento("div", "hoy-card__top");
  const estado = crearElemento("span", `fj-status-chip fj-status--${tarjeta.estado}`);
  const punto = crearElemento("span", `fj-status-dot fj-status-dot--${tarjeta.estado}`);
  const estadoTexto = crearElemento("span", "", tarjeta.estadoTexto);

  estado.appendChild(punto);
  estado.appendChild(estadoTexto);

  top.appendChild(crearElemento("h3", "", tarjeta.titulo));
  top.appendChild(estado);

  card.appendChild(top);
  card.appendChild(crearElemento("strong", "hoy-card__value", tarjeta.valor));
  card.appendChild(crearElemento("p", "hoy-card__detail", tarjeta.detalle));
  card.appendChild(crearBotonRuta(tarjeta.boton, tarjeta.ruta, "hoy-card__button"));

  return card;
}

function crearTarjetas(tarjetas) {
  const seccion = crearElemento("section", "hoy-cards");

  tarjetas.forEach((tarjeta) => {
    seccion.appendChild(crearTarjeta(tarjeta));
  });

  return seccion;
}

function crearPuntoSvg(cx, cy) {
  const punto = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  punto.setAttribute("cx", String(cx));
  punto.setAttribute("cy", String(cy));
  punto.setAttribute("r", "4");
  punto.setAttribute("fill", "currentColor");
  return punto;
}

function crearMiniGrafico(puntos) {
  const seccion = crearElemento("section", "hoy-chart-card");
  const header = crearElemento("div", "hoy-section-header");

  header.appendChild(crearElemento("h3", "", HOY_TEXTOS.GRAFICO_TITULO));
  header.appendChild(crearBotonRuta("Ver detalle", CONTROL_CORPORAL_ROUTES.ESTADISTICAS, "hoy-link-button"));
  seccion.appendChild(header);

  if (!puntos || puntos.length < 2) {
    seccion.appendChild(crearElemento("p", "hoy-empty", HOY_TEXTOS.GRAFICO_VACIO));
    return seccion;
  }

  const ancho = 640;
  const alto = 150;
  const margen = 20;
  const valores = puntos.map((punto) => Number(punto.valor));
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const rango = maximo - minimo || 1;
  const coordenadas = puntos.map((punto, indice) => {
    const x = margen + (indice * (ancho - margen * 2)) / (puntos.length - 1);
    const y = alto - margen - ((Number(punto.valor) - minimo) * (alto - margen * 2)) / rango;
    return { x, y, texto: `${x},${y}` };
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const linea = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  const area = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

  svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  svg.classList.add("hoy-chart");
  area.setAttribute("points", `${margen},${alto - margen} ${coordenadas.map((punto) => punto.texto).join(" ")} ${ancho - margen},${alto - margen}`);
  area.setAttribute("class", "hoy-chart__area");
  linea.setAttribute("points", coordenadas.map((punto) => punto.texto).join(" "));
  linea.setAttribute("fill", "none");
  linea.setAttribute("stroke", "currentColor");
  linea.setAttribute("stroke-width", "5");
  linea.setAttribute("stroke-linecap", "round");
  linea.setAttribute("stroke-linejoin", "round");

  svg.appendChild(area);
  svg.appendChild(linea);
  coordenadas.forEach((punto) => svg.appendChild(crearPuntoSvg(punto.x, punto.y)));

  seccion.appendChild(svg);
  seccion.appendChild(crearElemento("p", "hoy-chart__detail", `${puntos[0].fecha} a ${puntos[puntos.length - 1].fecha}`));

  return seccion;
}

function crearAccesosRapidos() {
  const seccion = crearElemento("section", "hoy-quick-actions");
  const header = crearElemento("div", "hoy-section-header");
  const botones = crearElemento("div", "hoy-quick-actions__buttons");

  header.appendChild(crearElemento("h3", "", HOY_TEXTOS.ACCESOS_TITULO));

  botones.appendChild(crearBotonRuta("Registrar", CONTROL_CORPORAL_ROUTES.REGISTRO, "hoy-button hoy-button--secondary"));
  botones.appendChild(crearBotonRuta("Progreso", CONTROL_CORPORAL_ROUTES.ESTADISTICAS, "hoy-button hoy-button--secondary"));
  botones.appendChild(crearBotonRuta("Historial", CONTROL_CORPORAL_ROUTES.HISTORIAL, "hoy-button hoy-button--secondary"));

  seccion.appendChild(header);
  seccion.appendChild(botones);

  return seccion;
}

export function crearHoyView(resumen) {
  const pantalla = crearElemento("section", "hoy-screen");

  pantalla.appendChild(crearHero(resumen));
  pantalla.appendChild(crearTarjetas(resumen.tarjetas));
  pantalla.appendChild(crearMiniGrafico(resumen.graficoPeso));
  pantalla.appendChild(crearAccesosRapidos());

  return pantalla;
}
