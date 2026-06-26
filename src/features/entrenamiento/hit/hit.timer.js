/*
  Nombre completo: hit.timer.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.timer.js

  Función o funciones:
    - Manejar un temporizador simple para HIT/Cardio.
    - Controlar actividad, descanso, rondas y estado actual.
    - Mantener la lógica del reloj separada de la vista.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.controller.js
*/

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

export function formatearSegundos(totalSegundos = 0) {
  const seguro = Math.max(0, Math.floor(numero(totalSegundos, 0)));
  const minutos = String(Math.floor(seguro / 60)).padStart(2, "0");
  const segundos = String(seguro % 60).padStart(2, "0");
  return `${minutos}:${segundos}`;
}

export function crearHitTimer(configuracion = {}) {
  let actividadSegundos = Math.max(5, numero(configuracion.actividadSegundos, 30));
  let descansoSegundos = Math.max(5, numero(configuracion.descansoSegundos, 30));
  let rondasTotales = Math.max(1, numero(configuracion.rondas, 4));
  let rondaActual = 1;
  let fase = "actividad";
  let segundosRestantes = actividadSegundos;
  let intervalo = null;
  let activo = false;
  let onCambio = typeof configuracion.onCambio === "function" ? configuracion.onCambio : () => {};
  let onTerminar = typeof configuracion.onTerminar === "function" ? configuracion.onTerminar : () => {};

  function estado() {
    return {
      activo,
      fase,
      rondaActual,
      rondasTotales,
      segundosRestantes,
      actividadSegundos,
      descansoSegundos,
      tiempoTexto: formatearSegundos(segundosRestantes)
    };
  }

  function emitir() {
    onCambio(estado());
  }

  function detenerIntervalo() {
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  }

  function avanzarFase() {
    if (fase === "actividad") {
      fase = "descanso";
      segundosRestantes = descansoSegundos;
      return;
    }

    if (rondaActual >= rondasTotales) {
      activo = false;
      detenerIntervalo();
      onTerminar(estado());
      emitir();
      return;
    }

    rondaActual += 1;
    fase = "actividad";
    segundosRestantes = actividadSegundos;
  }

  function tick() {
    if (!activo) return;

    segundosRestantes -= 1;

    if (segundosRestantes <= 0) {
      avanzarFase();
    }

    emitir();
  }

  function iniciar() {
    if (activo) return estado();
    activo = true;
    detenerIntervalo();
    intervalo = setInterval(tick, 1000);
    emitir();
    return estado();
  }

  function pausar() {
    activo = false;
    detenerIntervalo();
    emitir();
    return estado();
  }

  function reiniciar(nuevaConfiguracion = {}) {
    pausar();
    actividadSegundos = Math.max(5, numero(nuevaConfiguracion.actividadSegundos, actividadSegundos));
    descansoSegundos = Math.max(5, numero(nuevaConfiguracion.descansoSegundos, descansoSegundos));
    rondasTotales = Math.max(1, numero(nuevaConfiguracion.rondas, rondasTotales));
    rondaActual = 1;
    fase = "actividad";
    segundosRestantes = actividadSegundos;
    emitir();
    return estado();
  }

  function destruir() {
    pausar();
  }

  return {
    estado,
    iniciar,
    pausar,
    reiniciar,
    destruir
  };
}
