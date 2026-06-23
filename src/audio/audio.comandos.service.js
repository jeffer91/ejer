/*
  Nombre completo: audio.comandos.service.js
  Ruta o ubicación: src/audio/audio.comandos.service.js

  Función:
    - Ejecutar órdenes remotas de audio.
    - Hablar por los parlantes del dispositivo receptor.
    - Controlar HIIT sonoro y volumen de voz de FitJeff.
*/

import {
  activarVozAudio,
  bajarVolumenAudio,
  hablarFitJeff,
  silenciarVozAudio,
  subirVolumenAudio
} from "./audio.speech.service.js";
import { AUDIO_REMOTO_ACCIONES, crearOrdenAudioRemota } from "./audio.remote.schema.js";
import { obtenerRutinaHIITPorId } from "../hiit/hiit.rutinas.js";
import { continuarHIIT, detenerHIIT, iniciarHIIT, pausarHIIT } from "../hiit/hiit.timer.service.js";
import { navegarA, VISTAS_APP } from "../ui/router.js";

export async function ejecutarOrdenAudioRemota(ordenEntrada) {
  const orden = crearOrdenAudioRemota(ordenEntrada);

  if (orden.accion === AUDIO_REMOTO_ACCIONES.HABLAR) {
    await hablarFitJeff(orden.texto || "FitJeff conectado.");
    return crearResultadoOrden(orden, "Mensaje hablado en este dispositivo.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.INICIAR_HIIT) {
    const rutina = obtenerRutinaHIITPorId(orden.rutinaId || "rapido-10");

    navegarA(VISTAS_APP.HIIT);

    iniciarHIIT({
      rutina,
      onFin: () => hablarFitJeff("HIIT remoto finalizado.")
    });

    return crearResultadoOrden(orden, `HIIT iniciado: ${rutina.nombre}.`);
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.PAUSAR_HIIT) {
    pausarHIIT();
    return crearResultadoOrden(orden, "HIIT pausado.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.CONTINUAR_HIIT) {
    continuarHIIT();
    return crearResultadoOrden(orden, "HIIT continuado.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.TERMINAR_HIIT) {
    detenerHIIT();
    return crearResultadoOrden(orden, "HIIT terminado.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.SUBIR_VOLUMEN) {
    const config = subirVolumenAudio();
    await hablarFitJeff(`Volumen de FitJeff ${Math.round(config.volumen * 100)} por ciento.`);
    return crearResultadoOrden(orden, "Volumen de FitJeff aumentado.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.BAJAR_VOLUMEN) {
    const config = bajarVolumenAudio();
    await hablarFitJeff(`Volumen de FitJeff ${Math.round(config.volumen * 100)} por ciento.`);
    return crearResultadoOrden(orden, "Volumen de FitJeff reducido.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.SILENCIAR) {
    silenciarVozAudio();
    return crearResultadoOrden(orden, "Voz de FitJeff silenciada.");
  }

  if (orden.accion === AUDIO_REMOTO_ACCIONES.ACTIVAR_VOZ) {
    activarVozAudio();
    await hablarFitJeff("Voz de FitJeff activada.");
    return crearResultadoOrden(orden, "Voz de FitJeff activada.");
  }

  await hablarFitJeff("Comando recibido.");
  return crearResultadoOrden(orden, "Comando recibido.");
}

function crearResultadoOrden(orden, mensaje) {
  return {
    ok: true,
    orden,
    mensaje,
    ejecutadoEn: new Date().toISOString()
  };
}
