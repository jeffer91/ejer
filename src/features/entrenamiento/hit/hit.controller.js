/*
  Nombre completo: hit.controller.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.controller.js

  Función o funciones:
    - Montar la pantalla HIT del módulo Entrenamiento.
    - Registrar intervalos, caminata, bicicleta y otro cardio.
    - Controlar el temporizador simple de intervalos.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.service.js
    - src/features/entrenamiento/hit/hit.timer.js
    - src/features/entrenamiento/hit/hit.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearHitService } from "./hit.service.js";
import { crearHitTimer } from "./hit.timer.js";
import { crearEntrenamientoHitView } from "./hit.view.js";

export function crearEntrenamientoHitController() {
  const service = crearHitService();
  let contenedorActual = null;
  let mensajeActual = null;
  let timer = null;
  let timerEstado = null;

  function destruirTimer() {
    if (timer && typeof timer.destruir === "function") {
      timer.destruir();
    }
    timer = null;
  }

  function actualizarTimer(estado) {
    timerEstado = estado;
    refrescar(mensajeActual, false);
  }

  function configurarTimer(datos = {}) {
    destruirTimer();
    timer = crearHitTimer({
      actividadSegundos: datos.actividadSegundos || 30,
      descansoSegundos: datos.descansoSegundos || 30,
      rondas: datos.rondas || 4,
      onCambio: actualizarTimer,
      onTerminar: () => {
        mensajeActual = { ok: true, mensaje: "Temporizador finalizado." };
      }
    });
    timerEstado = timer.estado();
    refrescar({ ok: true, mensaje: "Temporizador configurado." }, false);
  }

  function refrescar(mensaje = mensajeActual, reconstruirTimer = false) {
    if (!contenedorActual) return;

    if (reconstruirTimer || !timer) {
      configurarTimer({ actividadSegundos: 30, descansoSegundos: 30, rondas: 4 });
      return;
    }

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";
    contenedorActual.appendChild(crearEntrenamientoHitView({
      estado: service.obtenerEstado(),
      timerEstado,
      mensaje,
      onGuardar: (datos) => refrescar(service.guardarRegistro(datos), false),
      onConfigurarTimer: configurarTimer,
      onIniciarTimer: () => {
        timer?.iniciar();
      },
      onPausarTimer: () => {
        timer?.pausar();
      },
      onReiniciarTimer: (datos) => {
        timer?.reiniciar(datos);
      }
    }));
  }

  function montar(contenedor) {
    contenedorActual = contenedor;
    destruirTimer();
    timer = crearHitTimer({
      actividadSegundos: 30,
      descansoSegundos: 30,
      rondas: 4,
      onCambio: actualizarTimer,
      onTerminar: () => {
        mensajeActual = { ok: true, mensaje: "Temporizador finalizado." };
      }
    });
    timerEstado = timer.estado();
    refrescar(null, false);
  }

  function desmontar() {
    destruirTimer();
  }

  return {
    montar,
    desmontar
  };
}
