import { ACTIVIDAD_ROUTES } from "../actividad.routes.js";
import { crearActividadService } from "../actividad.service.js";
import { crearActividadResumenView } from "./resumen.view.js";

export function crearActividadResumenController({ alNavegar } = {}) {
  const service = crearActividadService();

  function montar(contenedor) {
    const resumen = service.obtenerResumen();
    const vista = crearActividadResumenView(resumen);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista);

    vista.querySelectorAll("[data-ruta-destino]").forEach((boton) => {
      boton.addEventListener("click", () => {
        if (typeof alNavegar === "function") {
          alNavegar(boton.dataset.rutaDestino || ACTIVIDAD_ROUTES.REGISTRO);
        }
      });
    });
  }

  return { montar };
}
