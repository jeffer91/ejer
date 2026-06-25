/*
  Nombre completo: historial.controller.js
  Ruta o ubicación: src/modules/registro/historial/historial.controller.js

  Función o funciones:
    - Montar la pantalla Historial.
    - Controlar acciones de editar, borrar y ver cambios.
    - Pedir confirmación antes de enviar registros a papelera.
    - Actualizar la vista después de cada cambio.

  Se conecta con:
    - src/modules/registro/historial/historial.service.js
    - src/modules/registro/historial/historial.view.js
    - src/modules/registro/historial/historial.constants.js
    - src/app/app-router.js
*/

import { HISTORIAL_ACCIONES, HISTORIAL_LABELS, HISTORIAL_TEXTOS } from "./historial.constants.js";
import { formatearCambio } from "./historial.formatter.js";
import { crearHistorialService } from "./historial.service.js";
import { crearHistorialView } from "./historial.view.js";

const CAMPOS_MEDIDAS = ["cinturaCm", "abdomenCm", "pechoCm", "brazoCm", "piernaCm", "caderaCm"];

function pedirNuevoPeso(registro) {
  return window.prompt("Escribe el nuevo peso:", registro.datos?.pesoKg || "");
}

function pedirNuevasMedidas(registro) {
  const datos = {};

  CAMPOS_MEDIDAS.forEach((campo) => {
    const actual = registro.datos?.[campo] ?? "";
    const valor = window.prompt(`${HISTORIAL_LABELS[campo]}:`, actual);

    if (valor !== null && String(valor).trim() !== "") {
      datos[campo] = valor;
    }
  });

  return datos;
}

export function crearHistorialController() {
  const service = crearHistorialService();
  let contenedorActual = null;

  function refrescar() {
    if (contenedorActual) {
      montar(contenedorActual);
    }
  }

  function editarRegistro(registroId) {
    const registro = service.obtenerRegistro(registroId);

    if (!registro) {
      window.alert("No se encontró el registro.");
      return;
    }

    const resultado = registro.tipo === "peso"
      ? service.editarPeso(registroId, pedirNuevoPeso(registro))
      : service.editarMedidas(registroId, pedirNuevasMedidas(registro));

    window.alert(resultado.mensaje || HISTORIAL_TEXTOS.EDITADO_OK);

    if (resultado.ok) {
      refrescar();
    }
  }

  function borrarRegistro(registroId) {
    const confirmado = window.confirm(HISTORIAL_TEXTOS.CONFIRMAR_BORRAR);

    if (!confirmado) {
      return;
    }

    const resultado = service.enviarAPapelera(registroId);
    window.alert(resultado.mensaje || HISTORIAL_TEXTOS.BORRADO_OK);
    refrescar();
  }

  function verCambios(registroId) {
    const cambios = service.obtenerCambios(registroId);

    if (!cambios.length) {
      window.alert(HISTORIAL_TEXTOS.SIN_CAMBIOS);
      return;
    }

    window.alert(cambios.map(formatearCambio).join("\n"));
  }

  function controlarClick(evento) {
    const boton = evento.target.closest("[data-action]");

    if (!boton) {
      return;
    }

    const accion = boton.dataset.action;
    const registroId = boton.dataset.id;

    if (accion === HISTORIAL_ACCIONES.EDITAR) {
      editarRegistro(registroId);
    }

    if (accion === HISTORIAL_ACCIONES.BORRAR) {
      borrarRegistro(registroId);
    }

    if (accion === HISTORIAL_ACCIONES.CAMBIOS) {
      verCambios(registroId);
    }
  }

  function montar(contenedor) {
    contenedorActual = contenedor;
    const registros = service.listarRegistros();
    const vista = crearHistorialView(registros);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);
    vista.lista.addEventListener("click", controlarClick);
  }

  return {
    montar
  };
}
