/*
  Nombre completo: hit.controller.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.controller.js

  Función o funciones:
    - Montar la pantalla HIT del módulo Entrenamiento.
    - Preparar la base visual para intervalos y cardio simple.
    - Dejar lista la pantalla para temporizador y registro en próximos bloques.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoHitView } from "./hit.view.js";

export function crearEntrenamientoHitController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoHitView());
  }

  return {
    montar
  };
}
