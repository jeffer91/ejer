/*
  Nombre completo: audio.config.js
  Ruta o ubicación: src/audio/audio.config.js
*/

export const AUDIO_CONFIG = Object.freeze({
  storageKey: "fitjeff_audio_config",
  volumenDefecto: 0.9,
  velocidadDefecto: 1,
  tonoDefecto: 1,
  idioma: "es-ES",
  vozPreferida: ["Spanish", "Español", "Google español", "Microsoft Helena", "Microsoft Pablo"],
  mensajes: {
    audioActivado: "Audio de FitJeff activado.",
    hiitInicio: "Iniciando HIIT.",
    hiitPausa: "HIIT pausado.",
    hiitContinuar: "Continuando HIIT.",
    hiitFinal: "HIIT terminado. Buen trabajo, registra cómo te sentiste.",
    descanso: "Descanso.",
    fuerte: "Fuerte.",
    suave: "Suave.",
    preparar: "Prepárate."
  }
});

export function crearAudioConfigBase(datos = {}) {
  return {
    vozActiva: datos.vozActiva !== false,
    sonidosActivos: datos.sonidosActivos !== false,
    volumen: normalizarVolumen(datos.volumen ?? AUDIO_CONFIG.volumenDefecto),
    velocidad: Number(datos.velocidad || AUDIO_CONFIG.velocidadDefecto),
    tono: Number(datos.tono || AUDIO_CONFIG.tonoDefecto),
    actualizadoEn: datos.actualizadoEn || new Date().toISOString()
  };
}

export function normalizarVolumen(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return AUDIO_CONFIG.volumenDefecto;
  return Math.max(0, Math.min(1, numero));
}
