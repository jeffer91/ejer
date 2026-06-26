/*
  Nombre completo: ajustes.service.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.service.js

  Función o funciones:
    - Guardar ajustes locales de Gemini, IA y voz.
    - Probar conexión Gemini sin exponer la API Key.
    - Probar voz automática con speechSynthesis.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/ajustes/gemini.service.js
    - src/features/entrenamiento/ajustes/voice.service.js
    - src/features/entrenamiento/ajustes/ajustes.controller.js
*/

import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearGeminiService } from "./gemini.service.js";
import { crearVoiceService } from "./voice.service.js";

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function numero(valor, defecto = 1) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function ocultarKey(apiKey = "") {
  const key = texto(apiKey);
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export function crearAjustesEntrenamientoService(entrenamientoService = crearEntrenamientoService()) {
  const gemini = crearGeminiService();
  const voz = crearVoiceService();

  function obtenerVista() {
    const ajustes = entrenamientoService.obtenerEstado().ajustes;

    return {
      ajustes: {
        ...ajustes,
        geminiApiKeyVisible: ocultarKey(ajustes.geminiApiKey)
      },
      voces: voz.obtenerVoces(),
      vozSoportada: voz.soportado()
    };
  }

  function guardarDesdeFormulario(datos = {}) {
    const actuales = entrenamientoService.obtenerEstado().ajustes;
    const apiKeyNueva = texto(datos.geminiApiKey);
    const ajustes = {
      ...actuales,
      geminiApiKey: apiKeyNueva || actuales.geminiApiKey,
      geminiModelo: texto(datos.geminiModelo, actuales.geminiModelo || "gemini-1.5-flash"),
      iaActiva: Boolean(datos.iaActiva),
      vozActiva: Boolean(datos.vozActiva),
      vozNombre: texto(datos.vozNombre, actuales.vozNombre),
      volumenVoz: numero(datos.volumenVoz, actuales.volumenVoz || 1),
      velocidadVoz: numero(datos.velocidadVoz, actuales.velocidadVoz || 1)
    };

    return entrenamientoService.guardarAjustes(ajustes);
  }

  function borrarGeminiKey() {
    const actuales = entrenamientoService.obtenerEstado().ajustes;
    return entrenamientoService.guardarAjustes({
      ...actuales,
      geminiApiKey: "",
      iaActiva: false,
      ultimaPruebaGemini: {
        ok: false,
        fecha: new Date().toISOString(),
        mensaje: "API Key eliminada."
      }
    });
  }

  async function probarGemini() {
    const actuales = entrenamientoService.obtenerEstado().ajustes;
    const resultado = await gemini.probarConexion(actuales);

    entrenamientoService.guardarAjustes({
      ...actuales,
      ultimaPruebaGemini: {
        ok: resultado.ok,
        fecha: new Date().toISOString(),
        mensaje: resultado.mensaje
      }
    });

    return resultado;
  }

  function probarVoz() {
    const actuales = entrenamientoService.obtenerEstado().ajustes;
    const resultado = voz.probarVoz(actuales);

    entrenamientoService.guardarAjustes({
      ...actuales,
      ultimaPruebaVoz: {
        ok: resultado.ok,
        fecha: new Date().toISOString(),
        mensaje: resultado.mensaje
      }
    });

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
