/*
  Nombre completo: ajustes.controller.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.controller.js

  Función o funciones:
    - Montar la pantalla Ajustes del módulo Entrenamiento.
    - Guardar ajustes locales de Gemini, IA y voz automática.
    - Probar conexión Gemini y voz del sistema.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.service.js
    - src/features/entrenamiento/ajustes/ajustes.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearAjustesEntrenamientoService } from "./ajustes.service.js";
import { crearEntrenamientoAjustesView } from "./ajustes.view.js";

export function crearEntrenamientoAjustesController() {
  const service = crearAjustesEntrenamientoService();
  let contenedorActual = null;
  let mensajeActual = null;

  function refrescar(mensaje = mensajeActual) {
    if (!contenedorActual) return;

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";
    contenedorActual.appendChild(crearEntrenamientoAjustesView({
      vista: service.obtenerVista(),
      mensaje,
      onGuardar: (datos) => refrescar(service.guardarDesdeFormulario(datos)),
      onBorrarKey: () => refrescar(service.borrarGeminiKey()),
      onProbarVoz: () => refrescar(service.probarVoz()),
      onProbarGemini: async () => {
        refrescar({ ok: true, mensaje: "Probando conexión con Gemini..." });
        const resultado = await service.probarGemini();
        refrescar(resultado);
      }
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
