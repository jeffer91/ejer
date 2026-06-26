/*
  Nombre completo: estadisticas.controller.js
  Ruta o ubicación: src/features/control-corporal/estadisticas/estadisticas.controller.js

  Función o funciones:
    - Montar la pantalla principal de Estadísticas dentro de Control corporal.
    - Pedir el resumen a estadisticas.service.js.
    - Renderizar tarjetas, barra de objetivo, gráfico y medidas.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.service.js
    - src/features/control-corporal/estadisticas/estadisticas.view.js
    - src/features/control-corporal/control-corporal.module.js
*/

import { crearEstadisticasService } from "./estadisticas.service.js";
import { crearEstadisticasView } from "./estadisticas.view.js";

export function crearEstadisticasController() {
  const service = crearEstadisticasService();

  function montar(contenedor) {
    const resumen = service.obtenerResumen();
    const vista = crearEstadisticasView(resumen);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista);
  }

  return {
    montar
  };
}
