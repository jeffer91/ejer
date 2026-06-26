/*
  Nombre completo: stats.controller.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.controller.js

  Función o funciones:
    - Montar la pantalla Stats del módulo Entrenamiento.
    - Mostrar un dashboard inicial compacto de rendimiento.
    - Preparar el espacio para conectar datos locales en el siguiente bloque.

  Se conecta con:
    - src/features/entrenamiento/stats/stats.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoStatsView } from "./stats.view.js";

export function crearEntrenamientoStatsController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoStatsView());
  }

  return {
    montar
  };
}
