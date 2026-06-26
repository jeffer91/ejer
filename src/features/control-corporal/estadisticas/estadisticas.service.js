/*
  Nombre completo: estadisticas.service.js
  Ruta o ubicación: src/features/control-corporal/estadisticas/estadisticas.service.js

  Función o funciones:
    - Leer los datos guardados del módulo Control corporal.
    - Construir el resumen que necesita la pantalla Estadísticas.
    - Mantener cálculos separados de la vista.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/estadisticas/estadisticas.calculations.js
    - src/features/control-corporal/estadisticas/estadisticas.controller.js
*/

import { crearRegistroService } from "../registro.service.js";
import { construirResumenEstadisticas } from "./estadisticas.calculations.js";

export function crearEstadisticasService(registroService = crearRegistroService()) {
  function obtenerResumen() {
    const estado = registroService.obtenerEstado();
    return construirResumenEstadisticas(estado);
  }

  return {
    obtenerResumen
  };
}
