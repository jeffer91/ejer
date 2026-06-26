/*
  Nombre completo: rutinas.controller.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.controller.js

  Función o funciones:
    - Montar la pantalla Rutinas del módulo Entrenamiento.
    - Leer rutinas locales desde entrenamiento.service.js.
    - Preparar el formulario base para crear planes.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearEntrenamientoRutinasView } from "./rutinas.view.js";

export function crearEntrenamientoRutinasController() {
  const service = crearEntrenamientoService();

  function montar(contenedor) {
    const estado = service.obtenerEstado();
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoRutinasView({ rutinas: estado.rutinas }));
  }

  return {
    montar
  };
}
