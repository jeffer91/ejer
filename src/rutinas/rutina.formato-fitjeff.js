/*
  Nombre completo: rutina.formato-fitjeff.js
  Ruta o ubicación: src/rutinas/rutina.formato-fitjeff.js

  Función:
    - Crear el formato FitJeff para copiarlo y pedir una rutina a una IA.
    - Generar una plantilla basada en el día actual.
    - Mantener estructura simple para que el parser pueda leerla.

  Se conecta con:
    - src/rutinas/rutina.schema.js
    - src/vistas/rutinas.view.js
*/

import { RUTINA_ACCIONES, limpiarTexto } from "./rutina.schema.js";

export function crearFormatoFitJeff({ rutina, diaNumero = 1, accion = RUTINA_ACCIONES.REEMPLAZAR_DIA } = {}) {
  const dia = seleccionarDia(rutina, diaNumero);
  const numero = Number(dia?.numero || diaNumero || 1);

  return `# FORMATO FITJEFF - RUTINA

Acción: ${accion}
Día a reemplazar: ${numero}
Nombre del día: ${dia?.nombre || "Rutina"}
Duración estimada: ${dia?.duracionEstimadaMin || 40} minutos
Objetivo: ${dia?.objetivo || "Completar la sesión con control."}

## Preparación

| Orden | Actividad | Duración |
|---|---|---|
${crearFilasPreparacion(dia)}

## Ejercicios

| Orden | Ejercicio | Tipo | Series | Unidad | Descanso | Instrucciones |
|---|---|---|---|---|---|---|
${crearFilasEjercicios(dia)}

## Observaciones

- Mantener instrucciones claras.
- Usar descansos en segundos.
- Usar tipos: repeticiones, tiempo, cardio, hiit.
- Usar unidades: repeticiones, segundos, minutos, rondas.
`;
}

export function crearPromptFitJeff({ rutina, diaNumero = 1, accion = RUTINA_ACCIONES.REEMPLAZAR_DIA } = {}) {
  return `Devuelve SOLO el formato FitJeff, sin explicación adicional.

Reglas:
- No cambies los encabezados.
- Usa tablas Markdown.
- Usa tipos: repeticiones, tiempo, cardio o hiit.
- Usa unidades: repeticiones, segundos, minutos o rondas.
- Descanso siempre en segundos.
- Instrucciones cortas y claras.

Formato:

${crearFormatoFitJeff({ rutina, diaNumero, accion })}`;
}

export function crearPlantillaFitJeff() {
  return crearFormatoFitJeff({
    rutina: {
      dias: [
        {
          numero: 1,
          nombre: "Rutina base",
          objetivo: "Completar la sesión con control.",
          duracionEstimadaMin: 40,
          calentamiento: [
            { nombre: "Movilidad general", duracionSeg: 60 },
            { nombre: "Activación suave", duracionSeg: 60 }
          ],
          ejercicios: [
            {
              nombre: "Ejercicio principal",
              tipoRegistro: "repeticiones",
              seriesObjetivo: 3,
              unidad: "repeticiones",
              descansoSeg: 90,
              instrucciones: "Realizar con control."
            }
          ]
        }
      ]
    },
    diaNumero: 1
  });
}

function seleccionarDia(rutina, diaNumero) {
  const dias = Array.isArray(rutina?.dias) ? rutina.dias : [];
  return dias.find((dia) => Number(dia.numero) === Number(diaNumero)) || dias[0] || null;
}

function crearFilasPreparacion(dia) {
  const pasos = Array.isArray(dia?.calentamiento?.pasos)
    ? dia.calentamiento.pasos
    : Array.isArray(dia?.calentamiento)
      ? dia.calentamiento
      : [];

  if (!pasos.length) {
    return "| 1 | Preparación general | 300 segundos |";
  }

  return pasos.map((paso, index) => {
    const nombre = limpiarTexto(paso.nombre || paso.actividad || `Preparación ${index + 1}`);
    const duracion = paso.duracionSeg || paso.duracionSegundos || paso.segundos || 45;
    return `| ${index + 1} | ${nombre} | ${duracion} segundos |`;
  }).join("\n");
}

function crearFilasEjercicios(dia) {
  const ejercicios = Array.isArray(dia?.ejercicios) ? dia.ejercicios : [];

  if (!ejercicios.length) {
    return "| 1 | Ejercicio principal | repeticiones | 3 | repeticiones | 90 segundos | Realizar con control |";
  }

  return ejercicios.map((ejercicio, index) => {
    const nombre = limpiarTexto(ejercicio.nombre || `Ejercicio ${index + 1}`);
    const tipo = limpiarTexto(ejercicio.tipoRegistro || "repeticiones");
    const series = ejercicio.seriesObjetivo || ejercicio.series || ejercicio.rondasObjetivo || 3;
    const unidad = limpiarTexto(ejercicio.unidad || "repeticiones");
    const descanso = ejercicio.descansoSeg || ejercicio.descansoSegundos || ejercicio.descanso || 90;
    const instrucciones = limpiarTexto(ejercicio.instrucciones || "Realizar con control.");

    return `| ${index + 1} | ${nombre} | ${tipo} | ${series} | ${unidad} | ${descanso} segundos | ${instrucciones} |`;
  }).join("\n");
}
