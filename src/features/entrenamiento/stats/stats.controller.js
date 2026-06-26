/*
  Nombre completo: stats.controller.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.controller.js

  Función o funciones:
    - Montar la pantalla Stats del módulo Entrenamiento.
    - Leer el dashboard local desde stats.service.js.
    - Mostrar estadísticas compactas de rendimiento, racha, semana y alertas.

  Se conecta con:
    - src/features/entrenamiento/stats/stats.service.js
    - src/features/entrenamiento/stats/stats.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoStatsService } from "./stats.service.js";
import { crearEntrenamientoStatsView } from "./stats.view.js";

export function crearEntrenamientoStatsController() {
  const service = crearEntrenamientoStatsService();

  function montar(contenedor) {
    const dashboard = service.obtenerDashboard();
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoStatsView(dashboard));
  }

  return {
    montar
  };
}
