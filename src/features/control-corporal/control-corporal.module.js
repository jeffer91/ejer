import { CONTROL_CORPORAL_ROUTES, esRutaControlCorporal } from "./control-corporal.routes.js";
import { crearHoyController } from "./hoy/hoy.controller.js";
import { crearEstadisticasController } from "./estadisticas/estadisticas.controller.js";
import { crearIngresoController } from "./registro/registro.controller.js";
import { crearGuiaMedidasController } from "./guia-medidas/guia-medidas.controller.js";
import { crearHistorialController } from "./historial/historial.controller.js";

export { CONTROL_CORPORAL_ROUTES, esRutaControlCorporal };

export function montarPantallaControlCorporal(rutaId, contenedor, opciones = {}) {
  if (rutaId === CONTROL_CORPORAL_ROUTES.HOY) {
    const controller = crearHoyController({
      alNavegar: opciones.alNavegar
    });
    controller.montar(contenedor);
    return controller;
  }

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

  if (rutaId === CONTROL_CORPORAL_ROUTES.GUIA_MEDIDAS) {
    const controller = crearGuiaMedidasController();
    controller.montar(contenedor);
    return controller;
  }

  if (rutaId === CONTROL_CORPORAL_ROUTES.HISTORIAL) {
    const controller = crearHistorialController();
    controller.montar(contenedor);
    return controller;
  }

  const controller = crearHoyController({
    alNavegar: opciones.alNavegar
  });
  controller.montar(contenedor);
  return controller;
}
