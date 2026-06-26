/*
  Nombre completo: historial.view.js
  Ruta o ubicación: src/features/control-corporal/historial/historial.view.js

  Función o funciones:
    - Construir la pantalla visual de Historial.
    - Mostrar registros en tarjetas compactas por fecha.
    - Crear botones para editar, borrar y ver cambios.
    - Mantener la vista sin lógica de guardado.

  Se conecta con:
    - src/features/control-corporal/historial/historial.controller.js
    - src/features/control-corporal/historial/historial.constants.js
    - src/features/control-corporal/historial/historial.css
*/

import { HISTORIAL_ACCIONES, HISTORIAL_TEXTOS } from "./historial.constants.js";
import { formatearFecha } from "./historial.formatter.js";
import "./historial.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null) {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearBoton(accion, texto, registroId) {
  const boton = crearElemento("button", `historial-button historial-button--${accion}`, texto);
  boton.type = "button";
  boton.dataset.action = accion;
  boton.dataset.id = registroId;
  return boton;
}

function crearTarjetaRegistro(registro) {
  const tarjeta = crearElemento("article", "historial-card");
  const cabecera = crearElemento("div", "historial-card__header");
  const bloqueTitulo = crearElemento("div", "");
  const acciones = crearElemento("div", "historial-card__actions");

  bloqueTitulo.appendChild(crearElemento("h3", "", registro.titulo));
  bloqueTitulo.appendChild(crearElemento("p", "historial-card__date", formatearFecha(registro.fecha)));

  acciones.appendChild(crearBoton(HISTORIAL_ACCIONES.EDITAR, HISTORIAL_TEXTOS.EDITAR, registro.id));
  acciones.appendChild(crearBoton(HISTORIAL_ACCIONES.CAMBIOS, HISTORIAL_TEXTOS.CAMBIOS, registro.id));
  acciones.appendChild(crearBoton(HISTORIAL_ACCIONES.BORRAR, HISTORIAL_TEXTOS.BORRAR, registro.id));

  cabecera.appendChild(bloqueTitulo);
  cabecera.appendChild(acciones);

  tarjeta.appendChild(cabecera);
  tarjeta.appendChild(crearElemento("p", "historial-card__summary", registro.resumen));

  return tarjeta;
}

export function crearHistorialView(registros) {
  const pantalla = crearElemento("section", "historial-screen");
  const header = crearElemento("div", "historial-header");
  const lista = crearElemento("div", "historial-list");

  header.appendChild(crearElemento("p", "historial-kicker", "Registros guardados"));
  header.appendChild(crearElemento("h2", "", HISTORIAL_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", HISTORIAL_TEXTOS.SUBTITULO));

  if (!registros || registros.length === 0) {
    lista.appendChild(crearElemento("p", "historial-empty", HISTORIAL_TEXTOS.VACIO));
  } else {
    registros.forEach((registro) => {
      lista.appendChild(crearTarjetaRegistro(registro));
    });
  }

  pantalla.appendChild(header);
  pantalla.appendChild(lista);

  return {
    pantalla,
    lista
  };
}
