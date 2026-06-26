/*
  Nombre completo: stats.controller.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.controller.js

  Función o funciones:
    - Montar la pantalla Stats del módulo Entrenamiento.
    - Leer el resumen local desde entrenamiento.service.js.
    - Mostrar un dashboard compacto de rendimiento.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/stats/stats.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearEntrenamientoStatsView } from "./stats.view.js";

export function crearEntrenamientoStatsController() {
  const service = crearEntrenamientoService();

  function montar(contenedor) {
    const resumen = service.obtenerResumen();
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoStatsView(resumen));
  }

  return {
    montar
  };
}
