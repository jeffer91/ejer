/*
  Nombre completo: actualizaciones.controller.js
  Ruta o ubicación: src/modules/actualizaciones/actualizaciones.controller.js

  Función o funciones:
    - Coordinar la pantalla de actualizaciones de FitJeff.
    - Cargar estado inicial del actualizador.
    - Ejecutar búsqueda, descarga y reinicio para instalar.
    - Escuchar eventos de progreso enviados desde Electron.

  Se conecta con:
    - src/modules/actualizaciones/actualizaciones.service.js
    - src/modules/actualizaciones/actualizaciones.view.js
    - src/modules/actualizaciones/actualizaciones.css
    - electron/preload.cjs
*/

import "./actualizaciones.css";
import { crearActualizacionesService } from "./actualizaciones.service.js";
import { crearActualizacionesView } from "./actualizaciones.view.js";

export function crearActualizacionesController({ service = crearActualizacionesService() } = {}) {
  let view = null;
  let cancelarEscucha = () => {};

  async function ejecutarAccion(accion) {
    if (!view || typeof accion !== "function") {
      return;
    }

    view.marcarOcupado(true);

    try {
      const estado = await accion();
      view.renderizarEstado(estado);
    } catch (error) {
      view.renderizarEstado({
        ...service.obtenerEstadoActual(),
        estado: "error",
        mensaje: error?.message || "No se pudo completar la acción de actualización.",
        puedeBuscar: true,
        puedeDescargar: false,
        puedeReiniciar: false,
        actualizadoEn: new Date().toISOString()
      });
    }
  }

  function montar(contenedor) {
    view = crearActualizacionesView({
      alBuscar: () => ejecutarAccion(service.buscarActualizacion),
      alDescargar: () => ejecutarAccion(service.descargarActualizacion),
      alReiniciar: () => ejecutarAccion(service.reiniciarParaActualizar)
    });

    view.montar(contenedor);
    view.renderizarEstado(service.obtenerEstadoActual());

    cancelarEscucha = service.escucharEventos((estado) => {
      if (view) {
        view.renderizarEstado(estado);
      }
    });

    ejecutarAccion(service.cargarEstadoInicial);
  }

  function desmontar() {
    cancelarEscucha();
    cancelarEscucha = () => {};
    view = null;
  }

  return {
    montar,
    desmontar
  };
}
