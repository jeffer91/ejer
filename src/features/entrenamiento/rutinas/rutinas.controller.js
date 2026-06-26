/*
  Nombre completo: rutinas.controller.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.controller.js

  Función o funciones:
    - Montar la pantalla Rutinas del módulo Entrenamiento.
    - Crear rutinas reales con datos del formulario.
    - Activar rutinas guardadas y refrescar la pantalla.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearRutinasService } from "./rutinas.service.js";
import { crearEntrenamientoRutinasView } from "./rutinas.view.js";

export function crearEntrenamientoRutinasController() {
  const service = crearRutinasService();
  let contenedorActual = null;
  let mensajeActual = null;

  function refrescar(mensaje = mensajeActual) {
    if (!contenedorActual) return;

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";
    contenedorActual.appendChild(crearEntrenamientoRutinasView({
      rutinas: service.obtenerRutinas(),
      mensaje,
      onGuardar: (datos) => {
        const resultado = service.crearDesdeFormulario(datos);
        refrescar(resultado);
      },
      onActivar: (rutinaId) => {
        const resultado = service.activar(rutinaId);
        refrescar(resultado);
      }
    }));
  }

  function montar(contenedor) {
    contenedorActual = contenedor;
    refrescar(null);
  }

  return {
    montar
  };
}
