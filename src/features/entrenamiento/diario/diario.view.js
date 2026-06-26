/*
  Nombre completo: diario.view.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.view.js

  Función o funciones:
    - Construir la pantalla Diario de Entrenamiento.
    - Mostrar rutina activa, ejercicios y estado de la sesión diaria.
    - Permitir iniciar y completar la sesión del día.

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

function crearEjercicio(ejercicio, indice) {
  const item = crearElemento("article", "entreno-diario-exercise");
  item.appendChild(crearElemento("strong", "", `${indice + 1}. ${ejercicio.nombre}`));
  item.appendChild(crearElemento("span", "", `${ejercicio.series} series · ${ejercicio.repeticiones} reps · descanso ${ejercicio.descansoSegundos}s`));
  return item;
}

export function crearEntrenamientoDiarioView({ diario = {}, mensaje = null, onIniciar, onCompletar } = {}) {
  const pantalla = crearElemento("section", "entreno-diario-screen");
  const header = crearElemento("div", "entreno-diario-header");
  const panel = crearElemento("section", "entreno-diario-panel");
  const metricas = crearElemento("div", "entreno-diario-metrics");
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
    metricas.appendChild(crearMetrica("Series", datos.series || 0, "totales"));
    metricas.appendChild(crearMetrica("Reps", datos.repeticiones || 0, "estimadas"));
    metricas.appendChild(crearMetrica("Tiempo", `${datos.tiempoEstimadoMinutos || 0} min`, "estimado"));

    if (dia.calentamiento) {
      ejercicios.appendChild(crearElemento("article", "entreno-diario-warmup", `Calentamiento: ${dia.calentamiento}`));
    }

    dia.ejercicios.forEach((ejercicio, indice) => ejercicios.appendChild(crearEjercicio(ejercicio, indice)));
  } else {
    ejercicios.appendChild(crearElemento("article", "entreno-diario-empty", "No hay rutina activa para hoy."));
    ejercicios.appendChild(crearElemento("article", "entreno-diario-empty", "Ve a Rutinas, crea una rutina y márcala como activa."));
  }

  acciones.appendChild(crearBoton("Iniciar sesión", "", onIniciar, !tieneRutina || completada));
  acciones.appendChild(crearBoton("Completar sesión", "entreno-diario-button--primary", onCompletar, !tieneRutina || completada));

  panel.appendChild(crearElemento("h3", "", "Sesión del día"));
  panel.appendChild(metricas);
  panel.appendChild(ejercicios);
  panel.appendChild(acciones);

  estadoBox.appendChild(crearElemento("h3", "", "Estado"));
  estadoBox.appendChild(crearElemento("p", "", `Sesión: ${sesion?.estado || "sin iniciar"}`));
  estadoBox.appendChild(crearElemento("p", "", `IA: ${diario.resumen?.iaActiva ? "activa" : "inactiva"} · Voz: ${diario.resumen?.vozActiva ? "activa" : "inactiva"}`));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  pantalla.appendChild(estadoBox);
  return pantalla;
}
