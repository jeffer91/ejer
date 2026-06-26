/*
  Nombre completo: ajustes.controller.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.controller.js

  Función o funciones:
    - Montar la pantalla Ajustes del módulo Entrenamiento.
    - Leer ajustes locales de Gemini, IA y voz automática.
    - Preparar guardado local seguro para próximos bloques visuales.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/ajustes/ajustes.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearEntrenamientoAjustesView } from "./ajustes.view.js";

export function crearEntrenamientoAjustesController() {
  const service = crearEntrenamientoService();

  function montar(contenedor) {
    const estado = service.obtenerEstado();
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoAjustesView({ ajustes: estado.ajustes }));
  }

  return {
    montar
  };
}
