import { GEMINI_SETTINGS_STORAGE_KEY } from "../entrenamiento.constants.js";
import { normalizarGeminiSettings } from "./gemini-settings.migration.js";

function leerJson(clave, valorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : valorDefecto;
  } catch {
    return valorDefecto;
  }
}

function guardarJson(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
  return valor;
}

export function crearGeminiSettingsRepository() {
  function obtener() {
    return normalizarGeminiSettings(leerJson(GEMINI_SETTINGS_STORAGE_KEY, {}));
  }

  function guardar(settings) {
    return guardarJson(GEMINI_SETTINGS_STORAGE_KEY, normalizarGeminiSettings({
      ...settings,
      actualizadoEn: new Date().toISOString()
    }));
  }

  function borrarApiKey() {
    const actual = obtener();
    return guardar({
      ...actual,
      apiKey: "",
      iaActiva: false,
      ultimaPruebaGemini: {
        ok: false,
        fecha: new Date().toISOString(),
        mensaje: "API Key eliminada."
      }
    });
  }

  return {
    obtener,
    guardar,
    borrarApiKey
  };
}
