/*
  Nombre completo: rutinas.ia.validator.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.ia.validator.js

  Función o funciones:
    - Normalizar respuestas de IA antes de que el parser las lea.
    - Corregir variaciones comunes del formato FITJEFF_RUTINA_V1.
    - Validar y autocorregir rutinas IA ya interpretadas.
    - Permitir ejercicios por repeticiones, por tiempo, mixtos o por distancia.
    - Evitar que la app se rompa cuando la IA entregue datos incompletos.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.parser.js
    - src/features/entrenamiento/rutinas/rutinas.prompt.js
*/

import { FITJEFF_RUTINA_FORMAT_VERSION } from "./rutinas.prompt.js";

const TIPOS_PERMITIDOS = [
  "fuerza",
  "cardio",
  "futbol",
  "movilidad",
  "tecnica",
  "core",
  "calentamiento",
  "descanso_activo",
  "otro"
];

const MEDICIONES_PERMITIDAS = ["repeticiones", "tiempo", "mixto", "distancia"];

const CLAVES_ALIAS = {
  "nombre de rutina": "nombre",
  "nombre rutina": "nombre",
  "objetivo principal": "objetivo",
  "duración sesión": "duracion_sesion",
  "duracion sesion": "duracion_sesion",
  "duración de sesión": "duracion_sesion",
  "duracion de sesion": "duracion_sesion",
  "notas generales": "notas_generales",
  "día": "numero",
  "dia": "numero",
  "actividad": "ejercicio",
  "ejercicios": "ejercicio",
  "nombre ejercicio": "ejercicio",
  "nombre del ejercicio": "ejercicio",
  "bloque": "nombre",
  "descanso segundos": "descanso",
  "descanso_segundos": "descanso",
  "duración": "duracion",
  "duracion minutos": "duracion",
  "duracion_minutos": "duracion",
  "tiempo": "duracion",
  "minutos": "duracion",
  "duración segundos": "duracion_segundos",
  "duracion segundos": "duracion_segundos",
  "duracion_segundos": "duracion_segundos",
  "segundos": "duracion_segundos",
  "distancia": "distancia_km",
  "distancia km": "distancia_km",
  "distancia_km": "distancia_km",
  "km": "distancia_km",
  "tipo medicion": "medicion",
  "tipo_medicion": "medicion",
  "unidad medicion": "medicion",
  "unidad_medicion": "medicion",
  "medición": "medicion",
  "medicion": "medicion",
  "reps": "repeticiones",
  "rep": "repeticiones",
  "repeticion": "repeticiones",
  "repeticiones": "repeticiones"
};

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function quitarAcentos(valor) {
  return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarClave(valor) {
  const limpio = quitarAcentos(valor).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return CLAVES_ALIAS[limpio] || limpio.replace(/\s+/g, "_");
}

function normalizarTipo(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase().replace(/[_-]+/g, " ").trim();

  if (["futbol", "football", "balon", "soccer"].includes(limpio)) return "futbol";
  if (["tecnico", "técnica", "tecnica deportiva", "coordinacion", "agilidad"].includes(limpio)) return "tecnica";
  if (["movilidad articular", "estiramiento", "estiramientos", "flexibilidad"].includes(limpio)) return "movilidad";
  if (["abdomen", "abdominales", "zona media"].includes(limpio)) return "core";
  if (["activacion", "activar", "calentar"].includes(limpio)) return "calentamiento";
  if (["descanso", "recuperacion", "recuperacion activa"].includes(limpio)) return "descanso_activo";

  return TIPOS_PERMITIDOS.includes(limpio.replace(/\s+/g, "_")) ? limpio.replace(/\s+/g, "_") : "otro";
}

function normalizarMedicion(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase().replace(/[_-]+/g, " ").trim();

  if (["tiempo", "duracion", "minutos", "segundos"].includes(limpio)) return "tiempo";
  if (["repeticiones", "reps", "rep", "series reps"].includes(limpio)) return "repeticiones";
  if (["mixto", "series tiempo", "tiempo series"].includes(limpio)) return "mixto";
  if (["distancia", "km", "kilometros"].includes(limpio)) return "distancia";
  return MEDICIONES_PERMITIDAS.includes(limpio.replace(/\s+/g, "_")) ? limpio.replace(/\s+/g, "_") : "";
}

function numero(valor, defecto = 0) {
  const convertido = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(convertido) ? convertido : defecto;
}

function tieneDuracion(ejercicio = {}) {
  return Number(ejercicio.duracionMinutos || 0) > 0 || Number(ejercicio.duracionSegundos || 0) > 0 || Boolean(texto(ejercicio.duracion));
}

function inferirMedicion(ejercicio = {}) {
  const explicita = normalizarMedicion(ejercicio.medicion);
  if (explicita) return explicita;
  if (Number(ejercicio.distanciaKm || 0) > 0) return "distancia";
  if (tieneDuracion(ejercicio)) return Number(ejercicio.series || 0) > 0 && Number(ejercicio.repeticiones || 0) > 0 ? "mixto" : "tiempo";
  if (["cardio", "movilidad", "calentamiento", "descanso_activo"].includes(ejercicio.tipo)) return "tiempo";
  return "repeticiones";
}

function esTipoPermitidoLinea(linea = "") {
  const tipo = normalizarTipo(linea.replace(/[:.-]+$/, ""));
  return tipo !== "otro" || /^otro\s*[:.-]?$/i.test(quitarAcentos(linea));
}

function normalizarMarcador(linea = "") {
  const limpio = quitarAcentos(linea).toUpperCase().replace(/\s+/g, "_").replace(/[\[\]]/g, "");

  if (limpio === "RUTINA") return "[RUTINA]";
  if (limpio === "FIN_RUTINA_DATOS") return "[FIN_RUTINA_DATOS]";
  if (limpio === "DIA") return "[DIA]";
  if (limpio === "FIN_DIA") return "[FIN_DIA]";
  if (limpio === "BLOQUE") return "[BLOQUE]";
  if (limpio === "FIN_BLOQUE") return "[FIN_BLOQUE]";
  if (limpio === "FIN_RUTINA") return "FIN_RUTINA";
  if (limpio === FITJEFF_RUTINA_FORMAT_VERSION) return FITJEFF_RUTINA_FORMAT_VERSION;

  return null;
}

function normalizarClaveValor(linea = "") {
  const separador = linea.includes("=") ? "=" : linea.includes(":") ? ":" : null;
  if (!separador) return linea;

  const indice = linea.indexOf(separador);
  const claveOriginal = texto(linea.slice(0, indice));
  const valor = texto(linea.slice(indice + 1));
  const clave = normalizarClave(claveOriginal);

  if (!clave) return linea;
  return `${clave}=${valor}`;
}

function normalizarLineaEjercicio(linea = "") {
  let limpio = texto(linea).replace(/^[-•]\s*/, "");

  if (/^ejercicio\s*[:=]/i.test(quitarAcentos(limpio)) || /^actividad\s*[:=]/i.test(quitarAcentos(limpio))) {
    return `- ${limpio.split("|").map(normalizarClaveValor).join(" | ")}`;
  }

  if (/ejercicio\s*=/i.test(quitarAcentos(limpio))) {
    return `- ${limpio.split("|").map(normalizarClaveValor).join(" | ")}`;
  }

  const partes = limpio.split("|").map((parte) => parte.trim()).filter(Boolean);
  if (partes.length > 1) {
    const [nombre, ...resto] = partes;
    return [`- ejercicio=${nombre}`, ...resto.map(normalizarClaveValor)].join(" | ");
  }

  return `- ejercicio=${limpio} | tipo=otro | medicion=repeticiones | series= | repeticiones= | descanso= | duracion= | duracion_segundos= | distancia_km= | intensidad=media | notas=`;
}

function normalizarLinea(linea = "") {
  let limpio = texto(linea)
    .replace(/^```[a-zA-Z]*$/g, "")
    .replace(/^```$/g, "")
    .replace(/^\*\*(.*)\*\*$/g, "$1")
    .replace(/^#+\s*/, "")
    .trim();

  if (!limpio) return [];

  const marcador = normalizarMarcador(limpio);
  if (marcador) return [marcador];

  const diaConNombre = limpio.match(/^d[ií]a\s*(\d+)\s*[-:.]?\s*(.*)$/i);
  if (diaConNombre) {
    const numeroDia = diaConNombre[1];
    const nombre = texto(diaConNombre[2]);
    return ["[DIA]", `numero=${numeroDia}`, `nombre=Día ${numeroDia}${nombre ? ` - ${nombre}` : ""}`];
  }

  const bloqueConTipo = limpio.match(/^\[?bloque\]?\s*[-:.]?\s*(.*)$/i);
  if (bloqueConTipo) {
    const nombre = texto(bloqueConTipo[1]);
    const tipo = normalizarTipo(nombre);
    return ["[BLOQUE]", `tipo=${tipo}`, `nombre=${nombre || tipo}`];
  }

  if (esTipoPermitidoLinea(limpio) && !limpio.includes("=") && !limpio.includes("|")) {
    const tipo = normalizarTipo(limpio);
    return ["[BLOQUE]", `tipo=${tipo}`, `nombre=${tipo}`];
  }

  if (/^[-•]\s*/.test(limpio) || /^ejercicio\s*[:=]/i.test(quitarAcentos(limpio)) || /^actividad\s*[:=]/i.test(quitarAcentos(limpio))) {
    return [normalizarLineaEjercicio(limpio)];
  }

  return [normalizarClaveValor(limpio)];
}

export function normalizarTextoRutinaIA(textoFuente = "", advertencias = []) {
  const lineas = texto(textoFuente)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
  const normalizadas = [];
  let cambios = 0;

  lineas.forEach((linea) => {
    const resultado = normalizarLinea(linea);
    if (resultado.length && resultado.join("\n") !== texto(linea)) cambios += 1;
    normalizadas.push(...resultado);
  });

  if (normalizadas.length && normalizadas[0] !== FITJEFF_RUTINA_FORMAT_VERSION) {
    normalizadas.unshift(FITJEFF_RUTINA_FORMAT_VERSION);
    cambios += 1;
  }

  if (normalizadas.length && !normalizadas.includes("FIN_RUTINA")) {
    normalizadas.push("FIN_RUTINA");
    cambios += 1;
  }

  if (cambios > 0) {
    advertencias.push(`Se aplicaron ${cambios} ajuste(s) de formato antes de interpretar la rutina IA.`);
  }

  return normalizadas.join("\n");
}

function obtenerTipoPredeterminado(ejercicio = {}) {
  const medicion = inferirMedicion(ejercicio);

  if (medicion === "tiempo") return { series: 0, repeticiones: 0, descansoSegundos: 0 };
  if (medicion === "mixto") return { series: 3, repeticiones: 0, descansoSegundos: 45 };
  if (medicion === "distancia") return { series: 0, repeticiones: 0, descansoSegundos: 0 };
  return ["cardio", "futbol", "tecnica", "movilidad", "calentamiento", "descanso_activo"].includes(ejercicio.tipo)
    ? { series: 0, repeticiones: 0, descansoSegundos: 0 }
    : { series: 3, repeticiones: 10, descansoSegundos: 60 };
}

export function corregirRutinaInterpretadaIA(rutina = {}, errores = [], advertencias = []) {
  let correcciones = 0;

  if (!texto(rutina.nombre)) {
    rutina.nombre = "Rutina generada por IA";
    advertencias.push("Se agregó un nombre automático a la rutina.");
    correcciones += 1;
  }

  if (!Array.isArray(rutina.dias) || rutina.dias.length === 0) {
    errores.push("No se detectaron días de entrenamiento.");
    return { errores, advertencias, correcciones };
  }

  if (rutina.diasDeclarados && Number(rutina.diasDeclarados) !== rutina.dias.length) {
    advertencias.push(`La rutina declara ${rutina.diasDeclarados} día(s), pero se detectaron ${rutina.dias.length}.`);
  }

  rutina.dias.forEach((dia, indiceDia) => {
    dia.numero = Number(dia.numero || indiceDia + 1);
    dia.orden = indiceDia + 1;

    if (!texto(dia.nombre)) {
      dia.nombre = `Día ${indiceDia + 1}`;
      correcciones += 1;
    }

    if (!Array.isArray(dia.bloques)) dia.bloques = [];
    if (!Array.isArray(dia.ejercicios)) dia.ejercicios = [];

    if (dia.bloques.length === 0) errores.push(`${dia.nombre} no tiene bloques.`);
    if (dia.ejercicios.length === 0) errores.push(`${dia.nombre} no tiene ejercicios.`);

    const nombresUsados = new Set();

    dia.bloques.forEach((bloque, indiceBloque) => {
      bloque.tipo = normalizarTipo(bloque.tipo);
      if (!texto(bloque.nombre)) {
        bloque.nombre = bloque.tipo || `Bloque ${indiceBloque + 1}`;
        correcciones += 1;
      }
      if (!Array.isArray(bloque.ejercicios)) bloque.ejercicios = [];
    });

    dia.ejercicios.forEach((ejercicio) => {
      if (!texto(ejercicio.nombre)) {
        errores.push(`${dia.nombre} tiene un ejercicio sin nombre.`);
        return;
      }

      ejercicio.tipo = normalizarTipo(ejercicio.tipo);
      if (!ejercicio.tipo || ejercicio.tipo === "otro") {
        ejercicio.tipo = "otro";
      }

      const claveDuplicado = quitarAcentos(ejercicio.nombre).toLowerCase();
      if (nombresUsados.has(claveDuplicado)) {
        advertencias.push(`${dia.nombre} tiene repetido el ejercicio: ${ejercicio.nombre}.`);
      }
      nombresUsados.add(claveDuplicado);

      ejercicio.medicion = inferirMedicion(ejercicio);
      const defaults = obtenerTipoPredeterminado(ejercicio);

      if (ejercicio.series === null || ejercicio.series === undefined || ejercicio.series === "") {
        ejercicio.series = defaults.series;
        correcciones += 1;
      }
      if (ejercicio.repeticiones === null || ejercicio.repeticiones === undefined || ejercicio.repeticiones === "") {
        ejercicio.repeticiones = defaults.repeticiones;
        correcciones += 1;
      }
      if (ejercicio.descansoSegundos === null || ejercicio.descansoSegundos === undefined || ejercicio.descansoSegundos === "") {
        ejercicio.descansoSegundos = defaults.descansoSegundos;
        correcciones += 1;
      }

      if (ejercicio.medicion === "tiempo") {
        ejercicio.series = 0;
        ejercicio.repeticiones = 0;
      }

      if (ejercicio.medicion === "mixto" && !Number(ejercicio.repeticiones || 0)) {
        ejercicio.repeticiones = 0;
      }

      if (!texto(ejercicio.intensidad)) {
        ejercicio.intensidad = "media";
        correcciones += 1;
      }

      if (["tiempo", "mixto"].includes(ejercicio.medicion) && !tieneDuracion(ejercicio)) {
        advertencias.push(`${ejercicio.nombre} está marcado por tiempo, pero no tiene duración clara.`);
      }

      if (ejercicio.medicion === "distancia" && !Number(ejercicio.distanciaKm || 0)) {
        advertencias.push(`${ejercicio.nombre} está marcado por distancia, pero no tiene distancia clara.`);
      }
    });
  });

  if (correcciones > 0) {
    advertencias.push(`Se aplicaron ${correcciones} autocorrección(es) de datos para poder usar la rutina.`);
  }

  return { errores, advertencias, correcciones };
}
