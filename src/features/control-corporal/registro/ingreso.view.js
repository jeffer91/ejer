/*
  Nombre completo: ingreso.view.js
  Ruta o ubicación: src/features/control-corporal/registro/ingreso.view.js

  Función o funciones:
    - Construir la pantalla de Registro / Ingreso.
    - Mostrar peso diario y medidas semanales en una vista compacta.
    - Mantener la vista separada de guardado y validaciones.

  Se conecta con:
    - src/features/control-corporal/registro/registro.controller.js
    - src/features/control-corporal/registro/ingreso.constants.js
    - src/features/control-corporal/registro/ingreso.css
*/

import { INGRESO_CAMPOS_MEDIDAS, INGRESO_CAMPOS_PESO, INGRESO_LABELS, INGRESO_TEXTOS } from "./ingreso.constants.js";
import { fechaHoy } from "./ingreso.parser.js";
import "./ingreso.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearCampo({ id, label, placeholder, tipo, valor }) {
  const grupo = crearElemento("label", "ingreso-field");
  const texto = crearElemento("span", "ingreso-field__label", label);
  const input = crearElemento("input", "ingreso-field__input");
  const error = crearElemento("small", "ingreso-field__error");

  input.name = id;
  input.id = id;
  input.type = tipo || "text";
  input.placeholder = placeholder || "";
  input.autocomplete = "off";

  if (valor) {
    input.value = valor;
  }

  grupo.appendChild(texto);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return grupo;
}

function crearFormularioPeso() {
  const form = crearElemento("form", "ingreso-card ingreso-form");
  const mensaje = crearElemento("p", "ingreso-message");
  const boton = crearElemento("button", "ingreso-button", INGRESO_TEXTOS.BOTON_PESO);

  form.dataset.form = "peso";
  form.appendChild(crearElemento("h3", "ingreso-card__title", INGRESO_TEXTOS.PESO_TITULO));
  form.appendChild(crearCampo({
    id: INGRESO_CAMPOS_PESO.PESO_KG,
    label: "Peso",
    placeholder: "Ejemplo: 86.3 kg"
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearFormularioMedidas() {
  const form = crearElemento("form", "ingreso-card ingreso-form ingreso-card--wide");
  const grid = crearElemento("div", "ingreso-grid");
  const mensaje = crearElemento("p", "ingreso-message");
  const boton = crearElemento("button", "ingreso-button", INGRESO_TEXTOS.BOTON_MEDIDAS);

  form.dataset.form = "medidas";
  form.appendChild(crearElemento("h3", "ingreso-card__title", INGRESO_TEXTOS.MEDIDAS_TITULO));

  grid.appendChild(crearCampo({
    id: INGRESO_CAMPOS_MEDIDAS.FECHA,
    label: INGRESO_LABELS.fecha,
    tipo: "date",
    valor: fechaHoy()
  }));

  Object.values(INGRESO_CAMPOS_MEDIDAS)
    .filter((campo) => campo !== "fecha")
    .forEach((campo) => {
      grid.appendChild(crearCampo({
        id: campo,
        label: INGRESO_LABELS[campo],
        placeholder: "cm"
      }));
    });

  boton.type = "submit";
  form.appendChild(grid);
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

export function crearIngresoView() {
  const pantalla = crearElemento("section", "ingreso-screen");
  const header = crearElemento("div", "ingreso-header");
  const contenedor = crearElemento("div", "ingreso-layout");
  const peso = crearFormularioPeso();
  const medidas = crearFormularioMedidas();

  header.appendChild(crearElemento("p", "ingreso-kicker", "Registro corporal"));
  header.appendChild(crearElemento("h2", "", INGRESO_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", INGRESO_TEXTOS.SUBTITULO));

  contenedor.appendChild(peso.form);
  contenedor.appendChild(medidas.form);
  pantalla.appendChild(header);
  pantalla.appendChild(contenedor);

  return {
    pantalla,
    pesoForm: peso.form,
    pesoMensaje: peso.mensaje,
    medidasForm: medidas.form,
    medidasMensaje: medidas.mensaje
  };
}

export function leerFormulario(formulario) {
  const formData = new FormData(formulario);
  const datos = {};

  formData.forEach((valor, clave) => {
    datos[clave] = valor;
  });

  return datos;
}

export function mostrarErroresIngreso(formulario, errores) {
  formulario.querySelectorAll(".ingreso-field").forEach((campo) => {
    const input = campo.querySelector("input");
    const error = campo.querySelector(".ingreso-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("ingreso-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}

export function mostrarMensajeIngreso(elemento, mensaje, ok) {
  elemento.textContent = mensaje || "";
  elemento.className = ok ? "ingreso-message ingreso-message--ok" : "ingreso-message ingreso-message--error";
}
