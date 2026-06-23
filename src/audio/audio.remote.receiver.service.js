/*
  Nombre completo: audio.remote.receiver.service.js
  Ruta o ubicación: src/audio/audio.remote.receiver.service.js

  Función:
    - Activar este dispositivo como receptor sonoro.
    - Escuchar comandos locales y por Firebase.
    - Ejecutar comandos con voz, HIIT y volumen de app.
*/

import { desbloquearAudioFitJeff, hablarFitJeff } from "./audio.speech.service.js";
import { ejecutarOrdenAudioRemota } from "./audio.comandos.service.js";
import { enviarOrdenFirebaseAudio, escucharOrdenesFirebaseAudio } from "./audio.remote.firebase.service.js";
import { AUDIO_REMOTO_CONFIG, crearOrdenAudioRemota } from "./audio.remote.schema.js";
import { marcarReceptorAudioRemoto, obtenerConfigAudioRemoto } from "./audio.remote.storage.service.js";

let canalLocal = null;
let unsubscribeFirebase = null;
let receptorActivo = false;
let iniciadoEn = null;
let ultimaOrdenId = null;

export async function activarReceptorAudioRemoto() {
  const config = obtenerConfigAudioRemoto();

  await desbloquearAudioFitJeff();

  receptorActivo = true;
  iniciadoEn = new Date().toISOString();
  marcarReceptorAudioRemoto(true);

  activarCanalLocal();

  if (config.usarFirebase) {
    try {
      unsubscribeFirebase = await escucharOrdenesFirebaseAudio({
        canalId: config.canalId,
        desdeISO: iniciadoEn,
        onOrden: procesarOrdenRecibida
      });
      await hablarFitJeff("Receptor remoto activado con Firebase.");
    } catch (error) {
      console.warn("No se pudo activar receptor Firebase.", error);
      await hablarFitJeff("Receptor local activado. Firebase no está disponible.");
    }
  } else {
    await hablarFitJeff("Receptor remoto local activado.");
  }

  return obtenerEstadoReceptorAudioRemoto();
}

export function desactivarReceptorAudioRemoto() {
  receptorActivo = false;
  marcarReceptorAudioRemoto(false);

  if (canalLocal) {
    canalLocal.close();
    canalLocal = null;
  }

  if (typeof unsubscribeFirebase === "function") {
    unsubscribeFirebase();
    unsubscribeFirebase = null;
  }

  return obtenerEstadoReceptorAudioRemoto();
}

export async function enviarOrdenAudioRemota(ordenEntrada) {
  const config = obtenerConfigAudioRemoto();
  const orden = crearOrdenAudioRemota({
    canalId: config.canalId,
    origenId: config.dispositivoId,
    destinoId: config.destinoId,
    ...ordenEntrada
  });

  activarCanalLocal();
  canalLocal?.postMessage(orden);

  if (config.usarFirebase) {
    try {
      await enviarOrdenFirebaseAudio(orden);
      return {
        ok: true,
        mensaje: "Orden enviada por canal local y Firebase.",
        orden
      };
    } catch (error) {
      console.warn("No se pudo enviar por Firebase.", error);
      return {
        ok: true,
        mensaje: "Orden enviada localmente. Firebase no respondió.",
        orden,
        advertencia: error.message
      };
    }
  }

  return {
    ok: true,
    mensaje: "Orden enviada por canal local.",
    orden
  };
}

export function obtenerEstadoReceptorAudioRemoto() {
  const config = obtenerConfigAudioRemoto();

  return {
    activo: receptorActivo,
    firebaseActivo: Boolean(config.usarFirebase && unsubscribeFirebase),
    canalLocalActivo: Boolean(canalLocal),
    canalId: config.canalId,
    dispositivoId: config.dispositivoId,
    iniciadoEn,
    ultimaOrdenId
  };
}

function activarCanalLocal() {
  if (canalLocal || !("BroadcastChannel" in window)) return;

  canalLocal = new BroadcastChannel(AUDIO_REMOTO_CONFIG.canalLocal);
  canalLocal.onmessage = (event) => {
    procesarOrdenRecibida(event.data);
  };
}

async function procesarOrdenRecibida(ordenEntrada) {
  if (!receptorActivo) return;

  const config = obtenerConfigAudioRemoto();
  const orden = crearOrdenAudioRemota(ordenEntrada);

  if (orden.id === ultimaOrdenId) return;
  if (orden.canalId !== config.canalId) return;
  if (orden.destinoId !== "todos" && orden.destinoId !== config.dispositivoId) return;

  ultimaOrdenId = orden.id;
  await ejecutarOrdenAudioRemota(orden);
}
