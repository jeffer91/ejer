/*
  Nombre completo: recomendaciones.service.js
  Ruta o ubicación: src/recomendaciones/recomendaciones.service.js

  Función:
    - Generar recomendaciones locales de entrenamiento, peso, fatiga y constancia.
    - Preparar el resumen que después se enviará a Gemini mediante Firebase Functions.
    - Guardar y leer recomendaciones en Firebase Firestore.
    - Mantener recomendaciones seguras: no entrenar con dolor, no dietas extremas y progreso gradual.

  Se conecta con:
    - src/recomendaciones/recomendaciones.prompt.js
    - src/estadisticas/estadisticas.service.js
    - src/firebase/firestore.service.js
    - functions/index.js cuando se cree la función real de Gemini.
    - src/app.js cuando se conecte el flujo final.
*/

import {
  construirPromptRecomendaciones,
  construirResumenParaIA,
  crearPromptSinDatos
} from "./recomendaciones.prompt.js";

import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";

import {
  guardarRecomendacionFirestore,
  listarRecomendacionesFirestore
} from "../firebase/firestore.service.js";

export const TIPOS_RECOMENDACION = {
  LOCAL: "local",
  GEMINI: "gemini",
  SISTEMA: "sistema"
};

export function generarRecomendacionesLocales(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const recomendaciones = [];

  agregarRecomendacionCumplimiento(recomendaciones, estadisticas);
  agregarRecomendacionPeso(recomendaciones, estadisticas);
  agregarRecomendacionFatiga(recomendaciones, estadisticas);
  agregarRecomendacionRendimiento(recomendaciones, estadisticas);
  agregarRecomendacionEntrenamiento(recomendaciones, estado, estadisticas);
  agregarRecomendacionComidaGeneral(recomendaciones, estadisticas);

  if (recomendaciones.length === 0) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "general",
      titulo: "Sigue registrando",
      mensaje:
        "Todavía no hay suficientes alertas o tendencias claras. Registra entrenamientos, peso, energía y observaciones para mejorar el análisis.",
      accion: "Completa el próximo entrenamiento y registra tus series reales."
    });
  }

  return recomendaciones;
}

export function crearRegistroRecomendacionLocal(estado = {}, observacionUsuario = "") {
  const estadisticas = generarResumenEstadistico(estado);
  const recomendaciones = generarRecomendacionesLocales(estado);
  const resumenIA = construirResumenParaIA({
    perfil: estado.usuario?.perfil || {},
    estadisticas,
    entrenamientos: estado.entrenamientos || [],
    pesos: estado.pesos || [],
    observacionUsuario
  });

  return {
    id: crearId("recomendacion"),
    fecha: obtenerFechaISO(),
    origen: TIPOS_RECOMENDACION.LOCAL,
    estado: "generada",
    observacionUsuario: limpiarTexto(observacionUsuario),
    resumenIA,
    recomendaciones,
    promptPreparado: construirPromptRecomendaciones({
      perfil: estado.usuario?.perfil || {},
      estadisticas,
      entrenamientos: estado.entrenamientos || [],
      pesos: estado.pesos || [],
      observacionUsuario
    }),
    creadoEn: new Date().toISOString(),
    sincronizado: false
  };
}

export function prepararSolicitudGemini(estado = {}, observacionUsuario = "") {
  const tieneDatos =
    Array.isArray(estado.entrenamientos) && estado.entrenamientos.length > 0;

  if (!tieneDatos) {
    return {
      ok: true,
      modo: "sin-datos",
      prompt: crearPromptSinDatos(),
      datos: null
    };
  }

  const estadisticas = generarResumenEstadistico(estado);
  const prompt = construirPromptRecomendaciones({
    perfil: estado.usuario?.perfil || {},
    estadisticas,
    entrenamientos: estado.entrenamientos || [],
    pesos: estado.pesos || [],
    observacionUsuario
  });

  return {
    ok: true,
    modo: "con-datos",
    prompt,
    datos: construirResumenParaIA({
      perfil: estado.usuario?.perfil || {},
      estadisticas,
      entrenamientos: estado.entrenamientos || [],
      pesos: estado.pesos || [],
      observacionUsuario
    })
  };
}

export async function solicitarRecomendacionGemini(estado = {}, observacionUsuario = "") {
  const solicitud = prepararSolicitudGemini(estado, observacionUsuario);

  return {
    ok: false,
    pendiente: true,
    mensaje:
      "La conexión real con Gemini se activará cuando creemos Firebase Functions. Por ahora se genera el prompt seguro y el resumen de datos.",
    solicitud
  };
}

export async function guardarRecomendacionEnFirebase(recomendacion) {
  if (!recomendacion || typeof recomendacion !== "object") {
    return {
      ok: false,
      errores: ["La recomendación está vacía."]
    };
  }

  const respuesta = await guardarRecomendacionFirestore(recomendacion);

  return {
    ok: true,
    firebase: respuesta,
    recomendacion: {
      ...recomendacion,
      sincronizado: true,
      idFirestore: respuesta.id,
      rutaFirestore: respuesta.ruta
    }
  };
}

export async function cargarRecomendacionesDesdeFirebase(cantidad = 30) {
  const recomendaciones = await listarRecomendacionesFirestore(cantidad);

  return recomendaciones.map((item) => ({
    ...item,
    id: item.id || item.idFirestore,
    sincronizado: true
  }));
}

export function obtenerUltimaRecomendacion(recomendaciones = []) {
  if (!Array.isArray(recomendaciones) || recomendaciones.length === 0) {
    return null;
  }

  return [...recomendaciones].sort((a, b) => {
    const fechaA = new Date(a.creadoEn || a.fecha || 0).getTime();
    const fechaB = new Date(b.creadoEn || b.fecha || 0).getTime();
    return fechaB - fechaA;
  })[0];
}

function agregarRecomendacionCumplimiento(recomendaciones, estadisticas) {
  const porcentaje = Number(estadisticas.cumplimiento?.porcentajeSemana || 0);

  if (porcentaje >= 100) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "cumplimiento",
      titulo: "Buena constancia semanal",
      mensaje:
        "Completaste el objetivo base de la semana. Mantén la técnica antes de subir dificultad.",
      accion: "Repite el ciclo y registra energía final para controlar fatiga."
    });
    return;
  }

  if (porcentaje > 0 && porcentaje < 50) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "alta",
      categoria: "cumplimiento",
      titulo: "Prioriza constancia",
      mensaje:
        "Esta semana el cumplimiento todavía está bajo. Conviene terminar el ciclo antes de aumentar intensidad.",
      accion: "Haz el siguiente día de rutina con intensidad controlada."
    });
  }
}

function agregarRecomendacionPeso(recomendaciones, estadisticas) {
  const peso = estadisticas.peso || {};

  if ((peso.registrosTotales || 0) < 2) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "peso",
      titulo: "Faltan registros de peso",
      mensaje:
        "Con un solo peso no se puede ver tendencia real. Registra 2 o 3 pesos por semana, idealmente en condiciones similares.",
      accion: "Registra tu próximo peso en la mañana y evita comparar datos aislados."
    });
    return;
  }

  if (peso.tendencia === "subiendo") {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "peso",
      titulo: "Peso con tendencia ascendente",
      mensaje:
        "El peso va subiendo en los registros. Revisa porciones, bebidas calóricas, horarios y constancia del cardio.",
      accion: "Mantén la rutina y mejora una comida al día durante la próxima semana."
    });
  }
}

function agregarRecomendacionFatiga(recomendaciones, estadisticas) {
  const fatiga = estadisticas.fatiga || {};

  if (fatiga.nivel === "alto") {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "alta",
      categoria: "fatiga",
      titulo: "Baja intensidad temporalmente",
      mensaje:
        "Hay señales altas de fatiga o dolor. No conviene entrenar fuerte encima de molestias.",
      accion: "Haz descanso activo o reduce el próximo entrenamiento a intensidad media."
    });
  }

  if (fatiga.nivel === "medio") {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "fatiga",
      titulo: "Controla recuperación",
      mensaje:
        "Hay algunas señales de fatiga. Mantén técnica y evita convertir todas las series en fallo máximo.",
      accion: "En el próximo día de fuerza, deja 1 o 2 repeticiones en reserva en las dos primeras series."
    });
  }
}

function agregarRecomendacionRendimiento(recomendaciones, estadisticas) {
  const rendimiento = estadisticas.rendimiento || [];
  const enBaja = rendimiento.filter((item) => item.tendencia === "baja");
  const mejora = rendimiento.filter((item) => item.tendencia === "mejora");

  if (enBaja.length > 0) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "rendimiento",
      titulo: "Revisa ejercicios con bajada",
      mensaje: `Hay ejercicios con rendimiento menor: ${enBaja
        .slice(0, 3)
        .map((item) => item.nombre)
        .join(", ")}. Puede ser fatiga, descanso corto o intensidad muy alta.`,
      accion: "No subas dificultad hasta que el rendimiento se estabilice."
    });
  }

  if (mejora.length > 0) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "baja",
      categoria: "rendimiento",
      titulo: "Hay progreso medible",
      mensaje: `Mejoraste en: ${mejora
        .slice(0, 3)
        .map((item) => item.nombre)
        .join(", ")}.`,
      accion: "Mantén el mismo plan una semana más antes de modificarlo."
    });
  }
}

function agregarRecomendacionEntrenamiento(recomendaciones, estado, estadisticas) {
  const ultimo = estado.entrenamientos?.[0];

  if (!ultimo) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "media",
      categoria: "entrenamiento",
      titulo: "Registra el primer entrenamiento",
      mensaje:
        "Empieza con el Día 1 y registra repeticiones reales, fallo técnico, energía y observaciones.",
      accion: "Haz el entrenamiento con técnica limpia y guarda cada serie."
    });
    return;
  }

  if (ultimo.dolor) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "alta",
      categoria: "seguridad",
      titulo: "No ignores dolor",
      mensaje:
        "El último entrenamiento tiene dolor registrado. Hay que cuidar la zona antes de repetir intensidad alta.",
      accion: "Reduce intensidad y evita el movimiento que provocó la molestia."
    });
  }

  if ((estadisticas.entrenamientos?.fallosTecnicos || 0) > 0) {
    recomendaciones.push({
      id: crearId("rec"),
      prioridad: "baja",
      categoria: "fallo-tecnico",
      titulo: "Usa el fallo con control",
      mensaje:
        "Entrenar al fallo puede servir, pero el dato importante es que sea fallo técnico: cuando la postura se rompe, la serie termina.",
      accion: "Marca fallo técnico solo cuando de verdad mantuviste buena forma hasta el final."
    });
  }
}

function agregarRecomendacionComidaGeneral(recomendaciones) {
  recomendaciones.push({
    id: crearId("rec"),
    prioridad: "baja",
    categoria: "comida",
    titulo: "Ajuste simple de comida",
    mensaje:
      "Para apoyar el progreso, prioriza proteína en cada comida, agua, verduras o frutas y menos ultraprocesados. No hace falta una dieta extrema.",
    accion: "Elige una comida diaria para mejorarla esta semana."
  });
}

function obtenerFechaISO() {
  return new Date().toISOString().slice(0, 10);
}

function crearId(prefijo) {
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}
