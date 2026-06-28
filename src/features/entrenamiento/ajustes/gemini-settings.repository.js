/*
  Nombre completo: gemini-settings.repository.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/gemini-settings.repository.js

  Función o funciones:
    - Leer y guardar ajustes separados de Gemini con almacenamiento local seguro.
    - Evitar que un JSON dañado borre o rompa los ajustes de IA.
    - Mantener una acción explícita para borrar la API Key.

  Se conecta con:
    - src/features/entrenamiento/ajustes/gemini-settings.service.js
    - src/features/entrenamiento/ajustes/gemini-settings.migration.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../../core/storage/safe-local-storage.service.js";
import { GEMINI_SETTINGS_STORAGE_KEY } from "../entrenamiento.constants.js";
import { normalizarGeminiSettings } from "./gemini-settings.migration.js";

export function crearGeminiSettingsRepository(storage = crearSafeLocalStorageService()) {
  function obtener() {
    return normalizarGeminiSettings(storage.leerJson(GEMINI_SETTINGS_STORAGE_KEY, {}));
  }

  function guardar(settings) {
    const normalizado = normalizarGeminiSettings({
      ...settings,
      actualizadoEn: new Date().toISOString()
    });

    storage.guardarJson(GEMINI_SETTINGS_STORAGE_KEY, normalizado);
    return normalizado;
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
