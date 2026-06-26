/*
  Nombre completo: stats.view.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.view.js

  Función o funciones:
    - Construir la pantalla visual Stats de Entrenamiento.
    - Mostrar un resumen inicial compacto y seguro.
    - Dejar lista la pantalla para datos locales reales.

  Se conecta con:
    - src/features/entrenamiento/stats/stats.controller.js
    - src/features/entrenamiento/stats/stats.css
*/

import "./stats.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearTarjeta(label, valor, detalle, modificador = "") {
  const tarjeta = crearElemento("article", `entreno-stats-card ${modificador}`.trim());
  tarjeta.appendChild(crearElemento("span", "entreno-stats-card__label", label));
  tarjeta.appendChild(crearElemento("strong", "entreno-stats-card__value", valor));
  tarjeta.appendChild(crearElemento("small", "entreno-stats-card__detail", detalle));
  return tarjeta;
}

export function crearEntrenamientoStatsView() {
  const pantalla = crearElemento("section", "entreno-stats-screen");
  const header = crearElemento("div", "entreno-stats-header");
  const grid = crearElemento("div", "entreno-stats-grid");
  const panel = crearElemento("section", "entreno-stats-panel");

  header.appendChild(crearElemento("p", "entreno-stats-kicker", "Módulo Entrenamiento"));
  header.appendChild(crearElemento("h2", "", "Stats"));
  header.appendChild(crearElemento("p", "", "Resumen compacto para controlar actividad, descanso y progreso."));

  grid.appendChild(crearTarjeta("Días activos", "0", "Pendiente de datos", "entreno-stats-card--ok"));
  grid.appendChild(crearTarjeta("Descanso", "0", "Pendiente de datos", "entreno-stats-card--info"));
  grid.appendChild(crearTarjeta("Ejercicios", "0", "Pendiente de datos", "entreno-stats-card--accent"));
  grid.appendChild(crearTarjeta("Tiempo", "0 min", "Pendiente de datos", "entreno-stats-card--ok"));
  grid.appendChild(crearTarjeta("Cardio", "0", "Pendiente de datos", "entreno-stats-card--info"));
  grid.appendChild(crearTarjeta("Estado", "Base", "Lista para conectar", "entreno-stats-card--accent"));

  panel.appendChild(crearElemento("h3", "", "Estado del bloque"));
  panel.appendChild(crearElemento("p", "entreno-stats-note", "Pantalla creada. En el siguiente bloque se conectará el guardado local."));

  pantalla.appendChild(header);
  pantalla.appendChild(grid);
  pantalla.appendChild(panel);

  return pantalla;
}
