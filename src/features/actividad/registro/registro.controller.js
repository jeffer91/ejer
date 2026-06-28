import { ACTIVIDAD_ROUTES } from "../actividad.routes.js";
import { crearActividadService } from "../actividad.service.js";
import { crearActividadRegistroView, leerFormularioActividad, mostrarErroresActividad, mostrarMensajeActividad } from "./registro.view.js";

export function crearActividadRegistroController({ alNavegar } = {}) {
  const service = crearActividadService();

  function montar(contenedor) {
    const vista = crearActividadRegistroView();

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const resultado = service.guardarActividad(leerFormularioActividad(vista.formulario));
      mostrarErroresActividad(vista.formulario, resultado.errores || {});
      mostrarMensajeActividad(vista.mensaje, resultado.mensaje, resultado.ok);

      if (resultado.ok) {
        vista.formulario.reset();
        vista.fechaInput.value = new Date().toISOString().slice(0, 10);
      }
    });

    vista.volverBoton.addEventListener("click", () => {
      if (typeof alNavegar === "function") {
        alNavegar(ACTIVIDAD_ROUTES.RESUMEN);
      }
    });
  }

  return { montar };
}
