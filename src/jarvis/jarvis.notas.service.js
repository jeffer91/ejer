/*
  Nombre completo: jarvis.notas.service.js
  Ruta o ubicación: src/jarvis/jarvis.notas.service.js

  Función:
    - Guardar notas rápidas creadas durante una sesión con Jarvis.
    - Preparar observaciones para el resumen final.
    - Funcionar localmente sin internet.

  Se conecta con:
    - src/jarvis/jarvis.estado.js
    - src/vistas/jarvis.view.js
*/

import { agregarNotaEstadoJarvis, obtenerEstadoJarvis } from "./jarvis.estado.js";

const STORAGE_KEY_NOTAS_JARVIS = "fitjeff_jarvis_notas";

export function crearNotaJarvis(texto, contexto = {}) {
  const contenido = String(texto || "").trim();

  if (!contenido) {
    return {
      ok: false,
      mensaje: "La nota está vacía.",
      nota: null
    };
  }

  const estado = obtenerEstadoJarvis();
  const nota = {
    id: `nota_jarvis_${Date.now()}`,
    texto: contenido,
    diaRutina: contexto.diaRutina ?? estado.diaRutina ?? null,
    nombreDia: contexto.nombreDia ?? estado.nombreDia ?? "",
    fase: contexto.fase ?? estado.fase ?? "",
    ejercicio: contexto.ejercicio ?? estado.ejercicioActual?.nombre ?? "",
    creadoEn: new Date().toISOString(),
    origen: "jarvis"
  };

  agregarNotaEstadoJarvis(nota.texto, nota);
  guardarNotaJarvisLocal(nota);

  return {
    ok: true,
    mensaje: "Nota guardada.",
    nota
  };
}

export function guardarNotaJarvisLocal(nota) {
  const notas = obtenerNotasJarvisLocal();
  const nuevasNotas = [nota, ...notas].slice(0, 120);
  localStorage.setItem(STORAGE_KEY_NOTAS_JARVIS, JSON.stringify(nuevasNotas));
  return nuevasNotas;
}

export function obtenerNotasJarvisLocal() {
  try {
    const notas = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTAS_JARVIS) || "[]");
    return Array.isArray(notas) ? notas : [];
  } catch (_) {
    return [];
  }
}

export function borrarNotasJarvisLocales() {
  localStorage.removeItem(STORAGE_KEY_NOTAS_JARVIS);
  return [];
}

export function crearResumenNotasJarvis(limite = 5) {
  const notas = obtenerNotasJarvisLocal().slice(0, limite);

  if (!notas.length) {
    return "Sin notas recientes de Jarvis.";
  }

  return notas
    .map((nota, index) => `${index + 1}. ${nota.texto}`)
    .join("\n");
}

export function extraerNotaDesdeComando(texto = "") {
  const limpio = String(texto || "").trim();

  if (!limpio) {
    return "";
  }

  return limpio
    .replace(/^jarvis\s*/i, "")
    .replace(/^nota\s*/i, "")
    .replace(/^observaci[oó]n\s*/i, "")
    .replace(/^guardar nota\s*/i, "")
    .replace(/^anotar\s*/i, "")
    .trim();
}
