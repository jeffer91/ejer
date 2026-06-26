/*
  Nombre completo: registro.controller.js
  Ruta o ubicación: src/features/control-corporal/registro/registro.controller.js

  Función o funciones:
    - Montar la pantalla de Registro / Ingreso dentro de Control corporal.
    - Validar y guardar peso diario.
    - Validar y guardar medidas semanales.
    - Pedir confirmación cuando hay cambios poco comunes.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.view.js
    - src/features/control-corporal/registro/ingreso.validator.js
    - src/features/control-corporal/registro.service.js
*/

import { crearRegistroService } from "../registro.service.js";
import { leerFormulario, crearIngresoView, mostrarErroresIngreso, mostrarMensajeIngreso } from "./ingreso.view.js";
import { validarMedidasIngreso, validarPesoIngreso } from "./ingreso.validator.js";

function confirmarAlertas(alertas) {
  if (!alertas || alertas.length === 0) {
    return true;
  }

  return window.confirm(`Hay datos para revisar:\n\n${alertas.join("\n")}\n\n¿Quieres guardar de todos modos?`);
}

export function crearIngresoController({ alGuardar } = {}) {
  const service = crearRegistroService();

  function guardarPeso(vista) {
    const estado = service.obtenerEstado();
    const datos = leerFormulario(vista.pesoForm);
    const validacion = validarPesoIngreso(datos, estado.registros);

    mostrarErroresIngreso(vista.pesoForm, validacion.errores);

    if (!validacion.ok) {
      mostrarMensajeIngreso(vista.pesoMensaje, "Revisa el peso antes de guardar.", false);
      return;
    }

    if (!confirmarAlertas(validacion.alertas)) {
      mostrarMensajeIngreso(vista.pesoMensaje, "Guardado cancelado para revisar el dato.", false);
      return;
    }

    const resultado = service.guardarPeso(validacion.datosLimpios);
    mostrarMensajeIngreso(vista.pesoMensaje, resultado.mensaje, resultado.ok);

    if (resultado.ok) {
      vista.pesoForm.reset();
      if (typeof alGuardar === "function") alGuardar(resultado);
    }
  }

  function guardarMedidas(vista) {
    const estado = service.obtenerEstado();
    const datos = leerFormulario(vista.medidasForm);
    const validacion = validarMedidasIngreso(datos, estado.registros);

    mostrarErroresIngreso(vista.medidasForm, validacion.errores);

    if (!validacion.ok) {
      mostrarMensajeIngreso(vista.medidasMensaje, validacion.errores.general || "Revisa las medidas antes de guardar.", false);
      return;
    }

    if (!confirmarAlertas(validacion.alertas)) {
      mostrarMensajeIngreso(vista.medidasMensaje, "Guardado cancelado para revisar los datos.", false);
      return;
    }

    const resultado = service.guardarMedidas(validacion.datosLimpios);
    mostrarMensajeIngreso(vista.medidasMensaje, resultado.mensaje, resultado.ok);

    if (resultado.ok) {
      vista.medidasForm.reset();
      const fecha = vista.medidasForm.querySelector("input[name='fecha']");
      if (fecha) fecha.value = new Date().toISOString().slice(0, 10);
      if (typeof alGuardar === "function") alGuardar(resultado);
    }
  }

  function montar(contenedor) {
    const vista = crearIngresoView();

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.pesoForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarPeso(vista);
    });

    vista.medidasForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarMedidas(vista);
    });
  }

  return {
    montar
  };
}
