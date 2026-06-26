/*
  Nombre completo: diario.controller.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.controller.js

  Función o funciones:
    - Montar la pantalla Diario del módulo Entrenamiento.
    - Leer la rutina activa y el día correspondiente desde el service.
    - Preparar la vista de rutina diaria con datos locales.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearEntrenamientoDiarioView } from "./diario.view.js";

export function crearEntrenamientoDiarioController() {
  const service = crearEntrenamientoService();

  function montar(contenedor) {
    const rutinaDelDia = service.obtenerRutinaDelDia();
    const resumen = service.obtenerResumen();
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoDiarioView({ rutinaDelDia, resumen }));
  }

  return {
    montar
  };
}
