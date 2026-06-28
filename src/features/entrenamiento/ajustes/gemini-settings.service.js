import { GEMINI_MODELO_RECOMENDADO } from "./gemini.service.js";
import { migrarGeminiSettingsDesdeAjustes, normalizarGeminiSettings } from "./gemini-settings.migration.js";
import { crearGeminiSettingsRepository } from "./gemini-settings.repository.js";

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

function normalizarModeloGemini(modelo, defecto = GEMINI_MODELO_RECOMENDADO) {
  const valor = texto(modelo, defecto);
  return /^gemini-1\.5/i.test(valor) ? defecto : valor;
}

function construirAjustesEntrenamiento(settings, ajustesActuales = {}) {
  const limpio = normalizarGeminiSettings(settings);

  return {
    ...ajustesActuales,
    geminiApiKey: limpio.apiKey,
    geminiModelo: normalizarModeloGemini(limpio.modelo),
    iaActiva: Boolean(limpio.iaActiva),
    vozActiva: Boolean(limpio.vozActiva),
    vozNombre: texto(limpio.vozNombre, ajustesActuales.vozNombre),
    volumenVoz: numero(limpio.volumenVoz, ajustesActuales.volumenVoz || 1),
    velocidadVoz: numero(limpio.velocidadVoz, ajustesActuales.velocidadVoz || 1),
    ultimaPruebaGemini: limpio.ultimaPruebaGemini || ajustesActuales.ultimaPruebaGemini || null,
    ultimaPruebaVoz: limpio.ultimaPruebaVoz || ajustesActuales.ultimaPruebaVoz || null
  };
}

export function crearGeminiSettingsService(repository = crearGeminiSettingsRepository()) {
  function sincronizarDesdeAjustes(ajustesActuales = {}) {
    const actual = repository.obtener();
    const migracion = migrarGeminiSettingsDesdeAjustes(actual, ajustesActuales);

    if (migracion.cambiado) {
      return repository.guardar(migracion.settings);
    }

    return migracion.settings;
  }

  function obtenerVistaSegura(ajustesActuales = {}) {
    const settings = sincronizarDesdeAjustes(ajustesActuales);
    const ajustes = construirAjustesEntrenamiento(settings, ajustesActuales);
    const tieneApiKey = Boolean(settings.apiKey);

    return {
      settings,
      ajustes: {
        ...ajustes,
        geminiModelo: normalizarModeloGemini(ajustes.geminiModelo),
        geminiApiKeyVisible: ocultarKey(settings.apiKey),
        geminiPersistencia: tieneApiKey ? "Guardada en almacenamiento blindado" : "Sin API Key guardada",
        geminiActualizadoEn: settings.actualizadoEn || ""
      }
    };
  }

  function guardarDesdeFormulario(datos = {}, ajustesActuales = {}) {
    const actuales = sincronizarDesdeAjustes(ajustesActuales);
    const apiKeyNueva = texto(datos.geminiApiKey);
    const settings = repository.guardar({
      ...actuales,
      apiKey: apiKeyNueva || actuales.apiKey || texto(ajustesActuales.geminiApiKey),
      modelo: normalizarModeloGemini(datos.geminiModelo || actuales.modelo || ajustesActuales.geminiModelo),
      iaActiva: Boolean(datos.iaActiva),
      vozActiva: Boolean(datos.vozActiva),
      vozNombre: texto(datos.vozNombre, actuales.vozNombre || ajustesActuales.vozNombre),
      volumenVoz: numero(datos.volumenVoz, actuales.volumenVoz || ajustesActuales.volumenVoz || 1),
      velocidadVoz: numero(datos.velocidadVoz, actuales.velocidadVoz || ajustesActuales.velocidadVoz || 1),
      ultimaPruebaGemini: actuales.ultimaPruebaGemini || ajustesActuales.ultimaPruebaGemini || null,
      ultimaPruebaVoz: actuales.ultimaPruebaVoz || ajustesActuales.ultimaPruebaVoz || null,
      origen: "formulario-ajustes-entrenamiento"
    });

    return {
      settings,
      ajustes: construirAjustesEntrenamiento(settings, ajustesActuales)
    };
  }

  function actualizarPruebaGemini(resultado, ajustesActuales = {}) {
    const actuales = sincronizarDesdeAjustes(ajustesActuales);
    const settings = repository.guardar({
      ...actuales,
      modelo: normalizarModeloGemini(resultado?.modeloUsado || actuales.modelo || ajustesActuales.geminiModelo),
      ultimaPruebaGemini: {
        ok: Boolean(resultado?.ok),
        fecha: new Date().toISOString(),
        mensaje: resultado?.modeloUsado
          ? `${resultado.mensaje} Modelo usado: ${resultado.modeloUsado}.`
          : resultado?.mensaje || "Prueba finalizada."
      }
    });

    return {
      settings,
      ajustes: construirAjustesEntrenamiento(settings, ajustesActuales)
    };
  }

  function actualizarPruebaVoz(resultado, ajustesActuales = {}) {
    const actuales = sincronizarDesdeAjustes(ajustesActuales);
    const settings = repository.guardar({
      ...actuales,
      ultimaPruebaVoz: {
        ok: Boolean(resultado?.ok),
        fecha: new Date().toISOString(),
        mensaje: resultado?.mensaje || "Prueba de voz finalizada."
      }
    });

    return {
      settings,
      ajustes: construirAjustesEntrenamiento(settings, ajustesActuales)
    };
  }

  function borrarApiKey(ajustesActuales = {}) {
    const settings = repository.borrarApiKey();
    return {
      settings,
      ajustes: construirAjustesEntrenamiento(settings, ajustesActuales)
    };
  }

  return {
    sincronizarDesdeAjustes,
    obtenerVistaSegura,
    guardarDesdeFormulario,
    actualizarPruebaGemini,
    actualizarPruebaVoz,
    borrarApiKey
  };
}
