/*
  Nombre completo: hoy.service.js
  Ruta o ubicacion: src/features/control-corporal/hoy/hoy.service.js

  Funcion o funciones:
    - Leer el estado local de Control corporal.
    - Reutilizar los calculos de estadisticas sin duplicarlos.
    - Construir un resumen simple para la pantalla Hoy.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/estadisticas/estadisticas.calculations.js
    - src/features/control-corporal/hoy/hoy.rules.js
    - src/features/control-corporal/hoy/hoy.controller.js
*/

import { crearRegistroService } from "../registro.service.js";
import { construirResumenEstadisticas } from "../estadisticas/estadisticas.calculations.js";
import { construirResumenHoy } from "./hoy.rules.js";

export function crearHoyService(registroService = crearRegistroService()) {
  function obtenerResumen() {
    const estado = registroService.obtenerEstado();
    const estadisticas = construirResumenEstadisticas(estado);

    return construirResumenHoy({
      estado,
      estadisticas
    });
  }

  return {
    obtenerResumen
  };
}
