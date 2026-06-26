/*
  Nombre completo: estadisticas.view.js
  Ruta o ubicación: src/features/control-corporal/estadisticas/estadisticas.view.js

  Función o funciones:
    - Construir la pantalla visual de Estadísticas.
    - Mostrar tarjetas compactas de peso, objetivo, cambio, tendencia, IMC y próxima medición.
    - Dibujar un gráfico simple de peso sin depender de librerías externas.
    - Mostrar medidas corporales en tarjetas pequeñas.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.controller.js
    - src/features/control-corporal/estadisticas/estadisticas.constants.js
    - src/features/control-corporal/estadisticas/estadisticas.css
*/

import { ESTADISTICAS_LABELS, ESTADISTICAS_TEXTOS, ESTADISTICAS_TENDENCIAS } from "./estadisticas.constants.js";
import "./estadisticas.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null) {
    elemento.textContent = texto;
  }

  return elemento;
}

function formatearKg(valor) {
  return valor === null || valor === undefined ? "Falta dato" : `${valor} kg`;
}

function formatearCm(valor) {
  return valor === null || valor === undefined ? "-" : `${valor} cm`;
}

function formatearCambio(valor) {
  if (valor === null || valor === undefined) {
    return "Falta dato";
  }

  if (valor > 0) return `+${valor} kg`;
  return `${valor} kg`;
}

function claseTendencia(tendencia) {
  if (tendencia === ESTADISTICAS_TENDENCIAS.BAJANDO) return "estadisticas-card--progreso";
  if (tendencia === ESTADISTICAS_TENDENCIAS.SUBIENDO) return "estadisticas-card--alerta";
  if (tendencia === ESTADISTICAS_TENDENCIAS.ESTABLE) return "estadisticas-card--info";
  return "estadisticas-card--pendiente";
}

function crearTarjeta({ label, valor, detalle, clase }) {
  const tarjeta = crearElemento("article", `estadisticas-card ${clase || ""}`.trim());
  tarjeta.appendChild(crearElemento("p", "estadisticas-card__label", label));
  tarjeta.appendChild(crearElemento("strong", "estadisticas-card__value", valor));

  if (detalle) {
    tarjeta.appendChild(crearElemento("span", "estadisticas-card__detail", detalle));
  }

  return tarjeta;
}

function crearBarraProgreso(porcentaje) {
  const contenedor = crearElemento("div", "estadisticas-progress");
  const barra = crearElemento("div", "estadisticas-progress__bar");
  const texto = crearElemento("span", "estadisticas-progress__text", `${porcentaje}% del objetivo`);

  barra.style.width = `${porcentaje}%`;
  contenedor.appendChild(barra);
  contenedor.appendChild(texto);

  return contenedor;
}

function crearGraficoPeso(puntos) {
  const contenedor = crearElemento("section", "estadisticas-chart-card");
  contenedor.appendChild(crearElemento("h3", "", ESTADISTICAS_TEXTOS.GRAFICO_PESO));

  if (!puntos || puntos.length < 2) {
    contenedor.appendChild(crearElemento("p", "estadisticas-empty", "Registra al menos dos pesos para ver el gráfico."));
    return contenedor;
  }

  const ancho = 640;
  const alto = 220;
  const margen = 26;
  const valores = puntos.map((punto) => punto.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const rango = maximo - minimo || 1;

  const coordenadas = puntos.map((punto, indice) => {
    const x = margen + (indice * (ancho - margen * 2)) / (puntos.length - 1);
    const y = alto - margen - ((punto.valor - minimo) * (alto - margen * 2)) / rango;
    return `${x},${y}`;
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

  svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
  svg.classList.add("estadisticas-chart");
  polyline.setAttribute("points", coordenadas.join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "currentColor");
  polyline.setAttribute("stroke-width", "5");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");

  svg.appendChild(polyline);
  contenedor.appendChild(svg);
  contenedor.appendChild(crearElemento("p", "estadisticas-chart__detail", `${puntos[0].fecha} a ${puntos[puntos.length - 1].fecha}`));

  return contenedor;
}

function crearTarjetasMedidas(medidas) {
  const seccion = crearElemento("section", "estadisticas-measures");
  const grid = crearElemento("div", "estadisticas-measures__grid");
  const campos = ["cinturaCm", "abdomenCm", "pechoCm", "brazoCm", "piernaCm", "caderaCm"];

  seccion.appendChild(crearElemento("h3", "", ESTADISTICAS_TEXTOS.MEDIDAS));

  campos.forEach((campo) => {
    grid.appendChild(crearTarjeta({
      label: ESTADISTICAS_LABELS[campo],
      valor: formatearCm(medidas[campo]),
      clase: "estadisticas-card--small"
    }));
  });

  seccion.appendChild(grid);
  return seccion;
}

export function crearEstadisticasView(resumen) {
  const pantalla = crearElemento("section", "estadisticas-screen");
  const header = crearElemento("div", "estadisticas-header");
  const cards = crearElemento("div", "estadisticas-cards");

  header.appendChild(crearElemento("p", "estadisticas-kicker", "Panel principal"));
  header.appendChild(crearElemento("h2", "", ESTADISTICAS_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", ESTADISTICAS_TEXTOS.SUBTITULO));

  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.pesoActualKg, valor: formatearKg(resumen.pesoActualKg), clase: "estadisticas-card--progreso" }));
  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.pesoObjetivoKg, valor: formatearKg(resumen.pesoObjetivoKg), detalle: `${resumen.progresoObjetivo}%`, clase: "estadisticas-card--info" }));
  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.cambioKg, valor: formatearCambio(resumen.cambioKg), clase: "estadisticas-card--pendiente" }));
  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.tendencia, valor: resumen.tendencia, clase: claseTendencia(resumen.tendencia) }));
  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.imc, valor: resumen.imc.valor ? String(resumen.imc.valor) : "Falta dato", detalle: resumen.imc.categoria, clase: "estadisticas-card--info" }));
  cards.appendChild(crearTarjeta({ label: ESTADISTICAS_LABELS.proximaMedicion, valor: resumen.proximaMedicion.texto, clase: resumen.proximaMedicion.pendiente ? "estadisticas-card--pendiente" : "estadisticas-card--progreso" }));

  pantalla.appendChild(header);
  pantalla.appendChild(cards);
  pantalla.appendChild(crearBarraProgreso(resumen.progresoObjetivo));
  pantalla.appendChild(crearGraficoPeso(resumen.graficoPeso));
  pantalla.appendChild(crearTarjetasMedidas(resumen.ultimasMedidas));

  if (resumen.cantidadPesos < 3) {
    pantalla.appendChild(crearElemento("p", "estadisticas-empty", ESTADISTICAS_TEXTOS.SIN_DATOS));
  }

  return pantalla;
}
