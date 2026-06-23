/*
  Nombre completo: audio.remote.schema.js
  Ruta o ubicación: src/audio/audio.remote.schema.js

  Función:
    - Definir comandos remotos de audio.
    - Normalizar órdenes enviadas entre celular y computadora.
    - Mantener un formato único para canal local y Firebase.
*/

export const AUDIO_REMOTO_ACCIONES = Object.freeze({
  HABLAR: "hablar",
  INICIAR_HIIT: "iniciar_hiit",
  PAUSAR_HIIT: "pausar_hiit",
  CONTINUAR_HIIT: "continuar_hiit",
  TERMINAR_HIIT: "terminar_hiit",
  SUBIR_VOLUMEN: "subir_volumen",
  BAJAR_VOLUMEN: "bajar_volumen",
  SILENCIAR: "silenciar",
  ACTIVAR_VOZ: "activar_voz",
  ESTADO: "estado"
});

export const AUDIO_REMOTO_ROLES = Object.freeze({
  RECEPTOR: "receptor",
  CONTROL: "control"
});

export const AUDIO_REMOTO_CONFIG = Object.freeze({
  storageKey: "fitjeff_audio_remoto_config",
  canalLocal: "fitjeff_audio_remoto",
  firebaseColeccion: "audioComandos",
  canalDefault: "fitjeff-jeff",
  dispositivoDefault: "dispositivo-fitjeff"
});

export function crearOrdenAudioRemota(datos = {}) {
  return {
    id: datos.id || `orden_audio_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    canalId: normalizarTexto(datos.canalId || AUDIO_REMOTO_CONFIG.canalDefault),
    origenId: normalizarTexto(datos.origenId || AUDIO_REMOTO_CONFIG.dispositivoDefault),
    destinoId: normalizarTexto(datos.destinoId || "todos"),
    accion: normalizarAccionAudio(datos.accion),
    texto: normalizarTexto(datos.texto || ""),
    rutinaId: normalizarTexto(datos.rutinaId || ""),
    payload: datos.payload && typeof datos.payload === "object" ? datos.payload : {},
    creadoEn: datos.creadoEn || new Date().toISOString()
  };
}

export function crearConfigAudioRemotoBase(datos = {}) {
  return {
    rol: Object.values(AUDIO_REMOTO_ROLES).includes(datos.rol) ? datos.rol : AUDIO_REMOTO_ROLES.RECEPTOR,
    canalId: normalizarTexto(datos.canalId || AUDIO_REMOTO_CONFIG.canalDefault),
    dispositivoId: normalizarTexto(datos.dispositivoId || crearIdDispositivo()),
    destinoId: normalizarTexto(datos.destinoId || "todos"),
    usarFirebase: Boolean(datos.usarFirebase),
    receptorActivo: Boolean(datos.receptorActivo),
    actualizadoEn: datos.actualizadoEn || new Date().toISOString()
  };
}

export function normalizarAccionAudio(accion) {
  const limpia = normalizarTexto(accion);

  if (Object.values(AUDIO_REMOTO_ACCIONES).includes(limpia)) {
    return limpia;
  }

  return AUDIO_REMOTO_ACCIONES.HABLAR;
}

export function normalizarTexto(valor = "") {
  return String(valor || "").trim().slice(0, 600);
}

function crearIdDispositivo() {
  const base = `fitjeff_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return base.slice(0, 80);
}
