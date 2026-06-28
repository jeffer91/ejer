/*
  Nombre completo: actividad.service.js
  Ruta o ubicación: src/features/actividad/actividad.service.js

  Función o funciones:
    - Validar y normalizar registros manuales de Actividad.
    - Guardar pasos, bicicleta o registro mixto.
    - Mantener un solo registro principal por fecha.
    - Actualizar el registro del día cuando ya existe, en lugar de crear duplicados.
    - Preparar resumen diario y semanal.
    - Incluir el resumen de dispositivos preparados.

  Se conecta con:
    - src/features/actividad/actividad.repository.js
    - src/features/actividad/actividad.constants.js
    - src/features/actividad/registro/registro.controller.js
    - src/features/actividad/resumen/resumen.controller.js
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/core/utils/date.util.js
*/

import { convertirAFechaSegura, sumarDiasISO } from "../../core/utils/date.util.js";
import { ACTIVIDAD_LIMITES, ACTIVIDAD_TEXTOS, ACTIVIDAD_TIPOS, fechaHoyISO } from "./actividad.constants.js";
import { crearActividadRepository } from "./actividad.repository.js";
import { obtenerResumenDispositivos } from "./dispositivos/dispositivos.service.js";

function numero(valor) {
  const normalizado = String(valor ?? "").replace(",", ".").trim();
  const n = Number(normalizado);
  return Number.isFinite(n) && n > 0 ? Number(n.toFixed(2)) : 0;
}

function sumar(registros, campo) {
  return registros.reduce((total, registro) => total + Number(registro[campo] || 0), 0);
}

function detectarTipo({ pasos, bicicletaMin, bicicletaKm }) {
  if (pasos > 0 && (bicicletaMin > 0 || bicicletaKm > 0)) return ACTIVIDAD_TIPOS.MIXTO;
  if (bicicletaMin > 0 || bicicletaKm > 0) return ACTIVIDAD_TIPOS.BICICLETA;
  return ACTIVIDAD_TIPOS.PASOS;
}

function fechaEsFutura(fecha) {
  const seleccionada = convertirAFechaSegura(fecha);
  const hoy = convertirAFechaSegura(fechaHoyISO());

  if (!seleccionada || !hoy) return false;
  return seleccionada.getTime() > hoy.getTime();
}

function validarFecha(fecha, errores) {
  if (!fecha || !convertirAFechaSegura(fecha)) {
    errores.fecha = ACTIVIDAD_TEXTOS.ERROR_FECHA;
    return;
  }

  if (fechaEsFutura(fecha)) {
    errores.fecha = ACTIVIDAD_TEXTOS.ERROR_FECHA_FUTURA;
  }
}

function validarRangos({ pasos, bicicletaMin, bicicletaKm }, errores) {
  if (pasos > ACTIVIDAD_LIMITES.PASOS_MAX) {
    errores.pasos = `Máximo ${ACTIVIDAD_LIMITES.PASOS_MAX.toLocaleString("es-EC")} pasos.`;
  }

  if (bicicletaMin > ACTIVIDAD_LIMITES.BICICLETA_MIN_MAX) {
    errores.bicicletaMin = `Máximo ${ACTIVIDAD_LIMITES.BICICLETA_MIN_MAX} minutos.`;
  }

  if (bicicletaKm > ACTIVIDAD_LIMITES.BICICLETA_KM_MAX) {
    errores.bicicletaKm = `Máximo ${ACTIVIDAD_LIMITES.BICICLETA_KM_MAX} km.`;
  }
}

function normalizarActividad(datos = {}) {
  const fecha = String(datos.fecha || "").trim();
  const pasos = Math.round(numero(datos.pasos));
  const bicicletaMin = numero(datos.bicicletaMin);
  const bicicletaKm = numero(datos.bicicletaKm);
  const nota = String(datos.nota || "").trim().slice(0, ACTIVIDAD_LIMITES.NOTA_MAX);

  return {
    fecha,
    tipo: detectarTipo({ pasos, bicicletaMin, bicicletaKm }),
    pasos,
    bicicletaMin,
    bicicletaKm,
    nota
  };
}

function validarActividad(actividad) {
  const errores = {};

  validarFecha(actividad.fecha, errores);

  if (actividad.pasos <= 0 && actividad.bicicletaMin <= 0 && actividad.bicicletaKm <= 0) {
    errores.pasos = "Agrega al menos un dato.";
    errores.bicicletaMin = "Agrega al menos un dato.";
    errores.bicicletaKm = "Agrega al menos un dato.";
  }

  validarRangos(actividad, errores);

  return {
    ok: Object.keys(errores).length === 0,
    errores
  };
}

export function crearActividadService(repository = crearActividadRepository()) {
  function listarRegistros() {
    return repository.listar();
  }

  function obtenerActividadPorFecha(fecha) {
    return repository.buscarPorFecha(fecha);
  }

  function guardarActividad(datos = {}) {
    const actividad = normalizarActividad(datos);
    const validacion = validarActividad(actividad);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: Object.values(validacion.errores)[0] || ACTIVIDAD_TEXTOS.ERROR_RANGO,
        errores: validacion.errores
      };
    }

    const resultado = repository.guardarOActualizarPorFecha(actividad);

    return {
      ok: true,
      actualizado: resultado.actualizado,
      mensaje: resultado.actualizado ? ACTIVIDAD_TEXTOS.EXITO_ACTUALIZADO : ACTIVIDAD_TEXTOS.EXITO,
      registro: resultado.registro,
      errores: {}
    };
  }

  function obtenerResumen() {
    const registros = listarRegistros();
    const hoy = fechaHoyISO();
    const desdeSemana = sumarDiasISO(hoy, -6);
    const registrosHoy = registros.filter((registro) => registro.fecha === hoy);
    const registrosSemana = registros.filter((registro) => registro.fecha >= desdeSemana && registro.fecha <= hoy);

    return {
      fecha: hoy,
      totalRegistros: registros.length,
      hoy: {
        pasos: sumar(registrosHoy, "pasos"),
        bicicletaMin: sumar(registrosHoy, "bicicletaMin"),
        bicicletaKm: sumar(registrosHoy, "bicicletaKm")
      },
      semana: {
        pasos: sumar(registrosSemana, "pasos"),
        bicicletaMin: sumar(registrosSemana, "bicicletaMin"),
        bicicletaKm: sumar(registrosSemana, "bicicletaKm"),
        diasActivos: new Set(registrosSemana.map((registro) => registro.fecha)).size
      },
      dispositivos: obtenerResumenDispositivos(),
      recientes: registros.slice(0, 6)
    };
  }

  return {
    guardarActividad,
    obtenerActividadPorFecha,
    listarRegistros,
    obtenerResumen
  };
}
