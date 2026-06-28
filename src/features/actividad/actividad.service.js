import { sumarDiasISO } from "../../core/utils/date.util.js";
import { ACTIVIDAD_TEXTOS, ACTIVIDAD_TIPOS, fechaHoyISO } from "./actividad.constants.js";
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

export function crearActividadService(repository = crearActividadRepository()) {
  function listarRegistros() {
    return repository.listar();
  }

  function guardarActividad(datos = {}) {
    const fecha = String(datos.fecha || "").trim();
    const pasos = Math.round(numero(datos.pasos));
    const bicicletaMin = numero(datos.bicicletaMin);
    const bicicletaKm = numero(datos.bicicletaKm);
    const nota = String(datos.nota || "").trim().slice(0, 180);

    if (!fecha) {
      return { ok: false, mensaje: ACTIVIDAD_TEXTOS.ERROR_FECHA, errores: { fecha: ACTIVIDAD_TEXTOS.ERROR_FECHA } };
    }

    if (pasos <= 0 && bicicletaMin <= 0 && bicicletaKm <= 0) {
      return { ok: false, mensaje: ACTIVIDAD_TEXTOS.ERROR_SIN_DATOS, errores: { pasos: "Agrega al menos un dato.", bicicletaMin: "Agrega al menos un dato.", bicicletaKm: "Agrega al menos un dato." } };
    }

    const registro = repository.guardar({
      fecha,
      tipo: detectarTipo({ pasos, bicicletaMin, bicicletaKm }),
      pasos,
      bicicletaMin,
      bicicletaKm,
      nota
    });

    return { ok: true, mensaje: ACTIVIDAD_TEXTOS.EXITO, registro, errores: {} };
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
    listarRegistros,
    obtenerResumen
  };
}
