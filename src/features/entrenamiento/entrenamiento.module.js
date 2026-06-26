/*
  Nombre completo: entrenamiento.module.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.module.js

  Función o funciones:
    - Concentrar el montaje de las pantallas del módulo Entrenamiento.
    - Entregar una entrada única para Stats, Diario, Rutinas, HIT y Ajustes.
    - Evitar que app-router.js dependa directamente de las carpetas internas.

  Se conecta con:
    - src/features/features.registry.js
    - src/features/entrenamiento/entrenamiento.routes.js
    - src/features/entrenamiento/stats/stats.controller.js
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/hit/hit.controller.js
    - src/features/entrenamiento/ajustes/ajustes.controller.js
*/

import { ENTRENAMIENTO_ROUTES, esRutaEntrenamiento } from "./entrenamiento.routes.js";
import { crearEntrenamientoStatsController } from "./stats/stats.controller.js";
import { crearEntrenamientoDiarioController } from "./diario/diario.controller.js";
import { crearEntrenamientoRutinasController } from "./rutinas/rutinas.controller.js";
import { crearEntrenamientoHitController } from "./hit/hit.controller.js";
import { crearEntrenamientoAjustesController } from "./ajustes/ajustes.controller.js";

export { ENTRENAMIENTO_ROUTES, esRutaEntrenamiento };

function montarController(controller, contenedor) {
  controller.montar(contenedor);
  return controller;
}

export function montarPantallaEntrenamiento(rutaId, contenedor, opciones = {}) {
  if (rutaId === ENTRENAMIENTO_ROUTES.STATS) {
    return montarController(crearEntrenamientoStatsController(opciones), contenedor);
  }

  if (rutaId === ENTRENAMIENTO_ROUTES.DIARIO) {
    return montarController(crearEntrenamientoDiarioController(opciones), contenedor);
  }

  if (rutaId === ENTRENAMIENTO_ROUTES.RUTINAS) {
    return montarController(crearEntrenamientoRutinasController(opciones), contenedor);
  }

  if (rutaId === ENTRENAMIENTO_ROUTES.HIT) {
    return montarController(crearEntrenamientoHitController(opciones), contenedor);
  }

  if (rutaId === ENTRENAMIENTO_ROUTES.AJUSTES) {
    return montarController(crearEntrenamientoAjustesController(opciones), contenedor);
  }

  return montarController(crearEntrenamientoStatsController(opciones), contenedor);
}
