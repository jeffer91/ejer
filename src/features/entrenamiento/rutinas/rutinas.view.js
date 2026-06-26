/*
  Nombre completo: rutinas.view.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.view.js

  Función o funciones:
    - Construir la pantalla Rutinas de Entrenamiento.
    - Permitir crear rutinas locales con formulario real.
    - Mostrar rutinas guardadas y activar una rutina.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.css
*/

import "./rutinas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo({ nombre, label, placeholder, tipo = "text", valor = "" }) {
  const grupo = crearElemento("label", "entreno-rutinas-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.placeholder = placeholder;
  input.value = valor;
  input.min = tipo === "number" ? "1" : "";

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearArea({ nombre, label, placeholder }) {
  const grupo = crearElemento("label", "entreno-rutinas-field entreno-rutinas-field--full");
  const texto = crearElemento("span", "", label);
  const area = document.createElement("textarea");

  area.name = nombre;
  area.rows = 5;
  area.placeholder = placeholder;

  grupo.appendChild(texto);
  grupo.appendChild(area);
  return grupo;
}

function leerFormulario(formulario) {
  const datos = new FormData(formulario);

  return {
    nombre: datos.get("nombre"),
    totalDias: datos.get("totalDias"),
    calentamiento: datos.get("calentamiento"),
    ejerciciosTexto: datos.get("ejerciciosTexto"),
    descansoSegundos: datos.get("descansoSegundos"),
    series: datos.get("series"),
    repeticiones: datos.get("repeticiones"),
    activa: datos.get("activa") === "on"
  };
}

function crearMensaje(mensaje) {
  if (!mensaje) return null;

  const clase = mensaje.ok ? "entreno-rutinas-message entreno-rutinas-message--ok" : "entreno-rutinas-message entreno-rutinas-message--error";
  const caja = crearElemento("div", clase);
  caja.appendChild(crearElemento("strong", "", mensaje.ok ? "Listo" : "Revisar"));
  caja.appendChild(crearElemento("span", "", mensaje.mensaje || "Operación finalizada."));

  if (Array.isArray(mensaje.errores) && mensaje.errores.length > 1) {
    mensaje.errores.slice(1).forEach((error) => caja.appendChild(crearElemento("small", "", error)));
  }

  return caja;
}

function crearRutinaCard(rutina, onActivar) {
  const card = crearElemento("article", "entreno-rutinas-card");
  const top = crearElemento("div", "entreno-rutinas-card__top");
  const info = crearElemento("div", "");
  const boton = crearElemento("button", "entreno-rutinas-activate", rutina.estado === "activa" ? "Activa" : "Activar");
  const totalEjercicios = rutina.dias.reduce((total, dia) => total + dia.ejercicios.length, 0);

  boton.type = "button";
  boton.disabled = rutina.estado === "activa";
  boton.addEventListener("click", () => onActivar?.(rutina.id));

  info.appendChild(crearElemento("strong", "", rutina.nombre));
  info.appendChild(crearElemento("span", "", `${rutina.dias.length} día(s) · ${totalEjercicios} ejercicio(s) · ${rutina.estado}`));
  top.appendChild(info);
  top.appendChild(boton);
  card.appendChild(top);

  return card;
}

export function crearEntrenamientoRutinasView({ rutinas = [], mensaje = null, onGuardar, onActivar } = {}) {
  const pantalla = crearElemento("section", "entreno-rutinas-screen");
  const header = crearElemento("div", "entreno-rutinas-header");
  const formBox = crearElemento("section", "entreno-rutinas-form");
  const formulario = crearElemento("form", "entreno-rutinas-grid");
  const lista = crearElemento("section", "entreno-rutinas-list");
  const rutinasGrid = crearElemento("div", "entreno-rutinas-saved");
  const mensajeNodo = crearMensaje(mensaje);
  const acciones = crearElemento("div", "entreno-rutinas-actions");
  const guardar = crearElemento("button", "entreno-rutinas-save", "Guardar rutina");
  const activar = crearElemento("label", "entreno-rutinas-check");
  const check = document.createElement("input");

  header.appendChild(crearElemento("p", "entreno-rutinas-kicker", "Planes"));
  header.appendChild(crearElemento("h2", "", "Rutinas"));
  header.appendChild(crearElemento("p", "", "Crea entrenamientos por días con calentamiento, ejercicios, descansos, series y repeticiones."));

  formulario.appendChild(crearCampo({ nombre: "nombre", label: "Nombre", placeholder: "Ejemplo: Casa 4 días" }));
  formulario.appendChild(crearCampo({ nombre: "totalDias", label: "Días", placeholder: "4", tipo: "number", valor: "4" }));
  formulario.appendChild(crearCampo({ nombre: "calentamiento", label: "Calentamiento", placeholder: "Movilidad y activación" }));
  formulario.appendChild(crearCampo({ nombre: "descansoSegundos", label: "Descanso", placeholder: "60", tipo: "number", valor: "60" }));
  formulario.appendChild(crearCampo({ nombre: "series", label: "Series", placeholder: "3", tipo: "number", valor: "3" }));
  formulario.appendChild(crearCampo({ nombre: "repeticiones", label: "Repeticiones", placeholder: "10", tipo: "number", valor: "10" }));
  formulario.appendChild(crearArea({ nombre: "ejerciciosTexto", label: "Ejercicios", placeholder: "Sentadillas\nFlexiones\nPlancha" }));

  check.type = "checkbox";
  check.name = "activa";
  activar.appendChild(check);
  activar.appendChild(crearElemento("span", "", "Guardar como rutina activa"));

  guardar.type = "submit";
  acciones.appendChild(activar);
  acciones.appendChild(guardar);
  formulario.appendChild(acciones);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    onGuardar?.(leerFormulario(formulario));
  });

  formBox.appendChild(crearElemento("h3", "", "Crear rutina"));
  if (mensajeNodo) formBox.appendChild(mensajeNodo);
  formBox.appendChild(formulario);

  lista.appendChild(crearElemento("h3", "", "Rutinas guardadas"));

  if (rutinas.length === 0) {
    lista.appendChild(crearElemento("p", "", "Todavía no hay rutinas guardadas."));
  } else {
    rutinas.forEach((rutina) => rutinasGrid.appendChild(crearRutinaCard(rutina, onActivar)));
    lista.appendChild(rutinasGrid);
  }

  pantalla.appendChild(header);
  pantalla.appendChild(formBox);
  pantalla.appendChild(lista);
  return pantalla;
}
