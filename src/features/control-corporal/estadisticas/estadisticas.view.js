/*
  Nombre completo: estadisticas.view.js
  Ruta o ubicacion: src/features/control-corporal/estadisticas/estadisticas.view.js

  Funcion o funciones:
    - Construir la pantalla Progreso como vista de detalle.
    - Mostrar primero resumen, análisis corporal inteligente, accion visual y grafico importante.
    - Dejar los datos ampliados organizados por secciones.
    - Dibujar grafico simple de peso sin depender de librerias externas.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.controller.js
    - src/features/control-corporal/estadisticas/estadisticas.presenter.js
    - src/features/control-corporal/estadisticas/estadisticas.constants.js
    - src/features/control-corporal/analisis-corporal/avatar-corporal.view.js
    - src/features/control-corporal/estadisticas/estadisticas.css
*/

import { crearAvatarCorporal } from "../analisis-corporal/avatar-corporal.view.js";
import { ESTADISTICAS_TEXTOS } from "./estadisticas.constants.js";
import { prepararVistaEstadisticas } from "./estadisticas.presenter.js";
import "./estadisticas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null && texto !== "") {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearChipEstado(estado, texto) {
  const chip = crearElemento("span", `fj-status-chip fj-status--${estado}`);
  const punto = crearElemento("span", `fj-status-dot fj-status-dot--${estado}`);
  const label = crearElemento("span", "", texto);

  chip.appendChild(punto);
  chip.appendChild(label);

  return chip;
}

function crearHeader(datos) {
  const header = crearElemento("section", "estadisticas-header");

  header.appendChild(crearElemento("p", "estadisticas-kicker", datos.kicker));
  header.appendChild(crearElemento("h2", "", datos.titulo));
  header.appendChild(crearElemento("p", "", datos.subtitulo));

  return header;
}

function crearHero(datos) {
  const hero = crearElemento("section", `estadisticas-hero estadisticas-hero--${datos.estado}`);
  const texto = crearElemento("div", "estadisticas-hero__text");

  texto.appendChild(crearElemento("p", "estadisticas-kicker", ESTADISTICAS_TEXTOS.MENSAJE_INTELIGENTE));
  texto.appendChild(crearElemento("h3", "", datos.titulo));
  texto.appendChild(crearElemento("p", "", datos.descripcion));

  hero.appendChild(texto);

  return hero;
}

function crearTituloSeccion(titulo, descripcion = "") {
  const header = crearElemento("div", "estadisticas-section-header");
  const texto = crearElemento("div", "estadisticas-section-header__text");

  texto.appendChild(crearElemento("h3", "", titulo));

  if (descripcion) {
    texto.appendChild(crearElemento("p", "", descripcion));
  }

  header.appendChild(texto);

  return header;
}

function crearTarjeta({ titulo, valor, detalle, estado }) {
  const tarjeta = crearElemento("article", `estadisticas-card estadisticas-card--${estado}`);
  const top = crearElemento("div", "estadisticas-card__top");

  top.appendChild(crearElemento("p", "estadisticas-card__label", titulo));
  top.appendChild(crearChipEstado(estado, estado === "success" ? "Al día" : estado === "pending" ? "Pendiente" : estado === "alert" ? "Revisar" : estado === "empty" ? "Sin dato" : "Info"));

  tarjeta.appendChild(top);
  tarjeta.appendChild(crearElemento("strong", "estadisticas-card__value", valor));

  if (detalle) {
    tarjeta.appendChild(crearElemento("span", "estadisticas-card__detail", detalle));
  }

  return tarjeta;
}

function crearGridTarjetas(tarjetas, claseExtra = "") {
  const grid = crearElemento("div", `estadisticas-cards ${claseExtra}`.trim());

  tarjetas.forEach((tarjeta) => {
    grid.appendChild(crearTarjeta(tarjeta));
  });

  return grid;
}

function crearResumenPrincipal(vista) {
  const seccion = crearElemento("section", "estadisticas-panel");
  seccion.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.RESUMEN_PRINCIPAL, "Lo más importante de tu seguimiento."));
  seccion.appendChild(crearGridTarjetas(vista.resumenPrincipal, "estadisticas-cards--principal"));
  return seccion;
}

function crearAnalisisCorporal(vista) {
  const analisis = vista.analisisCorporal;
  const seccion = crearElemento("section", `analisis-corporal-panel analisis-corporal-panel--${analisis.estado}`);
  const contenido = crearElemento("div", "analisis-corporal-content");
  const metricas = crearElemento("div", "analisis-corporal-metrics");

  contenido.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.ANALISIS_CORPORAL, "Cruza peso, altura, cintura, cuello y contexto muscular."));
  contenido.appendChild(crearElemento("h3", "", analisis.titulo));
  contenido.appendChild(crearElemento("p", "", analisis.resumen));

  analisis.metricas.forEach((metrica) => metricas.appendChild(crearTarjeta(metrica)));
  contenido.appendChild(metricas);

  if (analisis.faltantes.length > 0) {
    contenido.appendChild(crearElemento("p", "analisis-corporal-missing", `Para mejorar la lectura falta: ${analisis.faltantes.join(", ")}.`));
  }

  contenido.appendChild(crearElemento("p", "analisis-corporal-note", analisis.aviso));
  seccion.appendChild(crearAvatarCorporal(analisis.avatar));
  seccion.appendChild(contenido);
  return seccion;
}

function crearBarraProgreso(progreso) {
  const seccion = crearElemento("section", "estadisticas-progress-card");
  const top = crearElemento("div", "estadisticas-progress-card__top");
  const contenedor = crearElemento("div", "estadisticas-progress");
  const barra = crearElemento("div", "estadisticas-progress__bar");
  const texto = crearElemento("span", "estadisticas-progress__text", `${progreso.porcentaje}%`);
  const detalle = crearElemento("div", "estadisticas-progress-card__detail");

  top.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.PROGRESO_PESO, "Comparación entre inicio, estado actual y meta."));
  top.appendChild(crearElemento("strong", "", `${progreso.porcentaje}%`));

  barra.style.width = `${Math.max(0, Math.min(100, progreso.porcentaje))}%`;
  contenedor.appendChild(barra);
  contenedor.appendChild(texto);

  detalle.appendChild(crearElemento("span", "", `Inicial: ${progreso.pesoInicialKg}`));
  detalle.appendChild(crearElemento("span", "", `Actual: ${progreso.pesoActualKg}`));
  detalle.appendChild(crearElemento("span", "", `Meta: ${progreso.pesoObjetivoKg}`));
  detalle.appendChild(crearElemento("span", "", `Falta: ${progreso.faltanteObjetivoKg}`));

  seccion.appendChild(top);
  seccion.appendChild(contenedor);
  seccion.appendChild(detalle);

  return seccion;
}

function crearPuntoSvg(cx, cy) {
  const punto = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  punto.setAttribute("cx", String(cx));
  punto.setAttribute("cy", String(cy));
  punto.setAttribute("r", "5");
  punto.setAttribute("fill", "currentColor");
  return punto;
}

function crearGraficoPeso(puntos) {
  const contenedor = crearElemento("section", "estadisticas-chart-card");
  contenedor.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.GRAFICO_PESO, "Vista simple de tus últimos registros."));

  if (!puntos || puntos.length < 2) {
    contenedor.appendChild(crearElemento("p", "estadisticas-empty", "Registra al menos dos pesos para ver el gráfico."));
    return contenedor;
  }

  const ancho = 640;
  const alto = 190;
  const margen = 24;
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
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  const area = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

  svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  svg.classList.add("estadisticas-chart");
  area.setAttribute("points", `${margen},${alto - margen} ${coordenadas.map((punto) => punto.texto).join(" ")} ${ancho - margen},${alto - margen}`);
  area.setAttribute("class", "estadisticas-chart__area");
  polyline.setAttribute("points", coordenadas.map((punto) => punto.texto).join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "currentColor");
  polyline.setAttribute("stroke-width", "5");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");

  svg.appendChild(area);
  svg.appendChild(polyline);
  coordenadas.forEach((punto) => svg.appendChild(crearPuntoSvg(punto.x, punto.y)));
  contenedor.appendChild(svg);
  contenedor.appendChild(crearElemento("p", "estadisticas-chart__detail", `${puntos[0].fecha} a ${puntos[puntos.length - 1].fecha} · ${puntos.length} registro(s)`));

  return contenedor;
}

function crearDetallePeso(vista) {
  const seccion = crearElemento("section", "estadisticas-panel");
  seccion.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.DETALLE_PESO, "Datos ampliados para revisar cuando lo necesites."));
  seccion.appendChild(crearGridTarjetas(vista.detallePeso));
  return seccion;
}

function crearMedidas(vista) {
  const seccion = crearElemento("section", "estadisticas-measures");
  const grid = crearElemento("div", "estadisticas-measures__grid");

  seccion.appendChild(crearTituloSeccion(ESTADISTICAS_TEXTOS.MEDIDAS, "Últimas medidas guardadas."));

  vista.medidas.forEach((medida) => {
    grid.appendChild(crearTarjeta({
      titulo: medida.titulo,
      valor: medida.valor,
      detalle: medida.estado === "success" ? "Último dato guardado" : "Sin registro",
      estado: medida.estado
    }));
  });

  seccion.appendChild(grid);
  return seccion;
}

export function crearEstadisticasView(resumen) {
  const vista = prepararVistaEstadisticas(resumen);
  const pantalla = crearElemento("section", "estadisticas-screen");

  pantalla.appendChild(crearHeader(vista.header));
  pantalla.appendChild(crearHero(vista.hero));
  pantalla.appendChild(crearAnalisisCorporal(vista));
  pantalla.appendChild(crearResumenPrincipal(vista));
  pantalla.appendChild(crearBarraProgreso(vista.progreso));
  pantalla.appendChild(crearGraficoPeso(vista.graficoPeso));
  pantalla.appendChild(crearDetallePeso(vista));
  pantalla.appendChild(crearMedidas(vista));

  if (vista.sinDatos) {
    pantalla.appendChild(crearElemento("p", "estadisticas-empty", ESTADISTICAS_TEXTOS.SIN_DATOS));
  }

  return pantalla;
}
