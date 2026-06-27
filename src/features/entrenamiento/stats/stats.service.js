/*
  Nombre completo: stats.service.js
  Ruta o ubicación: src/features/entrenamiento/stats/stats.service.js

  Función o funciones:
    - Construir el dashboard de rendimiento del módulo Entrenamiento.
    - Calcular semana, racha, tiempo, fuerza, cardio y alertas simples.
    - Integrar diagnóstico básico del módulo para cierre de primera versión.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.diagnostics.js
    - src/features/entrenamiento/stats/stats.controller.js
*/

import {
  ENTRENAMIENTO_ESTADOS_RUTINA,
  ENTRENAMIENTO_ESTADOS_SESION,
  ENTRENAMIENTO_TIPOS_CARDIO
} from "../entrenamiento.constants.js";
import { diagnosticarEntrenamiento } from "../entrenamiento.diagnostics.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { fechaEntrenamientoHoy } from "../entrenamiento.state.js";

function fechaLocal(fechaIso) {
  return new Date(`${fechaIso}T00:00:00`);
}

function formatoFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

function sumarDias(fechaIso, dias) {
  const fecha = fechaLocal(fechaIso);
  fecha.setDate(fecha.getDate() + dias);
  return formatoFecha(fecha);
}

function ultimosDias(cantidad = 7) {
  const hoy = fechaEntrenamientoHoy();
  return Array.from({ length: cantidad }, (_, indice) => sumarDias(hoy, indice - cantidad + 1));
}

function sumar(lista, campo) {
  return lista.reduce((total, item) => total + Number(item[campo] || 0), 0);
}

function porcentaje(valor, maximo) {
  if (!maximo) return 0;
  return Math.min(100, Math.round((valor / maximo) * 100));
}

function sesionesCompletadas(estado) {
  return estado.sesiones.filter((sesion) => sesion.estado === ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA);
}

function actividadPorFecha(estado, fecha) {
  const sesiones = sesionesCompletadas(estado).filter((sesion) => sesion.fecha === fecha);
  const cardio = estado.cardio.filter((item) => item.fecha === fecha);

  return {
    fecha,
    sesiones: sesiones.length,
    cardio: cardio.length,
    tiempo: sumar(sesiones, "tiempoMinutos") + sumar(cardio, "tiempoMinutos"),
    ejercicios: sumar(sesiones, "ejerciciosCompletados"),
    series: sumar(sesiones, "seriesCompletadas"),
    repeticiones: sumar(sesiones, "repeticionesCompletadas")
  };
}

function calcularRacha(estado) {
  const fechasActivas = new Set([
    ...sesionesCompletadas(estado).map((sesion) => sesion.fecha),
    ...estado.cardio.map((item) => item.fecha)
  ]);

  let racha = 0;
  let cursor = fechaEntrenamientoHoy();

  while (fechasActivas.has(cursor)) {
    racha += 1;
    cursor = sumarDias(cursor, -1);
  }

  return racha;
}

function construirSemana(estado) {
  return ultimosDias(7).map((fecha) => actividadPorFecha(estado, fecha));
}

function construirAlertas({ estado, semana, resumen, racha, diagnostico }) {
  const alertas = [];
  const rutinaActiva = estado.rutinas.find((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA);
  const actividadHoy = semana[semana.length - 1];

  if (!rutinaActiva) {
    alertas.push({ tipo: "pendiente", texto: "No hay rutina activa. Activa una para que Diario cargue el día automáticamente." });
  }

  if (actividadHoy && actividadHoy.tiempo === 0) {
    alertas.push({ tipo: "info", texto: "Hoy todavía no hay entrenamiento registrado." });
  }

  if (racha >= 3) {
    alertas.push({ tipo: "ok", texto: `Racha actual de ${racha} día(s). Revisa también descanso y recuperación.` });
  }

  if (!resumen.tieneGemini) {
    alertas.push({ tipo: "info", texto: "Gemini está pendiente. La guía inteligente se activará desde Ajustes." });
  }

  if (diagnostico && !diagnostico.ok) {
    diagnostico.alertas.forEach((alerta) => alertas.push(alerta));
  }

  if (alertas.length === 0) {
    alertas.push({ tipo: "ok", texto: "Entrenamiento sin alertas importantes." });
  }

  return alertas;
}

export function crearEntrenamientoStatsService(entrenamientoService = crearEntrenamientoService()) {
  function obtenerDashboard() {
    const estado = entrenamientoService.obtenerEstado();
    const resumen = entrenamientoService.obtenerResumen();
    const diagnostico = diagnosticarEntrenamiento(estado);
    const semana = construirSemana(estado);
    const semanaActiva = semana.filter((dia) => dia.tiempo > 0);
    const sesionesSemana = semana.reduce((total, dia) => total + dia.sesiones, 0);
    const cardioSemana = semana.reduce((total, dia) => total + dia.cardio, 0);
    const tiempoSemana = semana.reduce((total, dia) => total + dia.tiempo, 0);
    const racha = calcularRacha(estado);
    const rutinaActiva = estado.rutinas.find((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA) || null;
    const intervalos = estado.cardio.filter((item) => item.tipo === ENTRENAMIENTO_TIPOS_CARDIO.INTERVALOS).length;

    const barras = [
      { label: "Constancia", valor: porcentaje(semanaActiva.length, 7), detalle: `${semanaActiva.length}/7 días` },
      { label: "Fuerza", valor: porcentaje(sesionesSemana, 4), detalle: `${sesionesSemana} sesión(es)` },
      { label: "Cardio", valor: porcentaje(cardioSemana, 4), detalle: `${cardioSemana} registro(s)` }
    ];

    const tarjetas = [
      { label: "Días", valor: semanaActiva.length, detalle: "activos esta semana", tipo: "ok" },
      { label: "Racha", valor: racha, detalle: "día(s) seguidos", tipo: "accent" },
      { label: "Ejercicios", valor: resumen.ejerciciosCompletados, detalle: "completados", tipo: "info" },
      { label: "Series", valor: resumen.seriesCompletadas, detalle: `${resumen.repeticionesCompletadas} repeticiones`, tipo: "ok" },
      { label: "Tiempo", valor: `${resumen.tiempoTotalMinutos} min`, detalle: `${tiempoSemana} min esta semana`, tipo: "info" },
      { label: "HIT", valor: intervalos, detalle: "sesiones registradas", tipo: "accent" },
      { label: "Caminata", valor: resumen.caminatas, detalle: "registros", tipo: "ok" },
      { label: "Bicicleta", valor: resumen.bicicleta, detalle: "registros", tipo: "info" }
    ];

    return {
      resumen,
      diagnostico,
      rutinaActiva,
      semana,
      barras,
      tarjetas,
      alertas: construirAlertas({ estado, semana, resumen, racha, diagnostico }),
      estadoGeneral: rutinaActiva ? "Rutina activa" : "Sin rutina activa"
    };
  }

  return {
    obtenerDashboard
  };
}
