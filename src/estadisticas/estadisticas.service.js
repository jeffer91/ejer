/*
  Nombre completo: estadisticas.service.js
  Ruta o ubicación: src/estadisticas/estadisticas.service.js

  Función:
    - Coordinar el cálculo, guardado y lectura de estadísticas de FitJeff.
    - Crear un resumen útil para tablero gráfico y recomendaciones.
    - Guardar el resumen calculado en Firebase Firestore.

  Se conecta con:
    - src/estadisticas/estadisticas.calculos.js
    - src/firebase/firestore.service.js
    - src/recomendaciones/recomendaciones.prompt.js
    - src/app.js cuando se conecte el tablero final.
*/

import { calcularEstadisticasGenerales } from "./estadisticas.calculos.js";
import {
  guardarResumenEstadisticasFirestore,
  leerResumenEstadisticasFirestore
} from "../firebase/firestore.service.js";

export function generarResumenEstadistico(estado = {}) {
  const perfil = estado.usuario?.perfil || estado.perfil || {};
  const entrenamientos = estado.entrenamientos || [];
  const pesos = estado.pesos || [];

  const estadisticas = calcularEstadisticasGenerales({
    perfil,
    entrenamientos,
    pesos
  });

  return {
    ...estadisticas,
    tarjetas: crearTarjetasResumen(estadisticas),
    recomendacionesRapidas: crearRecomendacionesRapidas(estadisticas)
  };
}

export function crearTarjetasResumen(estadisticas) {
  return [
    {
      id: "peso-actual",
      titulo: "Peso actual",
      valor: `${estadisticas.peso.pesoActualKg} kg`,
      detalle: `Cambio: ${estadisticas.peso.cambioKg} kg`
    },
    {
      id: "cumplimiento-semana",
      titulo: "Cumplimiento semanal",
      valor: `${estadisticas.cumplimiento.porcentajeSemana}%`,
      detalle: `${estadisticas.cumplimiento.entrenamientosUltimos7Dias} entrenamientos en 7 días`
    },
    {
      id: "minutos-totales",
      titulo: "Minutos entrenados",
      valor: `${estadisticas.entrenamientos.minutosTotales}`,
      detalle: "Total acumulado"
    },
    {
      id: "fatiga",
      titulo: "Fatiga",
      valor: estadisticas.fatiga.nivel,
      detalle: estadisticas.fatiga.mensaje
    },
    {
      id: "fallos-tecnicos",
      titulo: "Fallos técnicos",
      valor: `${estadisticas.entrenamientos.fallosTecnicos}`,
      detalle: "Series registradas con fallo técnico"
    },
    {
      id: "ciclos",
      titulo: "Ciclos completos",
      valor: `${estadisticas.cumplimiento.cicloEstimado}`,
      detalle: "Cada ciclo equivale a 4 entrenamientos completados"
    }
  ];
}

export function crearRecomendacionesRapidas(estadisticas) {
  const recomendaciones = [];

  if (estadisticas.cumplimiento.porcentajeSemana >= 100) {
    recomendaciones.push({
      tipo: "cumplimiento",
      mensaje: "Cumpliste el objetivo semanal base. Mantén técnica y recuperación."
    });
  } else if (estadisticas.cumplimiento.porcentajeSemana < 50) {
    recomendaciones.push({
      tipo: "cumplimiento",
      mensaje: "Prioriza completar entrenamientos antes de aumentar intensidad."
    });
  }

  if (estadisticas.fatiga.nivel === "alto") {
    recomendaciones.push({
      tipo: "fatiga",
      mensaje: "Baja intensidad o toma descanso activo. Hay señales altas de fatiga."
    });
  }

  if (estadisticas.peso.registrosTotales < 2) {
    recomendaciones.push({
      tipo: "peso",
      mensaje: "Registra al menos dos pesos para mirar tendencia real."
    });
  }

  const ejerciciosEnBaja = estadisticas.rendimiento.filter(
    (ejercicio) => ejercicio.tendencia === "baja"
  );

  if (ejerciciosEnBaja.length > 0) {
    recomendaciones.push({
      tipo: "rendimiento",
      mensaje: `Revisa carga o descanso en: ${ejerciciosEnBaja
        .slice(0, 3)
        .map((item) => item.nombre)
        .join(", ")}.`
    });
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push({
      tipo: "general",
      mensaje: "Sigue registrando datos. No hay alertas importantes por ahora."
    });
  }

  return recomendaciones;
}

export function prepararDatosParaGraficas(estadisticas) {
  return {
    peso: estadisticas.graficas?.pesoPorFecha || [],
    entrenamientos: estadisticas.graficas?.entrenamientosPorFecha || [],
    minutosPorDiaRutina: estadisticas.graficas?.minutosPorDiaRutina || [],
    cumplimientoSemanal: estadisticas.graficas?.cumplimientoSemanal || [],
    rendimiento: estadisticas.rendimiento || []
  };
}

export async function guardarEstadisticasEnFirebase(estado) {
  const resumen = generarResumenEstadistico(estado);
  const respuesta = await guardarResumenEstadisticasFirestore(resumen);

  return {
    ok: true,
    resumen,
    firebase: respuesta
  };
}

export async function cargarEstadisticasDesdeFirebase() {
  const resumen = await leerResumenEstadisticasFirestore();

  if (!resumen) {
    return null;
  }

  return resumen;
}

export function crearEstadoEstadisticasVacio() {
  return {
    generadoEn: new Date().toISOString(),
    perfil: {},
    peso: {
      pesoInicialKg: 91,
      pesoActualKg: 91,
      cambioKg: 0,
      tendencia: "sin datos suficientes"
    },
    entrenamientos: {
      total: 0,
      completados: 0,
      minutosTotales: 0,
      seriesTotales: 0,
      fallosTecnicos: 0
    },
    cumplimiento: {
      entrenamientosUltimos7Dias: 0,
      porcentajeSemana: 0,
      mensaje: "Todavía no hay entrenamientos registrados."
    },
    fatiga: {
      nivel: "bajo",
      mensaje: "Sin datos suficientes."
    },
    rendimiento: [],
    graficas: {
      pesoPorFecha: [],
      entrenamientosPorFecha: [],
      minutosPorDiaRutina: [],
      cumplimientoSemanal: []
    }
  };
}
