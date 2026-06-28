import { GEMINI_MODELO_RECOMENDADO } from "./gemini.service.js";

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function normalizarModeloGemini(modelo, defecto = GEMINI_MODELO_RECOMENDADO) {
  const valor = texto(modelo, defecto);
  return /^gemini-1\.5/i.test(valor) ? defecto : valor;
}

export function normalizarGeminiSettings(datos = {}) {
  return {
    version: 1,
    apiKey: texto(datos.apiKey || datos.geminiApiKey),
    modelo: normalizarModeloGemini(datos.modelo || datos.geminiModelo),
    iaActiva: Boolean(datos.iaActiva),
    vozActiva: Boolean(datos.vozActiva),
    vozNombre: texto(datos.vozNombre),
    volumenVoz: Number.isFinite(Number(datos.volumenVoz)) ? Math.min(Math.max(Number(datos.volumenVoz), 0), 1) : 1,
    velocidadVoz: Number.isFinite(Number(datos.velocidadVoz)) ? Math.min(Math.max(Number(datos.velocidadVoz), 0.5), 2) : 1,
    ultimaPruebaGemini: datos.ultimaPruebaGemini || null,
    ultimaPruebaVoz: datos.ultimaPruebaVoz || null,
    origen: texto(datos.origen, "gemini-settings"),
    migradoDesdeAjustes: Boolean(datos.migradoDesdeAjustes),
    creadoEn: texto(datos.creadoEn) || new Date().toISOString(),
    actualizadoEn: texto(datos.actualizadoEn) || new Date().toISOString()
  };
}

export function migrarGeminiSettingsDesdeAjustes(settingsActuales = {}, ajustesEntrenamiento = {}) {
  const settings = normalizarGeminiSettings(settingsActuales);
  const apiKeyLegacy = texto(ajustesEntrenamiento.geminiApiKey);

  if (settings.apiKey || !apiKeyLegacy) {
    return {
      cambiado: false,
      settings
    };
  }

  return {
    cambiado: true,
    settings: normalizarGeminiSettings({
      ...settings,
      apiKey: apiKeyLegacy,
      modelo: ajustesEntrenamiento.geminiModelo || settings.modelo,
      iaActiva: ajustesEntrenamiento.iaActiva,
      vozActiva: ajustesEntrenamiento.vozActiva,
      vozNombre: ajustesEntrenamiento.vozNombre,
      volumenVoz: ajustesEntrenamiento.volumenVoz,
      velocidadVoz: ajustesEntrenamiento.velocidadVoz,
      ultimaPruebaGemini: ajustesEntrenamiento.ultimaPruebaGemini,
      ultimaPruebaVoz: ajustesEntrenamiento.ultimaPruebaVoz,
      origen: "migrado-desde-entrenamiento-ajustes",
      migradoDesdeAjustes: true,
      actualizadoEn: new Date().toISOString()
    })
  };
}
