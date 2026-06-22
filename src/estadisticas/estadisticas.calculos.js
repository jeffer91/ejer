/*
  Nombre completo: estadisticas.calculos.js
  Ruta o ubicación: src/estadisticas/estadisticas.calculos.js

  Función:
    - Calcular estadísticas de rendimiento, peso, cumplimiento, volumen y fatiga.
    - Convertir registros de entrenamiento y peso en datos listos para gráficas.
    - Mantener los cálculos separados de la interfaz y de Firebase.

  Se conecta con:
    - src/peso/peso.service.js
    - src/entrenamiento/entrenamiento.service.js
    - src/estadisticas/estadisticas.service.js
    - src/recomendaciones/recomendaciones.prompt.js
    - src/app.js cuando se conecte el tablero gráfico.
*/

import { crearResumenPeso } from "../peso/peso.service.js";
import {
  calcularResumenEntrenamiento,
  obtenerEntrenamientosUltimosDias
} from "../entrenamiento/entrenamiento.service.js";

export function calcularEstadisticasGenerales({
  perfil = {},
  entrenamientos = [],
  pesos = []
}) {
  const pesoInicialKg = Number(perfil.pesoInicialKg || 91);
  const resumenPeso = crearResumenPeso({ pesos, pesoInicialKg });
  const resumenEntrenamientos = calcularResumenEntrenamientos(entrenamientos);
  const cumplimiento = calcularCumplimiento(entrenamientos);
  const fatiga = calcularIndicadoresFatiga(entrenamientos);
  const rendimiento = calcularRendimientoPorEjercicio(entrenamientos);

  return {
    generadoEn: new Date().toISOString(),
    perfil: {
      edad: perfil.edad || 35,
      alturaCm: perfil.alturaCm || 174,
      pesoInicialKg
    },
    peso: resumenPeso,
    entrenamientos: resumenEntrenamientos,
    cumplimiento,
    fatiga,
    rendimiento,
    graficas: crearDatosGraficas({ entrenamientos, pesos })
  };
}

export function calcularResumenEntrenamientos(entrenamientos = []) {
  const resumenes = entrenamientos.map(calcularResumenEntrenamiento);
  const completados = resumenes.filter((item) => item.estado === "completado");
  const parciales = resumenes.filter((item) => item.estado === "parcial");
  const conDolor = resumenes.filter((item) => item.dolor);

  return {
    total: resumenes.length,
    completados: completados.length,
    parciales: parciales.length,
    conDolor: conDolor.length,
    minutosTotales: sumar(resumenes, "duracionMin"),
    seriesTotales: sumar(resumenes, "seriesTotales"),
    fallosTecnicos: sumar(resumenes, "fallosTecnicos"),
    cardioMinutos: sumar(resumenes, "cardioMinutos"),
    hiitRondas: sumar(resumenes, "hiitRondas"),
    promedioDuracionMin: promedio(resumenes, "duracionMin")
  };
}

export function calcularCumplimiento(entrenamientos = []) {
  const ultimos7 = obtenerEntrenamientosUltimosDias(entrenamientos, 7);
  const ultimos30 = obtenerEntrenamientosUltimosDias(entrenamientos, 30);

  return {
    entrenamientosUltimos7Dias: ultimos7.length,
    entrenamientosUltimos30Dias: ultimos30.length,
    porcentajeSemana: Math.min(100, Math.round((ultimos7.length / 4) * 100)),
    porcentajeMes: Math.min(100, Math.round((ultimos30.length / 16) * 100)),
    cicloEstimado: calcularCiclosCompletos(entrenamientos),
    mensaje: crearMensajeCumplimiento(ultimos7.length)
  };
}

export function calcularIndicadoresFatiga(entrenamientos = []) {
  const ultimos = entrenamientos.slice(0, 6);
  const energiaBaja = ultimos.filter((item) => item.energiaFinal === "baja").length;
  const dolor = ultimos.filter((item) => item.dolor).length;
  const incompletos = ultimos.filter((item) => item.estado !== "completado").length;

  let nivel = "bajo";

  if (energiaBaja >= 2 || dolor >= 1 || incompletos >= 2) {
    nivel = "medio";
  }

  if (dolor >= 2 || energiaBaja >= 4) {
    nivel = "alto";
  }

  return {
    nivel,
    energiaBajaUltimos6: energiaBaja,
    dolorUltimos6: dolor,
    incompletosUltimos6: incompletos,
    mensaje: crearMensajeFatiga(nivel)
  };
}

export function calcularRendimientoPorEjercicio(entrenamientos = []) {
  const mapa = new Map();

  for (const entrenamiento of entrenamientos) {
    for (const ejercicio of entrenamiento.ejercicios || []) {
      if (!mapa.has(ejercicio.id)) {
        mapa.set(ejercicio.id, {
          id: ejercicio.id,
          nombre: ejercicio.nombre,
          tipoRegistro: ejercicio.tipoRegistro,
          registros: []
        });
      }

      mapa.get(ejercicio.id).registros.push({
        fecha: entrenamiento.fecha,
        valor: calcularValorEjercicio(ejercicio),
        unidad: ejercicio.unidad || obtenerUnidadEjercicio(ejercicio),
        diaRutina: entrenamiento.diaRutina
      });
    }
  }

  return Array.from(mapa.values()).map((item) => {
    const ordenados = [...item.registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const primero = ordenados[0]?.valor || 0;
    const ultimo = ordenados[ordenados.length - 1]?.valor || 0;
    const cambio = redondear(ultimo - primero, 1);

    return {
      ...item,
      registros: ordenados,
      primero,
      ultimo,
      cambio,
      tendencia: cambio > 0 ? "mejora" : cambio < 0 ? "baja" : "estable"
    };
  });
}

export function crearDatosGraficas({ entrenamientos = [], pesos = [] }) {
  return {
    pesoPorFecha: pesos
      .map((peso) => ({
        fecha: peso.fecha,
        valor: Number(peso.pesoKg)
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),

    entrenamientosPorFecha: entrenamientos
      .map((entrenamiento) => ({
        fecha: entrenamiento.fecha,
        diaRutina: entrenamiento.diaRutina,
        duracionMin: Number(entrenamiento.duracionMin || 0),
        estado: entrenamiento.estado
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),

    minutosPorDiaRutina: [1, 2, 3, 4].map((dia) => ({
      diaRutina: dia,
      minutos: entrenamientos
        .filter((entrenamiento) => Number(entrenamiento.diaRutina) === dia)
        .reduce((total, entrenamiento) => total + Number(entrenamiento.duracionMin || 0), 0)
    })),

    cumplimientoSemanal: crearCumplimientoSemanal(entrenamientos)
  };
}

function crearCumplimientoSemanal(entrenamientos) {
  const semanas = new Map();

  for (const entrenamiento of entrenamientos) {
    const clave = obtenerClaveSemana(entrenamiento.fecha);

    if (!semanas.has(clave)) {
      semanas.set(clave, {
        semana: clave,
        entrenamientos: 0,
        completados: 0,
        minutos: 0
      });
    }

    const item = semanas.get(clave);
    item.entrenamientos += 1;
    item.completados += entrenamiento.estado === "completado" ? 1 : 0;
    item.minutos += Number(entrenamiento.duracionMin || 0);
  }

  return Array.from(semanas.values()).map((item) => ({
    ...item,
    cumplimiento: Math.min(100, Math.round((item.completados / 4) * 100))
  }));
}

function calcularValorEjercicio(ejercicio) {
  if (Array.isArray(ejercicio.series)) {
    return ejercicio.series.reduce((total, serie) => total + Number(serie.valor || 0), 0);
  }

  if (Number.isFinite(Number(ejercicio.minutosCompletados))) {
    return Number(ejercicio.minutosCompletados);
  }

  if (Number.isFinite(Number(ejercicio.rondasCompletadas))) {
    return Number(ejercicio.rondasCompletadas);
  }

  return 0;
}

function obtenerUnidadEjercicio(ejercicio) {
  if (ejercicio.minutosCompletados !== undefined) {
    return "minutos";
  }

  if (ejercicio.rondasCompletadas !== undefined) {
    return "rondas";
  }

  return "repeticiones/segundos";
}

function calcularCiclosCompletos(entrenamientos) {
  const completados = entrenamientos.filter((item) => item.estado === "completado").length;
  return Math.floor(completados / 4);
}

function crearMensajeCumplimiento(cantidadSemana) {
  if (cantidadSemana >= 4) {
    return "Semana fuerte: completaste el objetivo base del ciclo.";
  }

  if (cantidadSemana >= 2) {
    return "Vas avanzando. Intenta completar el ciclo antes de subir intensidad.";
  }

  if (cantidadSemana === 1) {
    return "Ya empezaste la semana. Prioriza constancia sobre intensidad.";
  }

  return "Todavía no hay entrenamientos esta semana.";
}

function crearMensajeFatiga(nivel) {
  if (nivel === "alto") {
    return "Hay señales altas de fatiga o dolor. Conviene bajar intensidad y cuidar recuperación.";
  }

  if (nivel === "medio") {
    return "Hay algunas señales de fatiga. Mantén técnica y evita forzar si baja el rendimiento.";
  }

  return "No hay señales importantes de fatiga en los últimos registros.";
}

function sumar(items, campo) {
  return items.reduce((total, item) => total + Number(item[campo] || 0), 0);
}

function promedio(items, campo) {
  if (!items.length) {
    return 0;
  }

  return redondear(sumar(items, campo) / items.length, 1);
}

function obtenerClaveSemana(fecha) {
  const date = new Date(`${fecha}T00:00:00`);
  const inicio = new Date(date);
  inicio.setDate(date.getDate() - date.getDay());
  return inicio.toISOString().slice(0, 10);
}

function redondear(numero, decimales) {
  const factor = 10 ** decimales;
  return Math.round(numero * factor) / factor;
}
