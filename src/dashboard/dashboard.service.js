/*
  Nombre completo: dashboard.service.js
  Ruta o ubicación: src/dashboard/dashboard.service.js

  Función:
    - Preparar los datos principales para el tablero minimalista.
    - Unir información de entrenamiento, peso, medidas, rutina y estadísticas.
    - Entregar tarjetas, resumen, series y acciones listas para renderizar.

  Se conecta con:
    - src/estadisticas/estadisticas.service.js
    - src/medidas/medidas.storage.service.js
    - src/dashboard/dashboard.constantes.js
    - src/dashboard/dashboard.format.service.js
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

import { obtenerDiaPorNumero } from "../data/rutina-base.js";
import { generarResumenEstadistico, prepararDatosParaGraficas } from "../estadisticas/estadisticas.service.js";
import { obtenerMedidasSemanales } from "../medidas/medidas.storage.service.js";
import { ordenarPorFechaDesc } from "../ui/helpers.js";
import { DASHBOARD_ACCIONES_RAPIDAS, DASHBOARD_LIMITES } from "./dashboard.constantes.js";
import { formatoKg, formatoMinutos, formatoPorcentaje, limitarTextoDashboard } from "./dashboard.format.service.js";

export function prepararDashboard(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const graficas = prepararDatosParaGraficas(estadisticas);
  const perfil = estado.usuario?.perfil || {};
  const entrenamientos = ordenarPorFechaDesc(estado.entrenamientos || []);
  const medidas = obtenerMedidasSemanales();
  const ultimoEntrenamiento = entrenamientos[0] || null;
  const ultimaMedida = medidas[0] || null;
  const diaSugerido = obtenerDiaSugerido(estado, ultimoEntrenamiento);

  return {
    usuario: estado.usuario?.nombre || "Jeff",
    estadisticas,
    graficas,
    perfil,
    entrenamientos,
    medidas,
    ultimoEntrenamiento,
    ultimaMedida,
    diaSugerido,
    acciones: DASHBOARD_ACCIONES_RAPIDAS,
    tarjetas: crearTarjetasDashboard({ estadisticas, perfil, entrenamientos, medidas, ultimaMedida }),
    enfoque: crearEnfoqueDelDia({ estadisticas, diaSugerido, ultimoEntrenamiento }),
    recientes: entrenamientos.slice(0, DASHBOARD_LIMITES.maxEntrenamientosRecientes),
    series: crearSeriesDashboard({ graficas, medidas })
  };
}

export function crearTarjetasDashboard({ estadisticas, perfil, entrenamientos, medidas, ultimaMedida }) {
  const pesoActual = ultimaMedida?.pesoKg || estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || perfil.pesoInicialKg || null;
  const cumplimiento = estadisticas.cumplimiento?.porcentajeSemana || 0;
  const minutos = estadisticas.entrenamientos?.minutosTotales || 0;
  const sesiones = entrenamientos.length || 0;

  return [
    {
      titulo: "Peso actual",
      valor: formatoKg(pesoActual),
      detalle: medidas.length ? "Último registro semanal" : "Desde perfil o peso registrado",
      estado: "neutral"
    },
    {
      titulo: "Constancia semanal",
      valor: formatoPorcentaje(cumplimiento),
      detalle: `${estadisticas.cumplimiento?.entrenamientosUltimos7Dias || 0} entrenamientos en 7 días`,
      estado: cumplimiento >= DASHBOARD_LIMITES.cumplimientoBueno ? "ok" : "neutral"
    },
    {
      titulo: "Tiempo total",
      valor: formatoMinutos(minutos),
      detalle: `${sesiones} sesiones registradas`,
      estado: "neutral"
    },
    {
      titulo: "Energía promedio",
      valor: estadisticas.energia?.promedioFinal ? `${estadisticas.energia.promedioFinal}/5` : "-",
      detalle: "Según registros de entrenamiento",
      estado: Number(estadisticas.energia?.promedioFinal || 0) <= DASHBOARD_LIMITES.energiaBaja ? "warning" : "neutral"
    }
  ];
}

export function crearEnfoqueDelDia({ estadisticas, diaSugerido, ultimoEntrenamiento }) {
  const fatigaNivel = estadisticas.fatiga?.nivel || "sin datos";

  if (fatigaNivel === "alto") {
    return {
      tipo: "warning",
      titulo: "Enfoque recomendado",
      mensaje: "Hoy conviene priorizar técnica, control y descanso suficiente entre series."
    };
  }

  if (!ultimoEntrenamiento) {
    return {
      tipo: "info",
      titulo: "Primer registro",
      mensaje: `Puedes iniciar con Día ${diaSugerido.numero}: ${diaSugerido.nombre}.`
    };
  }

  return {
    tipo: "ok",
    titulo: "Enfoque recomendado",
    mensaje: `Siguiente sugerido: Día ${diaSugerido.numero}, ${diaSugerido.nombre}.`
  };
}

export function crearSeriesDashboard({ graficas, medidas }) {
  const seriePesoMedidas = medidas
    .slice()
    .reverse()
    .filter((item) => item.pesoKg !== null && item.pesoKg !== undefined)
    .map((item) => ({
      fecha: item.fecha,
      valor: Number(item.pesoKg)
    }));

  return {
    peso: seriePesoMedidas.length ? seriePesoMedidas.slice(-DASHBOARD_LIMITES.maxPuntosGrafica) : (graficas.peso || []).slice(-DASHBOARD_LIMITES.maxPuntosGrafica),
    cumplimiento: (graficas.cumplimientoSemanal || [])
      .slice(-DASHBOARD_LIMITES.maxPuntosGrafica)
      .map((item) => ({
        label: item.semana,
        valor: item.cumplimiento
      })),
    minutos: (graficas.minutosPorDiaRutina || [])
      .slice(0, DASHBOARD_LIMITES.maxPuntosGrafica)
      .map((item) => ({
        label: `Día ${item.diaRutina}`,
        valor: item.minutos
      })),
    energia: medidas
      .slice()
      .reverse()
      .filter((item) => item.energiaSemana !== null && item.energiaSemana !== undefined)
      .map((item) => ({
        fecha: item.fecha,
        valor: Number(item.energiaSemana)
      }))
      .slice(-DASHBOARD_LIMITES.maxPuntosGrafica)
  };
}

export function obtenerDiaSugerido(estado, ultimoEntrenamiento) {
  const diaActual = estado.rutina?.diaActual || calcularDiaSugerido(ultimoEntrenamiento);
  const dia = obtenerDiaPorNumero(diaActual);

  return {
    numero: dia.numero,
    nombre: dia.nombre,
    objetivo: dia.objetivo,
    duracionEstimadaMin: dia.duracionEstimadaMin,
    resumen: limitarTextoDashboard(dia.objetivo, 120)
  };
}

function calcularDiaSugerido(ultimoEntrenamiento) {
  if (!ultimoEntrenamiento?.diaRutina) {
    return 1;
  }

  return Number(ultimoEntrenamiento.diaRutina) >= 4
    ? 1
    : Number(ultimoEntrenamiento.diaRutina) + 1;
}
