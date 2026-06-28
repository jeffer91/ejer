import { ACTIVIDAD_ROUTES, esRutaActividad } from "./actividad.routes.js";
import { crearDispositivosController } from "./dispositivos/dispositivos.controller.js";
import { crearActividadResumenController } from "./resumen/resumen.controller.js";
import { crearActividadRegistroController } from "./registro/registro.controller.js";

export { ACTIVIDAD_ROUTES, esRutaActividad };

export function montarPantallaActividad(rutaId, contenedor, opciones = {}) {
  if (rutaId === ACTIVIDAD_ROUTES.REGISTRO) {
    const controller = crearActividadRegistroController({
      alNavegar: opciones.alNavegar
    });
    controller.montar(contenedor);
    return controller;
  }

  if (rutaId === ACTIVIDAD_ROUTES.DISPOSITIVOS) {
    const controller = crearDispositivosController();
    controller.montar(contenedor);
    return controller;
  }

  const controller = crearActividadResumenController({
    alNavegar: opciones.alNavegar
  });
  controller.montar(contenedor);
  return controller;
}
