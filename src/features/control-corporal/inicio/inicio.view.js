/*
  Nombre completo: inicio.view.js
  Ruta o ubicacion: src/features/control-corporal/inicio/inicio.view.js

  Funcion o funciones:
    - Construir la pantalla visual de Inicio de primera vez.
    - Mostrar campos de altura, fecha de nacimiento, contexto muscular, peso inicial y peso objetivo.
    - Mantener una experiencia clara y coherente con la pantalla Hoy.
    - Mantener la vista sin logica de guardado.

  Se conecta con:
    - src/features/control-corporal/inicio/inicio.controller.js
    - src/features/control-corporal/inicio/inicio.constants.js
    - src/features/control-corporal/inicio/inicio.css
*/

import { INICIO_CAMPOS, INICIO_OPCIONES, INICIO_TEXTOS } from "./inicio.constants.js";
import "./inicio.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null && texto !== "") {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearCampo({ id, label, tipo, placeholder, inputMode }) {
  const grupo = crearElemento("label", "inicio-field");
  const texto = crearElemento("span", "inicio-field__label", label);
  const input = crearElemento("input", "inicio-field__input");
  const error = crearElemento("small", "inicio-field__error");

  input.id = id;
  input.name = id;
  input.type = tipo || "text";
  input.placeholder = placeholder || "";
  input.autocomplete = "off";

  if (inputMode) {
    input.inputMode = inputMode;
  }

  grupo.appendChild(texto);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return grupo;
}

function crearSelect({ id, label, opciones = [], ayuda = "" }) {
  const grupo = crearElemento("label", "inicio-field");
  const texto = crearElemento("span", "inicio-field__label", label);
  const select = crearElemento("select", "inicio-field__input");
  const error = crearElemento("small", "inicio-field__error");

  select.id = id;
  select.name = id;

  opciones.forEach((opcion) => {
    const item = document.createElement("option");
    item.value = opcion.value;
    item.textContent = opcion.label;
    select.appendChild(item);
  });

  grupo.appendChild(texto);
  grupo.appendChild(select);
  if (ayuda) grupo.appendChild(crearElemento("small", "inicio-field__hint", ayuda));
  grupo.appendChild(error);
  return grupo;
}

export function crearInicioView() {
  const pantalla = crearElemento("section", "inicio-screen");
  const tarjeta = crearElemento("article", "inicio-card");
  const encabezado = crearElemento("div", "inicio-header");
  const formulario = crearElemento("form", "inicio-form");
  const mensaje = crearElemento("p", "inicio-message");
  const boton = crearElemento("button", "inicio-submit", INICIO_TEXTOS.BOTON_GUARDAR);

  encabezado.appendChild(crearElemento("p", "inicio-kicker", "Primer uso"));
  encabezado.appendChild(crearElemento("h2", "", INICIO_TEXTOS.TITULO));
  encabezado.appendChild(crearElemento("p", "", INICIO_TEXTOS.SUBTITULO));

  formulario.appendChild(crearCampo({
    id: INICIO_CAMPOS.ALTURA_CM,
    label: "Altura",
    placeholder: "Ejemplo: 1.75 o 175 cm",
    inputMode: "decimal"
  }));

  formulario.appendChild(crearCampo({
    id: INICIO_CAMPOS.FECHA_NACIMIENTO,
    label: "Fecha de nacimiento",
    tipo: "date"
  }));

  formulario.appendChild(crearSelect({
    id: INICIO_CAMPOS.NIVEL_MUSCULAR,
    label: "Contexto muscular",
    opciones: INICIO_OPCIONES.nivelMuscular,
    ayuda: "Ayuda a que FitJeff no confunda peso alto por músculo con un problema automático."
  }));

  formulario.appendChild(crearCampo({
    id: INICIO_CAMPOS.PESO_INICIAL_KG,
    label: "Peso inicial",
    placeholder: "Ejemplo: 86.3 kg",
    inputMode: "decimal"
  }));

  formulario.appendChild(crearCampo({
    id: INICIO_CAMPOS.PESO_OBJETIVO_KG,
    label: "Peso objetivo",
    placeholder: "Ejemplo: 80 kg",
    inputMode: "decimal"
  }));

  boton.type = "submit";
  formulario.appendChild(mensaje);
  formulario.appendChild(boton);

  tarjeta.appendChild(encabezado);
  tarjeta.appendChild(formulario);
  pantalla.appendChild(tarjeta);

  return {
    pantalla,
    formulario,
    mensaje
  };
}

export function leerDatosInicio(formulario) {
  const datos = new FormData(formulario);

  return {
    alturaCm: datos.get(INICIO_CAMPOS.ALTURA_CM),
    fechaNacimiento: datos.get(INICIO_CAMPOS.FECHA_NACIMIENTO),
    nivelMuscular: datos.get(INICIO_CAMPOS.NIVEL_MUSCULAR),
    pesoInicialKg: datos.get(INICIO_CAMPOS.PESO_INICIAL_KG),
    pesoObjetivoKg: datos.get(INICIO_CAMPOS.PESO_OBJETIVO_KG)
  };
}

export function mostrarErroresInicio(formulario, errores) {
  formulario.querySelectorAll(".inicio-field").forEach((campo) => {
    const input = campo.querySelector("input, select");
    const error = campo.querySelector(".inicio-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("inicio-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}
