/*
  Nombre completo: stats.view.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.view.js

  Función o funciones:
    - Construir la pantalla visual Stats de Entrenamiento.
    - Mostrar tarjetas, barras, semana y alertas desde stats.service.js.
    - Mantener una interfaz compacta y clara.

  Se conecta con:
    - src/features/entrenamiento/stats/stats.controller.js
    - src/features/entrenamiento/stats/stats.css
*/

import "./stats.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearTarjeta({ label, valor, detalle, tipo }) {
  const tarjeta = crearElemento("article", `entreno-stats-card entreno-stats-card--${tipo || "info"}`);
  tarjeta.appendChild(crearElemento("span", "entreno-stats-card__label", label));
  tarjeta.appendChild(crearElemento("strong", "entreno-stats-card__value", valor));
  tarjeta.appendChild(crearElemento("small", "entreno-stats-card__detail", detalle));
  return tarjeta;
}

function crearBarra({ label, valor, detalle }) {
  const fila = crearElemento("article", "entreno-stats-bar");
  const top = crearElemento("div", "entreno-stats-bar__top");
  const track = crearElemento("div", "entreno-stats-bar__track");
  const fill = crearElemento("div", "entreno-stats-bar__fill");

  top.appendChild(crearElemento("strong", "", label));
  top.appendChild(crearElemento("span", "", `${valor}% · ${detalle}`));
  fill.style.width = `${valor}%`;
  track.appendChild(fill);
  fila.appendChild(top);
  fila.appendChild(track);
  return fila;
}

function crearDiaSemana(dia) {
  const item = crearElemento("article", "entreno-stats-day");
  const fechaCorta = String(dia.fecha || "").slice(5);
  const activo = Number(dia.tiempo || 0) > 0;

  if (activo) {
    item.classList.add("entreno-stats-day--active");
  }

  item.appendChild(crearElemento("strong", "", fechaCorta));
  item.appendChild(crearElemento("span", "", `${dia.tiempo || 0} min`));
  item.appendChild(crearElemento("small", "", `${dia.sesiones || 0} S · ${dia.cardio || 0} C`));
  return item;
}

function crearAlerta(alerta) {
  const item = crearElemento("article", `entreno-stats-alert entreno-stats-alert--${alerta.tipo || "info"}`);
  item.appendChild(crearElemento("span", "", alerta.texto));
  return item;
}

export function crearEntrenamientoStatsView(dashboard = {}) {
  const pantalla = crearElemento("section", "entreno-stats-screen");
  const header = crearElemento("div", "entreno-stats-header");
  const grid = crearElemento("div", "entreno-stats-grid");
  const panel = crearElemento("section", "entreno-stats-panel");
  const barras = crearElemento("div", "entreno-stats-bars");
  const semana = crearElemento("section", "entreno-stats-panel");
  const semanaGrid = crearElemento("div", "entreno-stats-week");
  const alertas = crearElemento("section", "entreno-stats-panel");
  const alertasGrid = crearElemento("div", "entreno-stats-alerts");
  const resumen = dashboard.resumen || {};

  header.appendChild(crearElemento("p", "entreno-stats-kicker", "Dashboard"));
  header.appendChild(crearElemento("h2", "", "Stats"));
  header.appendChild(crearElemento("p", "", `${dashboard.estadoGeneral || "Estado pendiente"} · IA ${resumen.iaActiva ? "activa" : "inactiva"} · Voz ${resumen.vozActiva ? "activa" : "inactiva"}`));

  (dashboard.tarjetas || []).forEach((tarjeta) => grid.appendChild(crearTarjeta(tarjeta)));

  panel.appendChild(crearElemento("h3", "", "Rendimiento semanal"));
  (dashboard.barras || []).forEach((barra) => barras.appendChild(crearBarra(barra)));
  panel.appendChild(barras);

  semana.appendChild(crearElemento("h3", "", "Últimos 7 días"));
  (dashboard.semana || []).forEach((dia) => semanaGrid.appendChild(crearDiaSemana(dia)));
  semana.appendChild(semanaGrid);

  alertas.appendChild(crearElemento("h3", "", "Alertas"));
  (dashboard.alertas || []).forEach((alerta) => alertasGrid.appendChild(crearAlerta(alerta)));
  alertas.appendChild(alertasGrid);

  pantalla.appendChild(header);
  pantalla.appendChild(grid);
  pantalla.appendChild(panel);
  pantalla.appendChild(semana);
  pantalla.appendChild(alertas);

  return pantalla;
}
