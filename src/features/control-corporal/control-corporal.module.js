/*
  Nombre completo: control-corporal.module.js
  Ruta o ubicación: src/features/control-corporal/control-corporal.module.js

  Función o funciones:
    - Concentrar el montaje de las pantallas del módulo Control corporal.
    - Entregar una entrada única para Estadísticas, Registro e Historial.
    - Evitar que app-router.js dependa directamente de carpetas internas antiguas.

  Se conecta con:
    - src/app/app-router.js
    - src/features/control-corporal/control-corporal.routes.js
    - src/features/control-corporal/estadisticas/estadisticas.controller.js
    - src/features/control-corporal/registro/registro.controller.js
    - src/features/control-corporal/historial/historial.controller.js
*/

import { CONTROL_CORPORAL_ROUTES, esRutaControlCorporal } from "./control-corporal.routes.js";
import { crearEstadisticasController } from "./estadisticas/estadisticas.controller.js";
import { crearIngresoController } from "./registro/registro.controller.js";
import { crearHistorialController } from "./historial/historial.controller.js";

export { CONTROL_CORPORAL_ROUTES, esRutaControlCorporal };

export function montarPantallaControlCorporal(rutaId, contenedor, opciones = {}) {
  if (rutaId === CONTROL_CORPORAL_ROUTES.ESTADISTICAS) {
    const controller = crearEstadisticasController();
    controller.montar(contenedor);
    return controller;
  }

  if (rutaId === CONTROL_CORPORAL_ROUTES.REGISTRO) {
    const controller = crearIngresoController({
      alGuardar: opciones.alGuardar
    });

    controller.montar(contenedor);
    return controller;
  }

  if (rutaId === CONTROL_CORPORAL_ROUTES.HISTORIAL) {
    const controller = crearHistorialController();
    controller.montar(contenedor);
    return controller;
  }

  const controller = crearEstadisticasController();
  controller.montar(contenedor);
  return controller;
}
