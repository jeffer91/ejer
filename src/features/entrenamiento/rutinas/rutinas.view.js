/*
  Nombre completo: rutinas.view.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.view.js

  Función o funciones:
    - Construir la pantalla Rutinas de Entrenamiento.
    - Permitir crear rutinas locales con días iguales o diferentes.
    - Pegar e interpretar rutinas generadas por IA con el contrato FITJEFF_RUTINA_V1.
    - Editar, duplicar, activar, archivar y restaurar rutinas guardadas.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.css
    - src/features/entrenamiento/rutinas/rutinas.prompt.js
    - src/features/entrenamiento/rutinas/rutinas.parser.js
*/

import { interpretarRutinaIA } from "./rutinas.parser.js";
import { PROMPT_RUTINA_COPIABLE } from "./rutinas.prompt.js";
import "./rutinas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function limpiarNodo(nodo) {
  while (nodo.firstChild) {
    nodo.removeChild(nodo.firstChild);
  }
}

function crearCampo({ nombre, label, placeholder, tipo = "text", valor = "" }) {
  const grupo = crearElemento("label", "entreno-rutinas-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.placeholder = placeholder || "";
  input.value = valor;
  input.min = tipo === "number" ? "1" : "";

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearArea({ nombre, label, placeholder, valor = "" }) {
  const grupo = crearElemento("label", "entreno-rutinas-field entreno-rutinas-field--full");
  const texto = crearElemento("span", "", label);
  const area = document.createElement("textarea");

  area.name = nombre;
  area.rows = 6;
  area.placeholder = placeholder || "";
  area.value = valor;

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

function crearBoton(texto, clase = "", accion) {
  const boton = crearElemento("button", `entreno-rutinas-button ${clase}`.trim(), texto);
  boton.type = "button";
  boton.addEventListener("click", () => accion?.());
  return boton;
}

function copiarTextoConFallback(texto) {
  const temporal = document.createElement("textarea");
  temporal.value = texto;
  temporal.setAttribute("readonly", "");
  temporal.style.position = "fixed";
  temporal.style.left = "-9999px";
  document.body.appendChild(temporal);
  temporal.select();
  document.execCommand("copy");
  document.body.removeChild(temporal);
}

async function copiarPromptRutina() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(PROMPT_RUTINA_COPIABLE);
    return;
  }

  copiarTextoConFallback(PROMPT_RUTINA_COPIABLE);
}

function crearBotonCopiarFormato() {
  const boton = crearBoton("Copiar prompt", "entreno-rutinas-button--copy", async () => {
    const textoOriginal = boton.textContent;
    boton.disabled = true;

    try {
      await copiarPromptRutina();
      boton.textContent = "Prompt copiado";
    } catch (error) {
      boton.textContent = "No se pudo copiar";
    }

    window.setTimeout(() => {
      boton.textContent = textoOriginal;
      boton.disabled = false;
    }, 1600);
  });

  boton.title = "Copia el contrato FITJEFF_RUTINA_V1 para generar una rutina que luego pueda interpretar la app.";
  return boton;
}

function crearResumenInterpretacion(resultado) {
  const resumen = resultado?.resumen || {};
  const contenedor = crearElemento("div", resultado?.ok ? "entreno-rutinas-ia-result entreno-rutinas-ia-result--ok" : "entreno-rutinas-ia-result entreno-rutinas-ia-result--error");
  const titulo = crearElemento("strong", "", resultado?.ok ? "Rutina detectada" : "No se pudo interpretar");
  const datos = crearElemento("span", "", `${resumen.dias || 0} día(s) · ${resumen.bloques || 0} bloque(s) · ${resumen.ejercicios || 0} ejercicio(s)`);
  const chips = crearElemento("div", "entreno-rutinas-ia-chips");

  contenedor.appendChild(titulo);
  contenedor.appendChild(datos);

  Object.entries(resumen.tipos || {}).forEach(([tipo, total]) => {
    chips.appendChild(crearElemento("small", "", `${tipo}: ${total}`));
  });

  if (chips.childNodes.length) {
    contenedor.appendChild(chips);
  }

  (resultado?.errores || []).slice(0, 3).forEach((error) => {
    contenedor.appendChild(crearElemento("small", "", `Error: ${error}`));
  });

  (resultado?.advertencias || []).slice(0, 3).forEach((advertencia) => {
    contenedor.appendChild(crearElemento("small", "", `Aviso: ${advertencia}`));
  });

  return contenedor;
}

function crearPanelRutinaIA() {
  const panel = crearElemento("section", "entreno-rutinas-ia");
  const top = crearElemento("div", "entreno-rutinas-form__top");
  const textoTop = crearElemento("div", "");
  const area = document.createElement("textarea");
  const acciones = crearElemento("div", "entreno-rutinas-actions entreno-rutinas-actions--ia");
  const interpretar = crearBoton("Interpretar rutina", "entreno-rutinas-button--ia", () => {
    limpiarNodo(resultadoBox);

    const contenido = area.value.trim();
    if (!contenido) {
      resultadoBox.appendChild(crearResumenInterpretacion({
        ok: false,
        resumen: { dias: 0, bloques: 0, ejercicios: 0, tipos: {} },
        errores: ["Pega primero la respuesta generada por la IA."],
        advertencias: []
      }));
      return;
    }

    resultadoBox.appendChild(crearResumenInterpretacion(interpretarRutinaIA(contenido)));
  });
  const resultadoBox = crearElemento("div", "entreno-rutinas-ia-output");

  textoTop.appendChild(crearElemento("h3", "", "Rutina generada por IA"));
  textoTop.appendChild(crearElemento("p", "", "Copia el prompt, úsalo con la IA y pega aquí la respuesta para que FitJeff la pueda leer."));
  top.appendChild(textoTop);
  top.appendChild(crearBotonCopiarFormato());

  area.className = "entreno-rutinas-ia-textarea";
  area.placeholder = "Pega aquí la respuesta que empiece con FITJEFF_RUTINA_V1 y termine con FIN_RUTINA.";
  area.rows = 10;

  acciones.appendChild(interpretar);
  panel.appendChild(top);
  panel.appendChild(area);
  panel.appendChild(acciones);
  panel.appendChild(resultadoBox);

  return panel;
}

function calcularTotales(rutina) {
  const dias = rutina.dias || [];
  return {
    dias: dias.length,
    ejercicios: dias.reduce((total, dia) => total + (dia.ejercicios || []).length, 0),
    series: dias.reduce((total, dia) => total + (dia.ejercicios || []).reduce((subtotal, ejercicio) => subtotal + Number(ejercicio.series || 0), 0), 0)
  };
}

function rutinaATexto(rutina) {
  return (rutina.dias || []).map((dia, indice) => {
    const ejercicios = (dia.ejercicios || []).map((ejercicio) => ejercicio.nombre).join("\n");
    return `${dia.nombre || `Día ${indice + 1}`}\n${ejercicios}`.trim();
  }).join("\n\n");
}

function obtenerBaseEdicion(rutina) {
  const primerDia = (rutina.dias || [])[0] || {};
  const primerEjercicio = (primerDia.ejercicios || [])[0] || {};

  return {
    nombre: rutina.nombre || "",
    totalDias: (rutina.dias || []).length || 1,
    calentamiento: primerDia.calentamiento || "",
    descansoSegundos: primerDia.descansoGeneralSegundos || primerEjercicio.descansoSegundos || 60,
    series: primerEjercicio.series || 3,
    repeticiones: primerEjercicio.repeticiones || 10,
    ejerciciosTexto: rutinaATexto(rutina)
  };
}

function crearResumenDias(rutina) {
  const wrapper = crearElemento("div", "entreno-rutinas-days");

  (rutina.dias || []).forEach((dia) => {
    const bloque = crearElemento("article", "entreno-rutinas-day");
    bloque.appendChild(crearElemento("strong", "", dia.nombre));
    bloque.appendChild(crearElemento("span", "", `${(dia.ejercicios || []).length} ejercicio(s)`));
    (dia.ejercicios || []).slice(0, 5).forEach((ejercicio) => {
      bloque.appendChild(crearElemento("small", "", `• ${ejercicio.nombre}`));
    });
    wrapper.appendChild(bloque);
  });

  return wrapper;
}

function crearFormularioEdicionPlan(rutina, onActualizarPlan) {
  const base = obtenerBaseEdicion(rutina);
  const details = crearElemento("details", "entreno-rutinas-details");
  const summary = crearElemento("summary", "", "Editar plan completo");
  const form = crearElemento("form", "entreno-rutinas-grid entreno-rutinas-grid--edit");
  const guardar = crearElemento("button", "entreno-rutinas-save", "Guardar cambios del plan");

  form.appendChild(crearCampo({ nombre: "nombre", label: "Nombre", valor: base.nombre }));
  form.appendChild(crearCampo({ nombre: "totalDias", label: "Días", tipo: "number", valor: String(base.totalDias) }));
  form.appendChild(crearCampo({ nombre: "calentamiento", label: "Calentamiento", valor: base.calentamiento }));
  form.appendChild(crearCampo({ nombre: "descansoSegundos", label: "Descanso", tipo: "number", valor: String(base.descansoSegundos) }));
  form.appendChild(crearCampo({ nombre: "series", label: "Series", tipo: "number", valor: String(base.series) }));
  form.appendChild(crearCampo({ nombre: "repeticiones", label: "Repeticiones", tipo: "number", valor: String(base.repeticiones) }));
  form.appendChild(crearArea({
    nombre: "ejerciciosTexto",
    label: "Días y ejercicios",
    valor: base.ejerciciosTexto,
    placeholder: "Día 1\nSentadillas\nFlexiones\n\nDía 2\nCaminata\nPlancha"
  }));

  guardar.type = "submit";
  form.appendChild(guardar);
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    onActualizarPlan?.(rutina.id, leerFormulario(form));
  });

  details.appendChild(summary);
  details.appendChild(form);
  return details;
}

function crearRutinaCard(rutina, acciones) {
  const card = crearElemento("article", `entreno-rutinas-card entreno-rutinas-card--${rutina.estado}`);
  const top = crearElemento("div", "entreno-rutinas-card__top");
  const info = crearElemento("div", "");
  const formNombre = crearElemento("form", "entreno-rutinas-name-form");
  const inputNombre = document.createElement("input");
  const guardarNombre = crearElemento("button", "entreno-rutinas-button", "Guardar nombre");
  const botones = crearElemento("div", "entreno-rutinas-card__actions");
  const totales = calcularTotales(rutina);
  const archivada = rutina.estado === "archivada";

  inputNombre.name = "nombre";
  inputNombre.value = rutina.nombre;
  inputNombre.placeholder = "Nombre de rutina";
  guardarNombre.type = "submit";

  formNombre.appendChild(inputNombre);
  formNombre.appendChild(guardarNombre);
  formNombre.addEventListener("submit", (evento) => {
    evento.preventDefault();
    acciones.onEditarNombre?.(rutina.id, { nombre: new FormData(formNombre).get("nombre") });
  });

  info.appendChild(crearElemento("strong", "", rutina.nombre));
  info.appendChild(crearElemento("span", "", `${totales.dias} día(s) · ${totales.ejercicios} ejercicio(s) · ${totales.series} serie(s) · ${rutina.estado}`));
  top.appendChild(info);

  if (!archivada) {
    botones.appendChild(crearBoton(rutina.estado === "activa" ? "Activa" : "Activar", rutina.estado === "activa" ? "entreno-rutinas-button--ok" : "", () => acciones.onActivar?.(rutina.id)));
    botones.appendChild(crearBoton("Duplicar", "", () => acciones.onDuplicar?.(rutina.id)));
    botones.appendChild(crearBoton("Archivar", "entreno-rutinas-button--danger", () => acciones.onArchivar?.(rutina.id)));
  } else {
    botones.appendChild(crearBoton("Restaurar", "", () => acciones.onRestaurar?.(rutina.id)));
    botones.appendChild(crearBoton("Duplicar", "", () => acciones.onDuplicar?.(rutina.id)));
  }

  card.appendChild(top);
  card.appendChild(botones);
  card.appendChild(formNombre);
  card.appendChild(crearResumenDias(rutina));
  if (!archivada) card.appendChild(crearFormularioEdicionPlan(rutina, acciones.onActualizarPlan));

  return card;
}

export function crearEntrenamientoRutinasView({ rutinas = [], mensaje = null, onGuardar, onActivar, onEditarNombre, onActualizarPlan, onDuplicar, onArchivar, onRestaurar } = {}) {
  const pantalla = crearElemento("section", "entreno-rutinas-screen");
  const header = crearElemento("div", "entreno-rutinas-header");
  const iaBox = crearPanelRutinaIA();
  const formBox = crearElemento("section", "entreno-rutinas-form");
  const formHeader = crearElemento("div", "entreno-rutinas-form__top");
  const formulario = crearElemento("form", "entreno-rutinas-grid");
  const lista = crearElemento("section", "entreno-rutinas-list");
  const rutinasGrid = crearElemento("div", "entreno-rutinas-saved");
  const mensajeNodo = crearMensaje(mensaje);
  const acciones = crearElemento("div", "entreno-rutinas-actions");
  const guardar = crearElemento("button", "entreno-rutinas-save", "Guardar rutina");
  const activar = crearElemento("label", "entreno-rutinas-check");
  const check = document.createElement("input");
  const accionesCard = { onActivar, onEditarNombre, onActualizarPlan, onDuplicar, onArchivar, onRestaurar };

  header.appendChild(crearElemento("p", "entreno-rutinas-kicker", "Planes"));
  header.appendChild(crearElemento("h2", "", "Rutinas"));
  header.appendChild(crearElemento("p", "", "Crea rutinas manuales o interpreta una rutina generada por IA con el formato de FitJeff."));

  formulario.appendChild(crearCampo({ nombre: "nombre", label: "Nombre", placeholder: "Ejemplo: Casa 4 días" }));
  formulario.appendChild(crearCampo({ nombre: "totalDias", label: "Días", placeholder: "4", tipo: "number", valor: "4" }));
  formulario.appendChild(crearCampo({ nombre: "calentamiento", label: "Calentamiento", placeholder: "Movilidad y activación" }));
  formulario.appendChild(crearCampo({ nombre: "descansoSegundos", label: "Descanso", placeholder: "60", tipo: "number", valor: "60" }));
  formulario.appendChild(crearCampo({ nombre: "series", label: "Series", placeholder: "3", tipo: "number", valor: "3" }));
  formulario.appendChild(crearCampo({ nombre: "repeticiones", label: "Repeticiones", placeholder: "10", tipo: "number", valor: "10" }));
  formulario.appendChild(crearArea({
    nombre: "ejerciciosTexto",
    label: "Ejercicios o días diferentes",
    placeholder: "Simple:\nSentadillas\nFlexiones\nPlancha\n\nAvanzado:\nDía 1\nSentadillas\nFlexiones\n\nDía 2\nCaminata\nPlancha"
  }));

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

  formHeader.appendChild(crearElemento("h3", "", "Crear rutina manual"));
  formBox.appendChild(formHeader);
  if (mensajeNodo) formBox.appendChild(mensajeNodo);
  formBox.appendChild(formulario);

  lista.appendChild(crearElemento("h3", "", "Rutinas guardadas"));

  if (rutinas.length === 0) {
    lista.appendChild(crearElemento("p", "", "Todavía no hay rutinas guardadas."));
  } else {
    rutinas.forEach((rutina) => rutinasGrid.appendChild(crearRutinaCard(rutina, accionesCard)));
    lista.appendChild(rutinasGrid);
  }

  pantalla.appendChild(header);
  pantalla.appendChild(iaBox);
  pantalla.appendChild(formBox);
  pantalla.appendChild(lista);
  return pantalla;
}
