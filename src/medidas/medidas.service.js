/*
  Nombre completo: medidas.service.js
  Ruta o ubicación: src/medidas/medidas.service.js

  Función:
    - Crear registros semanales desde formularios.
    - Calcular resumen visual de medidas.
    - Generar datos simples para gráficos.

  Se conecta con:
    - src/medidas/medidas.schema.js
    - src/medidas/medidas.storage.service.js
    - src/vistas/medidas.view.js
*/

import { normalizarMedida, validarMedida } from "./medidas.schema.js";
import { guardarMedidaSemanal, obtenerMedidasSemanales } from "./medidas.storage.service.js";

export function crearRegistroMedidas(datosFormulario = {}) {
  const medida = normalizarMedida({
    fecha: datosFormulario.fecha,
    pesoKg: datosFormulario.pesoKg,
    cinturaCm: datosFormulario.cinturaCm,
    pechoCm: datosFormulario.pechoCm,
    brazoCm: datosFormulario.brazoCm,
    piernaCm: datosFormulario.piernaCm,
    energiaSemana: datosFormulario.energiaSemana,
    cumplimientoSemana: datosFormulario.cumplimientoSemana,
    observacion: datosFormulario.observacion
  });

  const validacion = validarMedida(medida);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores,
      advertencias: validacion.advertencias,
      medida
    };
  }

  const guardado = guardarMedidaSemanal(medida);

  return {
    ok: true,
    errores: [],
    advertencias: validacion.advertencias,
    medida: guardado.medida,
    historial: guardado.historial
  };
}

export function obtenerResumenMedidas() {
  const historial = obtenerMedidasSemanales();
  const actual = historial[0] || null;
  const anterior = historial[1] || null;

  return {
    totalRegistros: historial.length,
    actual,
    anterior,
    comparacion: compararMedidas(actual, anterior),
    promedioCumplimiento: promedio(historial.map((item) => item.cumplimientoSemana)),
    promedioEnergia: promedio(historial.map((item) => item.energiaSemana))
  };
}

export function compararMedidas(actual, anterior) {
  if (!actual || !anterior) {
    return {
      disponible: false,
      texto: "Aún no hay comparación semanal."
    };
  }

  return {
    disponible: true,
    pesoKg: diferencia(actual.pesoKg, anterior.pesoKg),
    cinturaCm: diferencia(actual.cinturaCm, anterior.cinturaCm),
    pechoCm: diferencia(actual.pechoCm, anterior.pechoCm),
    brazoCm: diferencia(actual.brazoCm, anterior.brazoCm),
    piernaCm: diferencia(actual.piernaCm, anterior.piernaCm),
    cumplimientoSemana: diferencia(actual.cumplimientoSemana, anterior.cumplimientoSemana),
    energiaSemana: diferencia(actual.energiaSemana, anterior.energiaSemana)
  };
}

export function crearMensajeResumenMedidas(resumen) {
  if (!resumen?.actual) {
    return "Aún no hay medidas semanales registradas.";
  }

  const cumplimiento = resumen.actual.cumplimientoSemana ?? 0;
  const energia = resumen.actual.energiaSemana ?? 0;

  return `Semana registrada. Constancia: ${cumplimiento}/7. Energía: ${energia}/5.`;
}

function diferencia(actual, anterior) {
  if (actual === null || actual === undefined || anterior === null || anterior === undefined) {
    return null;
  }

  const valor = Math.round((Number(actual) - Number(anterior)) * 10) / 10;
  return Number.isFinite(valor) ? valor : null;
}

function promedio(lista) {
  const limpia = lista.filter((valor) => Number.isFinite(Number(valor)));

  if (!limpia.length) {
    return null;
  }

  const total = limpia.reduce((suma, valor) => suma + Number(valor), 0);
  return Math.round((total / limpia.length) * 10) / 10;
}
