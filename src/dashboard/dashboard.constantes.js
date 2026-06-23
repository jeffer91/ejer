/*
  Nombre completo: dashboard.constantes.js
  Ruta o ubicación: src/dashboard/dashboard.constantes.js

  Función:
    - Centralizar etiquetas, límites visuales y rutas rápidas del dashboard.
    - Mantener el tablero minimalista y consistente.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/dashboard/dashboard.alertas.service.js
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

export const DASHBOARD_LIMITES = Object.freeze({
  maxEntrenamientosRecientes: 5,
  maxPuntosGrafica: 8,
  metaSemanalEntrenos: 4,
  energiaBaja: 2,
  cumplimientoBueno: 70
});

export const DASHBOARD_ACCIONES_RAPIDAS = Object.freeze([
  {
    texto: "Entrenar",
    nav: "entrenar",
    tipo: "principal"
  },
  {
    texto: "Guiado",
    nav: "guiado",
    tipo: "secundario"
  },
  {
    texto: "Rutinas",
    nav: "rutinas",
    tipo: "secundario"
  },
  {
    texto: "Medidas",
    nav: "medidas",
    tipo: "secundario"
  }
]);

export const DASHBOARD_TITULOS = Object.freeze({
  inicio: "Panel de hoy",
  estadisticas: "Tablero visual",
  constancia: "Constancia",
  actividad: "Actividad",
  energia: "Energía",
  progreso: "Progreso",
  rutina: "Rutina"
});
