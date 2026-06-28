/*
  Nombre completo: registro.view.js
  Ruta o ubicación: src/features/actividad/registro/registro.view.js

  Función o funciones:
    - Construir la pantalla de registro manual de Actividad.
    - Leer pasos, bicicleta y nota desde el formulario.
    - Mostrar errores por campo.
    - Cargar un registro existente cuando el usuario selecciona una fecha ya guardada.
    - Mantener claro que guardar sobre una fecha existente actualiza el registro del día.

  Se conecta con:
    - src/features/actividad/registro/registro.controller.js
    - src/features/actividad/actividad.constants.js
    - src/features/actividad/registro/registro.css
*/

import { ACTIVIDAD_TEXTOS, fechaHoyISO } from "../actividad.constants.js";
import "./registro.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo({ id, label, tipo = "text", placeholder = "", valor = "", inputMode = "" }) {
  const grupo = crearElemento("label", "actividad-form-field");
  const texto = crearElemento("span", "actividad-form-field__label", label);
  const input = crearElemento("input", "actividad-form-field__input");
  const error = crearElemento("small", "actividad-form-field__error");

  input.id = id;
  input.name = id;
  input.type = tipo;
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.value = valor;

  if (inputMode) input.inputMode = inputMode;

  grupo.appendChild(texto);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return { grupo, input };
}

export function crearActividadRegistroView() {
  const pantalla = crearElemento("section", "actividad-registro-screen");
  const header = crearElemento("section", "actividad-registro-header");
  const formulario = crearElemento("form", "actividad-registro-form");
  const grid = crearElemento("div", "actividad-registro-grid");
  const mensaje = crearElemento("p", "actividad-registro-message");
  const acciones = crearElemento("div", "actividad-registro-actions");
  const guardarBoton = crearElemento("button", "actividad-registro-button actividad-registro-button--primary", ACTIVIDAD_TEXTOS.BOTON_GUARDAR);
  const volverBoton = crearElemento("button", "actividad-registro-button actividad-registro-button--secondary", "Volver al resumen");

  const fecha = crearCampo({ id: "fecha", label: "Fecha", tipo: "date", valor: fechaHoyISO() });
  const pasos = crearCampo({ id: "pasos", label: "Pasos", placeholder: "Ejemplo: 6500", inputMode: "numeric" });
  const bicicletaMin = crearCampo({ id: "bicicletaMin", label: "Bicicleta minutos", placeholder: "Ejemplo: 25", inputMode: "decimal" });
  const bicicletaKm = crearCampo({ id: "bicicletaKm", label: "Bicicleta km", placeholder: "Ejemplo: 8.5", inputMode: "decimal" });
  const nota = crearCampo({ id: "nota", label: "Nota", placeholder: "Opcional" });

  header.appendChild(crearElemento("p", "actividad-registro-kicker", "Registro manual"));
  header.appendChild(crearElemento("h2", "", ACTIVIDAD_TEXTOS.REGISTRO_TITULO));
  header.appendChild(crearElemento("p", "", ACTIVIDAD_TEXTOS.REGISTRO_SUBTITULO));

  [fecha, pasos, bicicletaMin, bicicletaKm, nota].forEach((campo) => grid.appendChild(campo.grupo));

  guardarBoton.type = "submit";
  volverBoton.type = "button";
  acciones.appendChild(guardarBoton);
  acciones.appendChild(volverBoton);

  formulario.appendChild(grid);
  formulario.appendChild(mensaje);
  formulario.appendChild(acciones);

  pantalla.appendChild(header);
  pantalla.appendChild(formulario);

  return {
    pantalla,
    formulario,
    mensaje,
    fechaInput: fecha.input,
    pasosInput: pasos.input,
    bicicletaMinInput: bicicletaMin.input,
    bicicletaKmInput: bicicletaKm.input,
    notaInput: nota.input,
    volverBoton
  };
}

export function leerFormularioActividad(formulario) {
  const formData = new FormData(formulario);
  const datos = {};

  formData.forEach((valor, clave) => {
    datos[clave] = valor;
  });

  return datos;
}

export function rellenarFormularioActividad(vista, registro) {
  if (!registro) {
    vista.pasosInput.value = "";
    vista.bicicletaMinInput.value = "";
    vista.bicicletaKmInput.value = "";
    vista.notaInput.value = "";
    return;
  }

  vista.pasosInput.value = registro.pasos || "";
  vista.bicicletaMinInput.value = registro.bicicletaMin || "";
  vista.bicicletaKmInput.value = registro.bicicletaKm || "";
  vista.notaInput.value = registro.nota || "";
}

export function mostrarErroresActividad(formulario, errores) {
  formulario.querySelectorAll(".actividad-form-field").forEach((campo) => {
    const input = campo.querySelector("input");
    const error = campo.querySelector(".actividad-form-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("actividad-form-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}

export function mostrarMensajeActividad(elemento, mensaje, ok) {
  elemento.textContent = mensaje || "";
  elemento.className = ok ? "actividad-registro-message actividad-registro-message--ok" : "actividad-registro-message actividad-registro-message--error";
}
