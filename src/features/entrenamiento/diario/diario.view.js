/*
  Nombre completo: diario.view.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.view.js

  Función o funciones:
    - Construir la pantalla Diario de Entrenamiento.
    - Mostrar rutina activa, día seleccionado, ejercicios y estado de la sesión diaria.
    - Permitir cambiar manualmente qué día de rutina se cargará hoy.
    - Permitir marcar ejercicios, guardar progreso y completar sesión con detalle.
    - Registrar ejercicios por repeticiones, por tiempo, mixtos o por distancia.

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

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
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

function crearInput({ nombre, tipo = "text", valor = "", min = "0", placeholder = "", step = "1" }) {
  const input = document.createElement("input");
  input.name = nombre;
  input.type = tipo;
  input.value = valor ?? "";
  input.min = min;
  input.placeholder = placeholder;
  if (tipo === "number") input.step = step;
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

function crearCampoMini(label, control) {
  const grupo = crearElemento("label", "entreno-diario-mini");
  grupo.appendChild(crearElemento("span", "", label));
  grupo.appendChild(control);
  return grupo;
}

function crearCheckMini(label, nombre, activo = false) {
  const grupo = crearElemento("label", "entreno-diario-mini entreno-diario-mini--check");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = nombre;
  input.checked = Boolean(activo);
  grupo.appendChild(input);
  grupo.appendChild(crearElemento("span", "", label));
  return grupo;
}

function medicionEjercicio(ejercicio = {}) {
  const medicion = ejercicio.medicion || "repeticiones";
  if (["repeticiones", "tiempo", "mixto", "distancia"].includes(medicion)) return medicion;
  if (numero(ejercicio.duracionMinutos, 0) > 0 || numero(ejercicio.duracionSegundos, 0) > 0) return "tiempo";
  if (numero(ejercicio.distanciaKm, 0) > 0) return "distancia";
  return "repeticiones";
}

function formatearDuracion(ejercicio = {}) {
  const minutos = numero(ejercicio.duracionMinutos, 0);
  const segundos = numero(ejercicio.duracionSegundos, 0);

  if (segundos > 0 && segundos < 60) return `${segundos}s`;
  if (minutos > 0) return `${minutos} min`;
  if (segundos >= 60) return `${Math.round((segundos / 60) * 100) / 100} min`;
  if (ejercicio.duracion) return ejercicio.duracion;
  return "";
}

function crearChip(textoChip, clase = "") {
  return crearElemento("span", `entreno-diario-chip ${clase}`.trim(), textoChip);
}

function describirEjercicioPlan(ejercicio = {}) {
  const medicion = medicionEjercicio(ejercicio);
  const partes = [];
  const duracion = formatearDuracion(ejercicio);
  const distancia = numero(ejercicio.distanciaKm, 0);

  if (medicion === "tiempo") {
    if (duracion) partes.push(duracion);
  } else if (medicion === "mixto") {
    if (ejercicio.series) partes.push(`${ejercicio.series} serie(s)`);
    if (ejercicio.repeticiones) partes.push(`${ejercicio.repeticiones} rep.`);
    if (duracion) partes.push(duracion);
  } else if (medicion === "distancia") {
    if (distancia > 0) partes.push(`${distancia} km`);
    if (duracion) partes.push(duracion);
  } else {
    if (ejercicio.series && ejercicio.repeticiones) partes.push(`${ejercicio.series}x${ejercicio.repeticiones}`);
    else if (ejercicio.series) partes.push(`${ejercicio.series} serie(s)`);
    else if (ejercicio.repeticiones) partes.push(`${ejercicio.repeticiones} rep.`);
  }

  if (ejercicio.descansoSegundos) partes.push(`descanso ${ejercicio.descansoSegundos}s`);
  if (ejercicio.intensidad) partes.push(ejercicio.intensidad);
  if (ejercicio.notas) partes.push(ejercicio.notas);

  return partes.join(" · ") || "Sin detalle planificado";
}

function agregarCamposRepeticiones(grid, ejercicio, detalle) {
  const medicion = medicionEjercicio(ejercicio);
  if (!["repeticiones", "mixto"].includes(medicion)) return;

  grid.appendChild(crearCampoMini("Series hechas", crearInput({ nombre: `series_${ejercicio.id}`, tipo: "number", valor: detalle?.seriesCompletadas ?? 0 })));
  grid.appendChild(crearCampoMini("Reps hechas", crearInput({ nombre: `reps_${ejercicio.id}`, tipo: "number", valor: detalle?.repeticionesCompletadas ?? 0 })));
}

function agregarCamposTiempo(grid, ejercicio, detalle) {
  const medicion = medicionEjercicio(ejercicio);
  if (!["tiempo", "mixto", "distancia"].includes(medicion)) return;

  grid.appendChild(crearCampoMini("Tiempo real min", crearInput({ nombre: `tiempo_min_${ejercicio.id}`, tipo: "number", valor: detalle?.tiempoCompletadoMinutos ?? 0, min: "0", step: "0.1", placeholder: "10" })));
  grid.appendChild(crearCampoMini("Tiempo real s", crearInput({ nombre: `tiempo_seg_${ejercicio.id}`, tipo: "number", valor: detalle?.tiempoCompletadoSegundos ?? 0, min: "0", placeholder: "45" })));
}

function agregarCamposDistancia(grid, ejercicio, detalle) {
  const medicion = medicionEjercicio(ejercicio);
  if (medicion !== "distancia") return;

  grid.appendChild(crearCampoMini("Distancia real km", crearInput({ nombre: `distancia_${ejercicio.id}`, tipo: "number", valor: detalle?.distanciaCompletadaKm ?? "", min: "0", step: "0.1", placeholder: String(ejercicio.distanciaKm || "") })));
}

function crearEjercicio(ejercicio, indice, sesion) {
  const detalle = obtenerDetalle(sesion, ejercicio.id);
  const medicion = medicionEjercicio(ejercicio);
  const item = crearElemento("article", "entreno-diario-exercise");
  const top = crearElemento("label", "entreno-diario-exercise__top");
  const titulo = crearElemento("div", "entreno-diario-exercise__title");
  const chips = crearElemento("div", "entreno-diario-chips");
  const check = document.createElement("input");
  const grid = crearElemento("div", "entreno-diario-exercise__grid");
  const nota = document.createElement("textarea");

  check.type = "checkbox";
  check.name = `ejercicio_${ejercicio.id}_completado`;
  check.checked = Boolean(detalle?.completado);

  chips.appendChild(crearChip(medicion, `entreno-diario-chip--${medicion}`));
  if (ejercicio.tipo) chips.appendChild(crearChip(ejercicio.tipo));

  titulo.appendChild(crearElemento("strong", "", `${indice + 1}. ${ejercicio.nombre}`));
  titulo.appendChild(chips);

  top.appendChild(check);
  top.appendChild(titulo);
  item.appendChild(top);
  item.appendChild(crearElemento("span", "entreno-diario-exercise__base", describirEjercicioPlan(ejercicio)));

  agregarCamposRepeticiones(grid, ejercicio, detalle);
  agregarCamposTiempo(grid, ejercicio, detalle);
  agregarCamposDistancia(grid, ejercicio, detalle);
  grid.appendChild(crearCampoMini("Dificultad", crearSelect(`dificultad_${ejercicio.id}`, detalle?.dificultad || "media")));
  grid.appendChild(crearCheckMini("Al fallo", `fallo_${ejercicio.id}`, detalle?.alFallo));

  nota.name = `nota_${ejercicio.id}`;
  nota.rows = 2;
  nota.placeholder = "Nota del ejercicio. Ejemplo: al fallo, peso usado, molestia o ajuste.";
  nota.value = detalle?.notas || "";

  item.appendChild(grid);
  item.appendChild(nota);
  return item;
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
      tipo: ejercicio.tipo || "otro",
      medicion: medicionEjercicio(ejercicio),
      completado: datos.get(`ejercicio_${ejercicio.id}_completado`) === "on",
      seriesCompletadas: datos.get(`series_${ejercicio.id}`) || 0,
      repeticionesCompletadas: datos.get(`reps_${ejercicio.id}`) || 0,
      tiempoCompletadoMinutos: datos.get(`tiempo_min_${ejercicio.id}`) || 0,
      tiempoCompletadoSegundos: datos.get(`tiempo_seg_${ejercicio.id}`) || 0,
      distanciaCompletadaKm: datos.get(`distancia_${ejercicio.id}`) || "",
      alFallo: datos.get(`fallo_${ejercicio.id}`) === "on",
      dificultad: datos.get(`dificultad_${ejercicio.id}`),
      notas: datos.get(`nota_${ejercicio.id}`)
    }))
  };
}

function crearSelectorDiaDiario(rutinaDelDia = {}, onSeleccionarDia) {
  const dias = rutinaDelDia.diasDisponibles || [];
  if (!dias.length || typeof onSeleccionarDia !== "function") return null;

  const form = crearElemento("form", "entreno-diario-day-selector");
  const label = crearElemento("label", "entreno-diario-mini");
  const texto = crearElemento("span", "", "Día que toca hoy");
  const select = document.createElement("select");
  const boton = crearElemento("button", "entreno-diario-button", "Cambiar día");
  const ayuda = crearElemento("small", "", rutinaDelDia.explicacion || "Puedes ajustar el día si tu semana no coincide con el automático.");

  select.name = "diaRutinaId";
  dias.forEach((dia) => {
    const option = document.createElement("option");
    option.value = dia.id;
    option.textContent = `${dia.nombre} · ${dia.totalEjercicios} ejercicio(s)`;
    option.selected = dia.id === rutinaDelDia.diaSeleccionadoId;
    select.appendChild(option);
  });

  boton.type = "submit";
  label.appendChild(texto);
  label.appendChild(select);
  form.appendChild(label);
  form.appendChild(boton);
  form.appendChild(ayuda);
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    onSeleccionarDia(new FormData(form).get("diaRutinaId"));
  });

  return form;
}

export function crearEntrenamientoDiarioView({ diario = {}, mensaje = null, onSeleccionarDia, onIniciar, onGuardarProgreso, onCompletar } = {}) {
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
  const selectorDia = tieneRutina ? crearSelectorDiaDiario(rutinaDelDia, onSeleccionarDia) : null;

  header.appendChild(crearElemento("p", "entreno-diario-kicker", rutinaDelDia.diaSemana || "Hoy"));
  header.appendChild(crearElemento("h2", "", "Diario"));
  header.appendChild(crearElemento("p", "", tieneRutina ? `${rutina.nombre} · ${dia.nombre}` : "Crea y activa una rutina para cargar el día automáticamente."));
  if (tieneRutina) {
    header.appendChild(crearElemento("small", "entreno-diario-safe", `Selección: ${rutinaDelDia.modoSeleccion === "manual" ? "manual" : "automática"} · Día ${Number(rutinaDelDia.diaIndice || 0) + 1} de ${rutinaDelDia.diaTotal || 1}`));
  }

  if (mensajeNodo) {
    panel.appendChild(mensajeNodo);
  }

  if (selectorDia) {
    panel.appendChild(selectorDia);
  }

  if (tieneRutina) {
    metricas.appendChild(crearMetrica("Ejercicios", datos.ejercicios || 0, "preparados"));
    metricas.appendChild(crearMetrica("Series", sesion?.seriesCompletadas ?? 0, `${datos.series || 0} planificadas`));
    metricas.appendChild(crearMetrica("Reps", sesion?.repeticionesCompletadas ?? 0, `${datos.repeticiones || 0} planificadas`));
    metricas.appendChild(crearMetrica("Tiempo", `${sesion?.tiempoMinutos || datos.tiempoEstimadoMinutos || 0} min`, `${datos.tiempoPlanificadoMinutos || 0} min planificados`));
    metricas.appendChild(crearMetrica("Distancia", `${sesion?.distanciaCompletadaKm || 0} km`, `${datos.distanciaPlanificadaKm || 0} km planificados`));
    metricas.appendChild(crearMetrica("Medición", `${datos.porTiempo || 0} tiempo`, `${datos.porRepeticiones || 0} reps · ${datos.mixtos || 0} mixto · ${datos.porDistancia || 0} distancia`));

    controles.appendChild(crearCampoMini("Tiempo real min", crearInput({ nombre: "tiempoMinutos", tipo: "number", valor: sesion?.tiempoMinutos || datos.tiempoEstimadoMinutos || 0, min: "0", step: "0.1" })));
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
  estadoBox.appendChild(crearElemento("p", "", `Tiempo: ${sesion?.tiempoMinutos || 0} min · Distancia: ${sesion?.distanciaCompletadaKm || 0} km`));
  estadoBox.appendChild(crearElemento("p", "", `IA: ${diario.resumen?.iaActiva ? "activa" : "inactiva"} · Voz: ${diario.resumen?.vozActiva ? "activa" : "inactiva"}`));
  estadoBox.appendChild(crearElemento("p", "entreno-diario-safe", "Ajusta la sesión a tu nivel. Si hay dolor fuerte, mareo o malestar, detén la actividad y descansa."));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  pantalla.appendChild(estadoBox);
  return pantalla;
}
