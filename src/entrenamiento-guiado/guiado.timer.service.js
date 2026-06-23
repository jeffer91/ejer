/*
  Nombre completo: guiado.timer.service.js
  Ruta o ubicación: src/entrenamiento-guiado/guiado.timer.service.js

  Función:
    - Manejar el reloj interno del entrenamiento guiado.
    - Actualizar segundos restantes y segundos transcurridos.
    - Emitir eventos para refrescar la interfaz.

  Se conecta con:
    - src/entrenamiento-guiado/guiado.estado.js
    - src/vistas/entrenamiento-guiado.view.js
*/

import { GUIADO_EVENTOS, obtenerEstadoGuiado, actualizarEstadoGuiado } from "./guiado.estado.js";

let relojId = null;
let funcionAlCompletar = null;

export function iniciarTimerGuiado(segundos, onFinal = null) {
  detenerTimerGuiado();

  const total = Math.max(0, Number(segundos || 0));
  funcionAlCompletar = typeof onFinal === "function" ? onFinal : null;

  actualizarEstadoGuiado({
    segundosRestantes: total
  });

  emitirTimerGuiado();

  if (total <= 0) {
    completarTimerGuiado();
    return { ok: true, segundos: 0 };
  }

  relojId = window.setInterval(() => {
    const estado = obtenerEstadoGuiado();

    if (estado.pausado) {
      return;
    }

    const siguiente = Math.max(0, Number(estado.segundosRestantes || 0) - 1);

    actualizarEstadoGuiado({
      segundosRestantes: siguiente,
      segundosTranscurridos: Number(estado.segundosTranscurridos || 0) + 1
    });

    emitirTimerGuiado();

    if (siguiente <= 0) {
      completarTimerGuiado();
    }
  }, 1000);

  return { ok: true, segundos: total };
}

export function detenerTimerGuiado() {
  if (relojId) {
    window.clearInterval(relojId);
  }

  relojId = null;
  funcionAlCompletar = null;

  return { ok: true };
}

export function pausarTimerGuiado() {
  actualizarEstadoGuiado({ pausado: true });
  emitirTimerGuiado();
  return { ok: true };
}

export function continuarTimerGuiado() {
  actualizarEstadoGuiado({ pausado: false });
  emitirTimerGuiado();
  return { ok: true };
}

export function sumarTiempoTimerGuiado(segundosExtra = 30) {
  const estado = obtenerEstadoGuiado();
  const nuevoTiempo = Number(estado.segundosRestantes || 0) + Number(segundosExtra || 0);

  actualizarEstadoGuiado({
    segundosRestantes: nuevoTiempo
  });

  emitirTimerGuiado();

  return {
    ok: true,
    segundosRestantes: nuevoTiempo
  };
}

export function reiniciarTimerGuiado(segundos = 0) {
  detenerTimerGuiado();

  actualizarEstadoGuiado({
    segundosRestantes: Math.max(0, Number(segundos || 0)),
    segundosTranscurridos: 0
  });

  emitirTimerGuiado();

  return { ok: true };
}

export function formatearTiempoGuiado(segundos = 0) {
  const total = Math.max(0, Number(segundos || 0));
  const minutos = Math.floor(total / 60);
  const segundosFinales = total % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundosFinales).padStart(2, "0")}`;
}

export function estaActivoTimerGuiado() {
  return Boolean(relojId);
}

function completarTimerGuiado() {
  const funcion = funcionAlCompletar;
  detenerTimerGuiado();

  if (funcion) {
    funcion();
  }
}

function emitirTimerGuiado() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(GUIADO_EVENTOS.TIMER, {
    detail: obtenerEstadoGuiado()
  }));
}
