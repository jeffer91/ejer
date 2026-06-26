/*
  Nombre completo: stats.view.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.view.js

  Función o funciones:
    - Construir la pantalla visual Stats de Entrenamiento.
    - Mostrar un resumen local compacto y seguro.
    - Recibir datos desde entrenamiento.service.js.

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

function crearTarjeta(label, valor, detalle, modificador = "") {
  const tarjeta = crearElemento("article", `entreno-stats-card ${modificador}`.trim());
  tarjeta.appendChild(crearElemento("span", "entreno-stats-card__label", label));
  tarjeta.appendChild(crearElemento("strong", "entreno-stats-card__value", valor));
  tarjeta.appendChild(crearElemento("small", "entreno-stats-card__detail", detalle));
  return tarjeta;
}

export function crearEntrenamientoStatsView(resumen = {}) {
  const pantalla = crearElemento("section", "entreno-stats-screen");
  const header = crearElemento("div", "entreno-stats-header");
  const grid = crearElemento("div", "entreno-stats-grid");
  const panel = crearElemento("section", "entreno-stats-panel");

  header.appendChild(crearElemento("p", "entreno-stats-kicker", "Módulo Entrenamiento"));
  header.appendChild(crearElemento("h2", "", "Stats"));
  header.appendChild(crearElemento("p", "", "Resumen compacto para controlar actividad, descanso y progreso."));

  grid.appendChild(crearTarjeta("Rutinas", resumen.totalRutinas ?? 0, `${resumen.rutinasActivas ?? 0} activa`, "entreno-stats-card--ok"));
  grid.appendChild(crearTarjeta("Sesiones", resumen.sesionesCompletadas ?? 0, `${resumen.sesionesHoy ?? 0} hoy`, "entreno-stats-card--info"));
  grid.appendChild(crearTarjeta("Ejercicios", resumen.ejerciciosCompletados ?? 0, "Completados", "entreno-stats-card--accent"));
  grid.appendChild(crearTarjeta("Series", resumen.seriesCompletadas ?? 0, `${resumen.repeticionesCompletadas ?? 0} repeticiones`, "entreno-stats-card--ok"));
  grid.appendChild(crearTarjeta("Tiempo", `${resumen.tiempoTotalMinutos ?? 0} min`, "Total registrado", "entreno-stats-card--info"));
  grid.appendChild(crearTarjeta("Cardio", resumen.cardioHoy ?? 0, `Cam ${resumen.caminatas ?? 0} / Bic ${resumen.bicicleta ?? 0}`, "entreno-stats-card--accent"));

  panel.appendChild(crearElemento("h3", "", "Conexión local"));
  panel.appendChild(crearElemento("p", "entreno-stats-note", `IA: ${resumen.iaActiva ? "activa" : "inactiva"} · Voz: ${resumen.vozActiva ? "activa" : "inactiva"} · Gemini: ${resumen.tieneGemini ? "configurado" : "pendiente"}`));

  pantalla.appendChild(header);
  pantalla.appendChild(grid);
  pantalla.appendChild(panel);

  return pantalla;
}
