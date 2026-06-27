/*
  Nombre completo: rutinas.controller.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.controller.js

  Función o funciones:
    - Montar la pantalla Rutinas del módulo Entrenamiento.
    - Crear rutinas reales con datos del formulario.
    - Editar, duplicar, activar, archivar y restaurar rutinas guardadas.

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
      onGuardar: (datos) => refrescar(service.crearDesdeFormulario(datos)),
      onActivar: (rutinaId) => refrescar(service.activar(rutinaId)),
      onEditarNombre: (rutinaId, datos) => refrescar(service.editarNombre(rutinaId, datos)),
      onActualizarPlan: (rutinaId, datos) => refrescar(service.actualizarDesdeFormulario(rutinaId, datos)),
      onDuplicar: (rutinaId) => refrescar(service.duplicar(rutinaId)),
      onArchivar: (rutinaId) => refrescar(service.archivar(rutinaId)),
      onRestaurar: (rutinaId) => refrescar(service.restaurar(rutinaId))
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
