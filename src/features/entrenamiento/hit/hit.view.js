/*
  Nombre completo: hit.view.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.view.js

  Función o funciones:
    - Construir la pantalla HIT/Cardio de Entrenamiento.
    - Registrar intervalos, caminata, bicicleta y otro cardio.
    - Mostrar temporizador simple y últimos registros.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.controller.js
    - src/features/entrenamiento/hit/hit.css
*/

import "./hit.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo({ nombre, label, tipo = "text", valor = "", placeholder = "" }) {
  const grupo = crearElemento("label", "entreno-hit-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.value = valor;
  input.placeholder = placeholder;
  input.min = tipo === "number" ? "0" : "";

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearSelect(nombre, label, opciones = []) {
  const grupo = crearElemento("label", "entreno-hit-field");
  const texto = crearElemento("span", "", label);
  const select = document.createElement("select");

  select.name = nombre;
  opciones.forEach((opcion) => {
    const item = document.createElement("option");
    item.value = opcion.value;
    item.textContent = opcion.label;
    select.appendChild(item);
  });

  grupo.appendChild(texto);
  grupo.appendChild(select);
  return grupo;
}

function crearArea(nombre, label, placeholder) {
  const grupo = crearElemento("label", "entreno-hit-field entreno-hit-field--full");
  const texto = crearElemento("span", "", label);
  const area = document.createElement("textarea");

  area.name = nombre;
  area.rows = 3;
  area.placeholder = placeholder;

  grupo.appendChild(texto);
  grupo.appendChild(area);
  return grupo;
}

function leerFormulario(formulario) {
  const datos = new FormData(formulario);

  return {
    tipo: datos.get("tipo"),
    tiempoMinutos: datos.get("tiempoMinutos"),
    distanciaKm: datos.get("distanciaKm"),
    intensidad: datos.get("intensidad"),
    rondas: datos.get("rondas"),
    actividadSegundos: datos.get("actividadSegundos"),
    descansoSegundos: datos.get("descansoSegundos"),
    notas: datos.get("notas")
  };
}

function crearMensaje(mensaje) {
  if (!mensaje) return null;

  const caja = crearElemento("div", mensaje.ok ? "entreno-hit-message entreno-hit-message--ok" : "entreno-hit-message entreno-hit-message--error");
  caja.appendChild(crearElemento("strong", "", mensaje.ok ? "Listo" : "Revisar"));
  caja.appendChild(crearElemento("span", "", mensaje.mensaje || "Acción realizada."));

  if (Array.isArray(mensaje.errores) && mensaje.errores.length > 1) {
    mensaje.errores.slice(1).forEach((error) => caja.appendChild(crearElemento("small", "", error)));
  }

  return caja;
}

function crearResumen(label, valor, detalle) {
  const card = crearElemento("article", "entreno-hit-card");
  card.appendChild(crearElemento("span", "entreno-hit-badge", label));
  card.appendChild(crearElemento("strong", "entreno-hit-card__value", valor));
  card.appendChild(crearElemento("p", "", detalle));
  return card;
}

function crearRegistro(registro) {
  const card = crearElemento("article", "entreno-hit-record");
  const distancia = registro.distanciaKm !== null && registro.distanciaKm !== undefined ? ` · ${registro.distanciaKm} km` : "";
  card.appendChild(crearElemento("strong", "", registro.tipo));
  card.appendChild(crearElemento("span", "", `${registro.fecha} · ${registro.tiempoMinutos} min${distancia}`));
  card.appendChild(crearElemento("small", "", `Intensidad: ${registro.intensidad || "media"}`));
  return card;
}

function crearTimer(timerEstado = {}, acciones = {}) {
  const timer = crearElemento("section", "entreno-hit-timer");
  const form = crearElemento("form", "entreno-hit-timer-form");
  const botones = crearElemento("div", "entreno-hit-actions");
  const tiempo = crearElemento("strong", "entreno-hit-time", timerEstado.tiempoTexto || "00:30");
  const estado = crearElemento("p", "", `Ronda ${timerEstado.rondaActual || 1}/${timerEstado.rondasTotales || 4} · ${timerEstado.fase || "actividad"}`);

  form.appendChild(crearCampo({ nombre: "actividadSegundos", label: "Actividad", tipo: "number", valor: timerEstado.actividadSegundos || 30 }));
  form.appendChild(crearCampo({ nombre: "descansoSegundos", label: "Descanso", tipo: "number", valor: timerEstado.descansoSegundos || 30 }));
  form.appendChild(crearCampo({ nombre: "rondas", label: "Rondas", tipo: "number", valor: timerEstado.rondasTotales || 4 }));

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    acciones.onConfigurarTimer?.(leerFormulario(form));
  });

  const configurar = crearElemento("button", "entreno-hit-button", "Configurar");
  configurar.type = "submit";
  form.appendChild(configurar);

  const iniciar = crearElemento("button", "entreno-hit-button entreno-hit-button--primary", "Iniciar");
  const pausar = crearElemento("button", "entreno-hit-button", "Pausar");
  const reiniciar = crearElemento("button", "entreno-hit-button", "Reiniciar");

  iniciar.type = "button";
  pausar.type = "button";
  reiniciar.type = "button";
  iniciar.addEventListener("click", () => acciones.onIniciarTimer?.());
  pausar.addEventListener("click", () => acciones.onPausarTimer?.());
  reiniciar.addEventListener("click", () => acciones.onReiniciarTimer?.(leerFormulario(form)));

  botones.appendChild(iniciar);
  botones.appendChild(pausar);
  botones.appendChild(reiniciar);

  timer.appendChild(crearElemento("h3", "", "Temporizador"));
  timer.appendChild(tiempo);
  timer.appendChild(estado);
  timer.appendChild(form);
  timer.appendChild(botones);
  return timer;
}

export function crearEntrenamientoHitView({ estado = {}, timerEstado = {}, mensaje = null, onGuardar, onConfigurarTimer, onIniciarTimer, onPausarTimer, onReiniciarTimer } = {}) {
  const pantalla = crearElemento("section", "entreno-hit-screen");
  const header = crearElemento("div", "entreno-hit-header");
  const grid = crearElemento("div", "entreno-hit-grid");
  const formBox = crearElemento("section", "entreno-hit-panel");
  const form = crearElemento("form", "entreno-hit-form");
  const registrosBox = crearElemento("section", "entreno-hit-panel");
  const registros = crearElemento("div", "entreno-hit-records");
  const resumen = estado.resumen || {};
  const mensajeNodo = crearMensaje(mensaje);

  header.appendChild(crearElemento("p", "entreno-hit-kicker", "Cardio"));
  header.appendChild(crearElemento("h2", "", "HIT"));
  header.appendChild(crearElemento("p", "", "Registra intervalos controlados, caminata, bicicleta y otro cardio."));

  grid.appendChild(crearResumen("Registros", resumen.total || 0, "cardio guardado"));
  grid.appendChild(crearResumen("Tiempo", `${resumen.tiempoTotalMinutos || 0} min`, "total acumulado"));
  grid.appendChild(crearResumen("Distancia", `${Number(resumen.distanciaTotalKm || 0).toFixed(1)} km`, "opcional"));
  grid.appendChild(crearResumen("HIT", resumen.intervalos || 0, "intervalos registrados"));

  form.appendChild(crearSelect("tipo", "Tipo", [
    { value: "intervalos", label: "HIT / Intervalos" },
    { value: "caminata", label: "Caminata" },
    { value: "bicicleta", label: "Bicicleta" },
    { value: "otro", label: "Otro cardio" }
  ]));
  form.appendChild(crearCampo({ nombre: "tiempoMinutos", label: "Tiempo", tipo: "number", valor: "20" }));
  form.appendChild(crearCampo({ nombre: "distanciaKm", label: "Distancia km", tipo: "number", placeholder: "Opcional" }));
  form.appendChild(crearSelect("intensidad", "Intensidad", [
    { value: "suave", label: "Suave" },
    { value: "media", label: "Media" },
    { value: "alta", label: "Alta" }
  ]));
  form.appendChild(crearCampo({ nombre: "rondas", label: "Rondas", tipo: "number", valor: "4" }));
  form.appendChild(crearCampo({ nombre: "actividadSegundos", label: "Actividad seg", tipo: "number", valor: "30" }));
  form.appendChild(crearCampo({ nombre: "descansoSegundos", label: "Descanso seg", tipo: "number", valor: "30" }));
  form.appendChild(crearArea("notas", "Notas", "Ejemplo: sesión cómoda, buen ritmo, sin molestias."));

  const guardar = crearElemento("button", "entreno-hit-button entreno-hit-button--primary", "Guardar cardio");
  guardar.type = "submit";
  form.appendChild(guardar);
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    onGuardar?.(leerFormulario(form));
  });

  formBox.appendChild(crearElemento("h3", "", "Registrar cardio"));
  if (mensajeNodo) formBox.appendChild(mensajeNodo);
  formBox.appendChild(form);

  registrosBox.appendChild(crearElemento("h3", "", "Últimos registros"));
  (estado.registros || []).slice(0, 5).forEach((registro) => registros.appendChild(crearRegistro(registro)));
  if (!estado.registros || estado.registros.length === 0) {
    registros.appendChild(crearElemento("p", "", "Todavía no hay registros de cardio."));
  }
  registrosBox.appendChild(registros);

  pantalla.appendChild(header);
  pantalla.appendChild(grid);
  pantalla.appendChild(crearTimer(timerEstado, { onConfigurarTimer, onIniciarTimer, onPausarTimer, onReiniciarTimer }));
  pantalla.appendChild(formBox);
  pantalla.appendChild(registrosBox);
  return pantalla;
}
