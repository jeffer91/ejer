/*
  Nombre completo: diario.controller.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.controller.js

  Función o funciones:
    - Montar la pantalla Diario del módulo Entrenamiento.
    - Cargar la rutina activa del día.
    - Iniciar, guardar progreso y completar sesiones con detalle.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.service.js
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearDiarioService } from "./diario.service.js";
import { crearEntrenamientoDiarioView } from "./diario.view.js";

export function crearEntrenamientoDiarioController() {
  const service = crearDiarioService();
  let contenedorActual = null;
  let mensajeActual = null;

  function refrescar(mensaje = mensajeActual) {
    if (!contenedorActual) return;

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";
    contenedorActual.appendChild(crearEntrenamientoDiarioView({
      diario: service.obtenerDiario(),
      mensaje,
      onIniciar: () => refrescar(service.iniciarSesion()),
      onGuardarProgreso: (datos) => refrescar(service.guardarProgreso(datos)),
      onCompletar: (datos) => refrescar(service.completarSesion(datos))
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
