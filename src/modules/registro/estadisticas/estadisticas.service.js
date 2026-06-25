/*
  Nombre completo: estadisticas.service.js
  Ruta o ubicación: src/modules/registro/estadisticas/estadisticas.service.js

  Función o funciones:
    - Leer los datos guardados del módulo Registro.
    - Construir el resumen que necesita la pantalla Estadísticas.
    - Mantener cálculos separados de la vista.

  Se conecta con:
    - src/modules/registro/registro.service.js
    - src/modules/registro/estadisticas/estadisticas.calculations.js
    - src/modules/registro/estadisticas/estadisticas.controller.js
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
