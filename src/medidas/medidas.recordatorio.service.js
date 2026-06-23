/*
  Nombre completo: medidas.recordatorio.service.js
  Ruta o ubicación: src/medidas/medidas.recordatorio.service.js

  Función:
    - Evaluar si corresponde mostrar recordatorio semanal.
    - Mostrar recordatorio principalmente sábado o domingo.
    - Evitar repetir recordatorio si ya se registró, omitió o pospuso.

  Se conecta con:
    - src/medidas/medidas.storage.service.js
    - src/vistas/medidas.view.js
*/

import {
  obtenerClaveSemana,
  obtenerEstadoRecordatorioMedidas,
  obtenerMedidasSemanales
} from "./medidas.storage.service.js";

export function evaluarRecordatorioMedidas(fecha = new Date()) {
  const hoy = new Date(fecha);
  const diaSemana = hoy.getDay();
  const fechaTexto = hoy.toISOString().slice(0, 10);
  const semanaActual = obtenerClaveSemana(hoy);
  const estado = obtenerEstadoRecordatorioMedidas();
  const historial = obtenerMedidasSemanales();

  const yaRegistroSemana = historial.some((item) => obtenerClaveSemana(new Date(item.fecha)) === semanaActual);

  if (yaRegistroSemana) {
    return crearRespuesta(false, "Ya existe un registro esta semana.");
  }

  if (estado.omitidaSemana === semanaActual) {
    return crearRespuesta(false, "La semana fue omitida.");
  }

  if (estado.pospuestoPara && estado.pospuestoPara !== fechaTexto) {
    return crearRespuesta(false, "Recordatorio pospuesto.");
  }

  if (![0, 6].includes(diaSemana)) {
    return crearRespuesta(false, "El recordatorio aparece sábado o domingo.");
  }

  return crearRespuesta(true, "Toca registrar tu avance semanal.");
}

export function crearTextoRecordatorioMedidas() {
  return {
    titulo: "Registro semanal",
    mensaje: "Toca registrar tu avance semanal. Puedes hacerlo ahora, recordarlo el domingo u omitir esta semana.",
    ahora: "Registrar ahora",
    domingo: "Recordarme el domingo",
    omitir: "Omitir esta semana"
  };
}

function crearRespuesta(mostrar, motivo) {
  return {
    mostrar,
    motivo,
    creadoEn: new Date().toISOString()
  };
}
