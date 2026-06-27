/*
  Nombre completo: diario.view.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.view.js

  Función o funciones:
    - Construir la pantalla Diario de Entrenamiento.
    - Mostrar rutina activa, ejercicios y estado de la sesión diaria.
    - Permitir marcar ejercicios, guardar progreso y completar sesión con detalle.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.css
*/

import "./diario.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearBoton(texto, clase, accion, deshabilitado = false) {
  const boton = crearElemento("button", `entreno-diario-button ${clase || ""}`.trim(), texto);
  boton.type = "button";
  boton.disabled = deshabilitado;
  boton.addEventListener("click", () => accion?.());
  return boton;
}

function crearMensaje(mensaje) {
  if (!mensaje) return null;

  const caja = crearElemento("div", mensaje.ok ? "entreno-diario-message entreno-diario-message--ok" : "entreno-diario-message entreno-diario-message--error");
  caja.appendChild(crearElemento("strong", "", mensaje.ok ? "Listo" : "Revisar"));
  caja.appendChild(crearElemento("span", "", mensaje.mensaje || "Acción realizada."));
  return caja;
}

function crearMetrica(label, valor, detalle) {
  const item = crearElemento("article", "entreno-diario-metric");
  item.appendChild(crearElemento("span", "", label));
  item.appendChild(crearElemento("strong", "", valor));
  item.appendChild(crearElemento("small", "", detalle));
  return item;
}

function obtenerDetalle(sesion, ejercicioId) {
  return (sesion?.detalleEjercicios || []).find((item) => item.ejercicioId === ejercicioId) || null;
}

function crearInput({ nombre, tipo = "text", valor = "", min = "0", placeholder = "" }) {
  const input = document.createElement("input");
  input.name = nombre;
  input.type = tipo;
  input.value = valor ?? "";
  input.min = min;
  input.placeholder = placeholder;
  return input;
}

function crearSelect(nombre, valorActual = "media") {
  const select = document.createElement("select");
  select.name = nombre;
  ["suave", "media", "alta"].forEach((valor) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    option.selected = valor === valorActual;
    select.appendChild(option);
  });
  return select;
}

function crearEjercicio(ejercicio, indice, sesion) {
  const detalle = obtenerDetalle(sesion, ejercicio.id);
  const item = crearElemento("article", "entreno-diario-exercise");
  const top = crearElemento("label", "entreno-diario-exercise__top");
  const check = document.createElement("input");
  const grid = crearElemento("div", "entreno-diario-exercise__grid");
  const nota = document.createElement("textarea");

  check.type = "checkbox";
  check.name = `ejercicio_${ejercicio.id}_completado`;
  check.checked = Boolean(detalle?.completado);

  top.appendChild(check);
  top.appendChild(crearElemento("strong", "", `${indice + 1}. ${ejercicio.nombre}`));
  item.appendChild(top);
  item.appendChild(crearElemento("span", "entreno-diario-exercise__base", `${ejercicio.series} series · ${ejercicio.repeticiones} reps · descanso ${ejercicio.descansoSegundos}s`));

  grid.appendChild(crearCampoMini("Series hechas", crearInput({ nombre: `series_${ejercicio.id}`, tipo: "number", valor: detalle?.seriesCompletadas ?? 0 })));
  grid.appendChild(crearCampoMini("Reps hechas", crearInput({ nombre: `reps_${ejercicio.id}`, tipo: "number", valor: detalle?.repeticionesCompletadas ?? 0 })));
  grid.appendChild(crearCampoMini("Dificultad", crearSelect(`dificultad_${ejercicio.id}`, detalle?.dificultad || "media")));

  nota.name = `nota_${ejercicio.id}`;
  nota.rows = 2;
  nota.placeholder = "Nota del ejercicio";
  nota.value = detalle?.notas || "";

  item.appendChild(grid);
  item.appendChild(nota);
  return item;
}

function crearCampoMini(label, control) {
  const grupo = crearElemento("label", "entreno-diario-mini");
  grupo.appendChild(crearElemento("span", "", label));
  grupo.appendChild(control);
  return grupo;
}

function leerFormulario(formulario, dia) {
  const datos = new FormData(formulario);

  return {
    tiempoMinutos: datos.get("tiempoMinutos"),
    dificultadGeneral: datos.get("dificultadGeneral"),
    molestias: datos.get("molestias"),
    notas: datos.get("notas"),
    detalleEjercicios: (dia?.ejercicios || []).map((ejercicio) => ({
      ejercicioId: ejercicio.id,
      nombre: ejercicio.nombre,
      completado: datos.get(`ejercicio_${ejercicio.id}_completado`) === "on",
      seriesCompletadas: datos.get(`series_${ejercicio.id}`),
      repeticionesCompletadas: datos.get(`reps_${ejercicio.id}`),
      dificultad: datos.get(`dificultad_${ejercicio.id}`),
      notas: datos.get(`nota_${ejercicio.id}`)
    }))
  };
}

export function crearEntrenamientoDiarioView({ diario = {}, mensaje = null, onIniciar, onGuardarProgreso, onCompletar } = {}) {
  const pantalla = crearElemento("section", "entreno-diario-screen");
  const header = crearElemento("div", "entreno-diario-header");
  const panel = crearElemento("section", "entreno-diario-panel");
  const form = crearElemento("form", "entreno-diario-form");
  const metricas = crearElemento("div", "entreno-diario-metrics");
  const controles = crearElemento("div", "entreno-diario-controls");
  const ejercicios = crearElemento("div", "entreno-diario-exercises");
  const acciones = crearElemento("div", "entreno-diario-actions");
  const estadoBox = crearElemento("section", "entreno-diario-panel entreno-diario-panel--estado");
  const mensajeNodo = crearMensaje(mensaje);
  const rutinaDelDia = diario.rutinaDelDia || {};
  const rutina = rutinaDelDia.rutina;
  const dia = rutinaDelDia.dia;
  const sesion = diario.sesionHoy;
  const datos = diario.metricas || {};
  const tieneRutina = Boolean(rutina && dia);
  const completada = sesion?.estado === "completada";

  header.appendChild(crearElemento("p", "entreno-diario-kicker", rutinaDelDia.diaSemana || "Hoy"));
  header.appendChild(crearElemento("h2", "", "Diario"));
  header.appendChild(crearElemento("p", "", tieneRutina ? `${rutina.nombre} · ${dia.nombre}` : "Crea y activa una rutina para cargar el día automáticamente."));

  if (mensajeNodo) {
    panel.appendChild(mensajeNodo);
  }

  if (tieneRutina) {
    metricas.appendChild(crearMetrica("Ejercicios", datos.ejercicios || 0, "preparados"));
    metricas.appendChild(crearMetrica("Series", sesion?.seriesCompletadas ?? 0, `${datos.series || 0} planificadas`));
    metricas.appendChild(crearMetrica("Reps", sesion?.repeticionesCompletadas ?? 0, `${datos.repeticiones || 0} planificadas`));
    metricas.appendChild(crearMetrica("Tiempo", `${sesion?.tiempoMinutos || datos.tiempoEstimadoMinutos || 0} min`, "registrado/estimado"));

    controles.appendChild(crearCampoMini("Tiempo real min", crearInput({ nombre: "tiempoMinutos", tipo: "number", valor: sesion?.tiempoMinutos || datos.tiempoEstimadoMinutos || 0, min: "0" })));
    controles.appendChild(crearCampoMini("Dificultad general", crearSelect("dificultadGeneral", sesion?.dificultadGeneral || "media")));
    controles.appendChild(crearCampoMini("Molestias", crearInput({ nombre: "molestias", valor: sesion?.molestias || "", placeholder: "Ejemplo: ninguna" })));
    controles.appendChild(crearCampoMini("Notas", crearInput({ nombre: "notas", valor: sesion?.notas || "", placeholder: "Nota general" })));

    if (dia.calentamiento) {
      ejercicios.appendChild(crearElemento("article", "entreno-diario-warmup", `Calentamiento: ${dia.calentamiento}`));
    }

    dia.ejercicios.forEach((ejercicio, indice) => ejercicios.appendChild(crearEjercicio(ejercicio, indice, sesion)));
  } else {
    ejercicios.appendChild(crearElemento("article", "entreno-diario-empty", "No hay rutina activa para hoy."));
    ejercicios.appendChild(crearElemento("article", "entreno-diario-empty", "Ve a Rutinas, crea una rutina y márcala como activa."));
  }

  acciones.appendChild(crearBoton("Iniciar sesión", "", onIniciar, !tieneRutina || completada));
  acciones.appendChild(crearBoton("Guardar progreso", "", () => onGuardarProgreso?.(leerFormulario(form, dia)), !tieneRutina || completada));
  acciones.appendChild(crearBoton("Completar sesión", "entreno-diario-button--primary", () => onCompletar?.(leerFormulario(form, dia)), !tieneRutina || completada));

  form.appendChild(metricas);
  form.appendChild(controles);
  form.appendChild(ejercicios);
  form.appendChild(acciones);

  panel.appendChild(crearElemento("h3", "", "Sesión del día"));
  panel.appendChild(form);

  estadoBox.appendChild(crearElemento("h3", "", "Estado"));
  estadoBox.appendChild(crearElemento("p", "", `Sesión: ${sesion?.estado || "sin iniciar"}`));
  estadoBox.appendChild(crearElemento("p", "", `Completados: ${sesion?.ejerciciosCompletados || 0} ejercicio(s)`));
  estadoBox.appendChild(crearElemento("p", "", `IA: ${diario.resumen?.iaActiva ? "activa" : "inactiva"} · Voz: ${diario.resumen?.vozActiva ? "activa" : "inactiva"}`));
  estadoBox.appendChild(crearElemento("p", "entreno-diario-safe", "Ajusta la sesión a tu nivel. Si hay dolor fuerte, mareo o malestar, detén la actividad y descansa."));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  pantalla.appendChild(estadoBox);
  return pantalla;
}
