/*
  Nombre completo: registro.module.js
  Ruta o ubicación: src/modules/registro/registro.module.js

  Función o funciones:
    - Ser la entrada central del módulo Registro.
    - Unir service, estado y configuración del módulo.
    - Dejar preparado el módulo para ingreso, estadísticas, historial, perfil y objetivo.

  Se conecta con:
    - src/modules/registro/registro.constants.js
    - src/modules/registro/registro.service.js
    - src/modules/registro/registro.state.js
*/

import { REGISTRO_MODULO } from "./registro.constants.js";
import { crearRegistroService } from "./registro.service.js";
import { crearEstadoRegistroInicial } from "./registro.state.js";

export function crearRegistroModule() {
  const service = crearRegistroService();

  function obtenerInfoModulo() {
    return {
      ...REGISTRO_MODULO,
      carpetasInternas: [
        "ingreso",
        "estadisticas",
        "historial",
        "perfil",
        "objetivo",
        "medidas"
      ]
    };
  }

  function obtenerEstadoInicial() {
    return crearEstadoRegistroInicial();
  }

  function obtenerEstadoActual() {
    return service.obtenerEstado();
  }

  return {
    obtenerInfoModulo,
    obtenerEstadoInicial,
    obtenerEstadoActual,
    service
  };
}
