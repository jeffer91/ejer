/*
  Nombre completo: jarvis.contexto.service.js
  Ruta o ubicación: src/jarvis/jarvis.contexto.service.js

  Función:
    - Construir un contexto compacto para Jarvis inteligente.
    - Incluir rutina, sesiones recientes, indicadores semanales y estadísticas.
    - Evitar enviar datos innecesarios a Gemini.

  Se conecta con:
    - src/jarvis/jarvis.prompt.service.js
    - src/jarvis/jarvis.inteligente.service.js
    - src/estadisticas/estadisticas.service.js
    - src/medidas/medidas.storage.service.js
*/

import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";
import { obtenerMedidasSemanales } from "../medidas/medidas.storage.service.js";
import { ordenarPorFechaDesc } from "../ui/helpers.js";

export function crearContextoJarvisInteligente(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const sesiones = ordenarPorFechaDesc(estado.entrenamientos || []);
  const indicadores = obtenerMedidasSemanales();
  const rutina = estado.rutina || {};
  const dia = obtenerDiaActual(rutina);

  return {
    usuario: {
      nombre: estado.usuario?.nombre || "Jeff",
      objetivo: estado.usuario?.perfil?.objetivo || "mejorar constancia"
    },
    rutina: {
      nombre: rutina.nombre || "Rutina FitJeff",
      diaActual: rutina.diaActual || 1,
      diaSugerido: dia
        ? {
            numero: dia.numero,
            nombre: dia.nombre,
            objetivo: dia.objetivo,
            ejercicios: Array.isArray(dia.ejercicios)
              ? dia.ejercicios.slice(0, 8).map((ejercicio) => ({
                  nombre: ejercicio.nombre,
                  tipoRegistro: ejercicio.tipoRegistro,
                  seriesObjetivo: ejercicio.seriesObjetivo,
                  unidad: ejercicio.unidad,
                  descansoSeg: ejercicio.descansoSeg
                }))
              : []
          }
        : null
    },
    sesiones: {
      total: sesiones.length,
      recientes: sesiones.slice(0, 6).map((item) => ({
        fecha: item.fecha,
        diaRutina: item.diaRutina,
        nombreDia: item.nombreDia,
        estado: item.estado,
        duracionMin: item.duracionMin,
        energiaInicial: item.energiaInicial,
        energiaFinal: item.energiaFinal,
        esfuerzoGeneral: item.esfuerzoGeneral,
        observacion: item.observacion
      }))
    },
    indicadores: {
      total: indicadores.length,
      recientes: indicadores.slice(0, 4).map((item) => ({
        fecha: item.fecha,
        energiaSemana: item.energiaSemana,
        cumplimientoSemana: item.cumplimientoSemana,
        observacion: item.observacion
      }))
    },
    estadisticas: {
      cumplimiento: estadisticas.cumplimiento || {},
      energia: estadisticas.energia || {},
      fatiga: estadisticas.fatiga || {},
      rendimiento: Array.isArray(estadisticas.rendimiento) ? estadisticas.rendimiento.slice(0, 6) : []
    },
    actualizadoEn: new Date().toISOString()
  };
}

export function crearContextoMinimoJarvis(estado = {}) {
  const contexto = crearContextoJarvisInteligente(estado);

  return {
    usuario: contexto.usuario,
    rutina: contexto.rutina,
    sesiones: {
      total: contexto.sesiones.total,
      recientes: contexto.sesiones.recientes.slice(0, 3)
    },
    indicadores: contexto.indicadores,
    estadisticas: contexto.estadisticas
  };
}

function obtenerDiaActual(rutina) {
  const dias = Array.isArray(rutina?.dias) ? rutina.dias : [];
  const numero = Number(rutina?.diaActual || 1);
  return dias.find((dia) => Number(dia.numero) === numero) || dias[0] || null;
}
