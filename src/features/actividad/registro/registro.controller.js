/*
  Nombre completo: registro.controller.js
  Ruta o ubicación: src/features/actividad/registro/registro.controller.js

  Función o funciones:
    - Montar la pantalla de registro manual de Actividad.
    - Guardar actividad diaria validada.
    - Detectar si una fecha ya tiene registro y cargarlo para edición.
    - Evitar duplicados diarios desde la interacción del usuario.

  Se conecta con:
    - src/features/actividad/actividad.service.js
    - src/features/actividad/actividad.constants.js
    - src/features/actividad/actividad.routes.js
    - src/features/actividad/registro/registro.view.js
*/

import { ACTIVIDAD_TEXTOS, fechaHoyISO } from "../actividad.constants.js";
import { ACTIVIDAD_ROUTES } from "../actividad.routes.js";
import { crearActividadService } from "../actividad.service.js";
import {
  crearActividadRegistroView,
  leerFormularioActividad,
  mostrarErroresActividad,
  mostrarMensajeActividad,
  rellenarFormularioActividad
} from "./registro.view.js";

export function crearActividadRegistroController({ alNavegar } = {}) {
  const service = crearActividadService();

  function montar(contenedor) {
    const vista = crearActividadRegistroView();

    function cargarActividadExistente() {
      const registro = service.obtenerActividadPorFecha(vista.fechaInput.value);
      rellenarFormularioActividad(vista, registro);
      mostrarErroresActividad(vista.formulario, {});

      if (registro) {
        mostrarMensajeActividad(vista.mensaje, ACTIVIDAD_TEXTOS.AVISO_EXISTE, true);
      } else {
        mostrarMensajeActividad(vista.mensaje, "", true);
      }
    }

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.fechaInput.addEventListener("change", cargarActividadExistente);

    vista.formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const resultado = service.guardarActividad(leerFormularioActividad(vista.formulario));
      mostrarErroresActividad(vista.formulario, resultado.errores || {});
      mostrarMensajeActividad(vista.mensaje, resultado.mensaje, resultado.ok);

      if (resultado.ok) {
        if (!resultado.actualizado) {
          vista.formulario.reset();
          vista.fechaInput.value = fechaHoyISO();
        }

        const registroActual = service.obtenerActividadPorFecha(vista.fechaInput.value);
        rellenarFormularioActividad(vista, registroActual);
      }
    });

    vista.volverBoton.addEventListener("click", () => {
      if (typeof alNavegar === "function") {
        alNavegar(ACTIVIDAD_ROUTES.RESUMEN);
      }
    });

    cargarActividadExistente();
  }

  return { montar };
}
