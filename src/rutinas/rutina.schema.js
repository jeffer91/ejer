/*
  Nombre completo: rutina.schema.js
  Ruta o ubicación: src/rutinas/rutina.schema.js

  Función:
    - Definir estructura base para importar rutinas en FitJeff.
    - Normalizar campos recibidos desde texto.
    - Evitar datos incompletos antes de aplicar cambios.

  Se conecta con:
    - src/rutinas/rutina.formato-fitjeff.js
    - src/rutinas/rutina.parser.js
    - src/rutinas/rutina.validator.js
    - src/rutinas/rutina.import.service.js
*/

export const RUTINA_ACCIONES = Object.freeze({
  REEMPLAZAR_DIA: "reemplazar_dia",
  CREAR_DIA: "crear_dia",
  CREAR_RUTINA: "crear_rutina"
});

export const RUTINA_TIPOS = Object.freeze({
  REPETICIONES: "repeticiones",
  TIEMPO: "tiempo",
  CARDIO: "cardio",
  HIIT: "hiit"
});

export const RUTINA_UNIDADES = Object.freeze({
  REPETICIONES: "repeticiones",
  SEGUNDOS: "segundos",
  MINUTOS: "minutos",
  RONDAS: "rondas"
});

export const RUTINA_CONFIG = Object.freeze({
  maxDias: 12,
  maxEjercicios: 20,
  maxPreparacion: 12,
  descansoBaseSeg: 90,
  duracionBaseMin: 40
});

export function crearRutinaImportBase() {
  return {
    accion: RUTINA_ACCIONES.REEMPLAZAR_DIA,
    diaAReemplazar: 1,
    numeroDia: 1,
    nombreDia: "Rutina",
    duracionEstimadaMin: RUTINA_CONFIG.duracionBaseMin,
    objetivo: "Completar la sesión con control.",
    preparacion: [],
    ejercicios: [],
    observaciones: [],
    textoOriginal: "",
    creadoEn: new Date().toISOString()
  };
}

export function crearPreparacionBase(datos = {}) {
  return {
    id: datos.id || `prep_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    nombre: limpiarTexto(datos.nombre || datos.actividad || "Preparación"),
    descripcion: limpiarTexto(datos.descripcion || datos.instrucciones || ""),
    duracionSeg: normalizarSegundos(datos.duracionSeg || datos.duracion || datos.segundos, 45)
  };
}

export function crearEjercicioBase(datos = {}) {
  const tipoRegistro = normalizarTipo(datos.tipo || datos.tipoRegistro);
  const unidad = normalizarUnidad(datos.unidad, tipoRegistro);

  return {
    id: datos.id || `ej_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    nombre: limpiarTexto(datos.nombre || datos.ejercicio || "Ejercicio"),
    tipoRegistro,
    unidad,
    seriesObjetivo: normalizarEntero(datos.series || datos.seriesObjetivo || datos.rondasObjetivo, 3),
    descansoSeg: normalizarSegundos(datos.descansoSeg || datos.descanso || datos.descansoSegundos, RUTINA_CONFIG.descansoBaseSeg),
    instrucciones: limpiarTexto(datos.instrucciones || datos.descripcion || "Realizar con control."),
    valorObjetivo: normalizarEntero(datos.valorObjetivo || datos.repeticiones || datos.segundos || datos.minutos, 0)
  };
}

export function normalizarAccion(valor) {
  const limpio = clave(valor);

  if (limpio.includes("crear") && limpio.includes("rutina")) {
    return RUTINA_ACCIONES.CREAR_RUTINA;
  }

  if (limpio.includes("crear") && limpio.includes("dia")) {
    return RUTINA_ACCIONES.CREAR_DIA;
  }

  return RUTINA_ACCIONES.REEMPLAZAR_DIA;
}

export function normalizarTipo(valor) {
  const limpio = clave(valor);

  if (limpio.includes("tiempo") || limpio.includes("seg")) {
    return RUTINA_TIPOS.TIEMPO;
  }

  if (limpio.includes("cardio") || limpio.includes("min")) {
    return RUTINA_TIPOS.CARDIO;
  }

  if (limpio.includes("hiit") || limpio.includes("ronda")) {
    return RUTINA_TIPOS.HIIT;
  }

  return RUTINA_TIPOS.REPETICIONES;
}

export function normalizarUnidad(valor, tipo = RUTINA_TIPOS.REPETICIONES) {
  const limpio = clave(valor);

  if (limpio.includes("seg")) return RUTINA_UNIDADES.SEGUNDOS;
  if (limpio.includes("min")) return RUTINA_UNIDADES.MINUTOS;
  if (limpio.includes("ronda")) return RUTINA_UNIDADES.RONDAS;
  if (limpio.includes("rep")) return RUTINA_UNIDADES.REPETICIONES;

  if (tipo === RUTINA_TIPOS.TIEMPO) return RUTINA_UNIDADES.SEGUNDOS;
  if (tipo === RUTINA_TIPOS.CARDIO) return RUTINA_UNIDADES.MINUTOS;
  if (tipo === RUTINA_TIPOS.HIIT) return RUTINA_UNIDADES.RONDAS;

  return RUTINA_UNIDADES.REPETICIONES;
}

export function normalizarEntero(valor, defecto = 0) {
  const numero = Number(String(valor ?? "").replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numero)) return defecto;

  return Math.max(0, Math.round(numero));
}

export function normalizarSegundos(valor, defecto = 60) {
  const texto = String(valor ?? "").toLowerCase();
  const numero = normalizarEntero(texto, defecto);

  if (texto.includes("min")) return numero * 60;

  return numero || defecto;
}

export function limpiarTexto(valor) {
  return String(valor || "")
    .replaceAll("|", "/")
    .replace(/\s+/g, " ")
    .trim();
}

export function clave(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
