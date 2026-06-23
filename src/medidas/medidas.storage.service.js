/*
  Nombre completo: medidas.storage.service.js
  Ruta o ubicación: src/medidas/medidas.storage.service.js

  Función:
    - Guardar y leer medidas semanales en localStorage.
    - Controlar recordatorio semanal.
    - Permitir omitir o posponer el registro semanal.

  Se conecta con:
    - src/medidas/medidas.schema.js
    - src/medidas/medidas.recordatorio.service.js
    - src/medidas/medidas.service.js
*/

import { MEDIDAS_CONFIG, normalizarMedida } from "./medidas.schema.js";

const STORAGE_KEY_MEDIDAS = "fitjeff_medidas_semanales";
const STORAGE_KEY_RECORDATORIO = "fitjeff_medidas_recordatorio";

export function obtenerMedidasSemanales() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY_MEDIDAS) || "[]");

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos
      .map(normalizarMedida)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  } catch (_) {
    return [];
  }
}

export function guardarMedidaSemanal(medida) {
  const normalizada = normalizarMedida(medida);
  const historial = obtenerMedidasSemanales();
  const sinDuplicado = historial.filter((item) => item.id !== normalizada.id && item.fecha !== normalizada.fecha);

  const nuevoHistorial = [normalizada, ...sinDuplicado]
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .slice(0, MEDIDAS_CONFIG.maxHistorial);

  localStorage.setItem(STORAGE_KEY_MEDIDAS, JSON.stringify(nuevoHistorial));
  marcarRecordatorioAtendido(normalizada.fecha);

  return {
    ok: true,
    medida: normalizada,
    historial: nuevoHistorial
  };
}

export function obtenerUltimaMedida() {
  return obtenerMedidasSemanales()[0] || null;
}

export function eliminarMedidaSemanal(id) {
  const historial = obtenerMedidasSemanales().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY_MEDIDAS, JSON.stringify(historial));
  return historial;
}

export function obtenerEstadoRecordatorioMedidas() {
  try {
    const estado = JSON.parse(localStorage.getItem(STORAGE_KEY_RECORDATORIO) || "{}");
    return estado && typeof estado === "object" ? estado : {};
  } catch (_) {
    return {};
  }
}

export function guardarEstadoRecordatorioMedidas(estado = {}) {
  const actual = obtenerEstadoRecordatorioMedidas();
  const nuevo = {
    ...actual,
    ...estado,
    actualizadoEn: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY_RECORDATORIO, JSON.stringify(nuevo));
  return nuevo;
}

export function marcarRecordatorioAtendido(fecha = new Date().toISOString().slice(0, 10)) {
  return guardarEstadoRecordatorioMedidas({
    ultimaFechaAtendida: fecha,
    omitidaSemana: null,
    pospuestoPara: null
  });
}

export function omitirRecordatorioSemana() {
  return guardarEstadoRecordatorioMedidas({
    omitidaSemana: obtenerClaveSemana(new Date()),
    pospuestoPara: null
  });
}

export function posponerRecordatorioDomingo() {
  const domingo = obtenerProximoDomingo(new Date());

  return guardarEstadoRecordatorioMedidas({
    pospuestoPara: domingo.toISOString().slice(0, 10)
  });
}

export function obtenerClaveSemana(fecha) {
  const base = new Date(fecha);
  const inicio = new Date(base);
  inicio.setDate(base.getDate() - base.getDay());
  return inicio.toISOString().slice(0, 10);
}

function obtenerProximoDomingo(fecha) {
  const base = new Date(fecha);
  const dia = base.getDay();
  const diferencia = dia === 0 ? 0 : 7 - dia;
  base.setDate(base.getDate() + diferencia);
  return base;
}
