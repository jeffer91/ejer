/*
  Nombre completo: ajustes.service.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.service.js

  Función o funciones:
    - Guardar ajustes locales de Gemini, IA y voz.
    - Usar persistencia blindada para que la API Key no desaparezca al limpiar ajustes generales.
    - Migrar una API Key previa desde los ajustes antiguos si existe.
    - Probar conexión Gemini sin exponer la API Key.
    - Probar voz automática con speechSynthesis.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/ajustes/gemini.service.js
    - src/features/entrenamiento/ajustes/gemini-settings.service.js
    - src/features/entrenamiento/ajustes/voice.service.js
    - src/features/entrenamiento/ajustes/ajustes.controller.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearGeminiService } from "./gemini.service.js";
import { crearGeminiSettingsService } from "./gemini-settings.service.js";
import { crearVoiceService } from "./voice.service.js";

export function crearAjustesEntrenamientoService(entrenamientoService = crearEntrenamientoService()) {
  const gemini = crearGeminiService();
  const geminiSettings = crearGeminiSettingsService();
  const voz = crearVoiceService();

  function obtenerAjustesActuales() {
    return entrenamientoService.obtenerEstado().ajustes || {};
  }

  function guardarAjustesSinPerderGemini(ajustes) {
    return entrenamientoService.guardarAjustes(ajustes);
  }

  function obtenerVista() {
    const ajustesActuales = obtenerAjustesActuales();
    const vistaGemini = geminiSettings.obtenerVistaSegura(ajustesActuales);

    if (vistaGemini.settings.apiKey && vistaGemini.ajustes.geminiApiKey !== ajustesActuales.geminiApiKey) {
      guardarAjustesSinPerderGemini(vistaGemini.ajustes);
    }

    return {
      ajustes: vistaGemini.ajustes,
      voces: voz.obtenerVoces(),
      vozSoportada: voz.soportado()
    };
  }

  function guardarDesdeFormulario(datos = {}) {
    const ajustesActuales = obtenerAjustesActuales();
    const resultado = geminiSettings.guardarDesdeFormulario(datos, ajustesActuales);
    return guardarAjustesSinPerderGemini(resultado.ajustes);
  }

  function borrarGeminiKey() {
    const ajustesActuales = obtenerAjustesActuales();
    const resultado = geminiSettings.borrarApiKey(ajustesActuales);
    return guardarAjustesSinPerderGemini({
      ...resultado.ajustes,
      iaActiva: false
    });
  }

  async function probarGemini() {
    const ajustesActuales = obtenerAjustesActuales();
    const vistaGemini = geminiSettings.obtenerVistaSegura(ajustesActuales);
    const resultado = await gemini.probarConexion(vistaGemini.ajustes);
    const persistido = geminiSettings.actualizarPruebaGemini(resultado, vistaGemini.ajustes);

    guardarAjustesSinPerderGemini(persistido.ajustes);
    return resultado;
  }

  function probarVoz() {
    const ajustesActuales = obtenerAjustesActuales();
    const vistaGemini = geminiSettings.obtenerVistaSegura(ajustesActuales);
    const resultado = voz.probarVoz(vistaGemini.ajustes);
    const persistido = geminiSettings.actualizarPruebaVoz(resultado, vistaGemini.ajustes);

    guardarAjustesSinPerderGemini(persistido.ajustes);
    return resultado;
  }

  return {
    obtenerVista,
    guardarDesdeFormulario,
    borrarGeminiKey,
    probarGemini,
    probarVoz
  };
}
