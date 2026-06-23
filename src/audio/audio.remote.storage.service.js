/*
  Nombre completo: audio.remote.storage.service.js
  Ruta o ubicación: src/audio/audio.remote.storage.service.js

  Función:
    - Guardar configuración del control remoto sonoro.
    - Recordar canal, rol, dispositivo y uso de Firebase.
*/

import { AUDIO_REMOTO_CONFIG, crearConfigAudioRemotoBase } from "./audio.remote.schema.js";

export function obtenerConfigAudioRemoto() {
  try {
    const datos = JSON.parse(localStorage.getItem(AUDIO_REMOTO_CONFIG.storageKey) || "{}");
    return crearConfigAudioRemotoBase(datos);
  } catch (_) {
    return crearConfigAudioRemotoBase();
  }
}

export function guardarConfigAudioRemoto(config = {}) {
  const actual = obtenerConfigAudioRemoto();
  const normalizada = crearConfigAudioRemotoBase({
    ...actual,
    ...config,
    actualizadoEn: new Date().toISOString()
  });

  localStorage.setItem(AUDIO_REMOTO_CONFIG.storageKey, JSON.stringify(normalizada));
  return normalizada;
}

export function cambiarRolAudioRemoto(rol) {
  return guardarConfigAudioRemoto({ rol });
}

export function activarFirebaseAudioRemoto(activo) {
  return guardarConfigAudioRemoto({ usarFirebase: Boolean(activo) });
}

export function marcarReceptorAudioRemoto(activo) {
  return guardarConfigAudioRemoto({ receptorActivo: Boolean(activo) });
}
