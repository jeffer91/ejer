/*
  Nombre completo: rutinas.controller.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.controller.js

  Función o funciones:
    - Montar la pantalla Rutinas del módulo Entrenamiento.
    - Preparar el formulario base para crear planes.
    - Dejar lista la vista para guardado local en el siguiente bloque.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoRutinasView } from "./rutinas.view.js";

export function crearEntrenamientoRutinasController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoRutinasView());
  }

  return {
    montar
  };
}
