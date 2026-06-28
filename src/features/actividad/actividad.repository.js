/*
  Nombre completo: actividad.repository.js
  Ruta o ubicación: src/features/actividad/actividad.repository.js

  Función o funciones:
    - Leer y guardar registros manuales de Actividad con almacenamiento local seguro.
    - Mantener un solo registro principal por fecha.
    - Reparar duplicados antiguos conservando el registro más reciente por día.
    - Evitar que un JSON dañado rompa el módulo Actividad.
    - Mantener Actividad independiente de Control corporal y Entrenamiento.

  Se conecta con:
    - src/features/actividad/actividad.service.js
    - src/features/actividad/actividad.constants.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../core/storage/safe-local-storage.service.js";
import { ACTIVIDAD_STORAGE_KEY } from "./actividad.constants.js";

function crearId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `actividad-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function obtenerMarcaTiempo(registro = {}) {
  return String(registro.actualizadoEn || registro.creadoEn || "");
}

function compararRegistros(a, b) {
  const fecha = String(b.fecha || "").localeCompare(String(a.fecha || ""));
  if (fecha !== 0) return fecha;
  return obtenerMarcaTiempo(b).localeCompare(obtenerMarcaTiempo(a));
}

function normalizarNumero(valor) {
  const numero = Number(valor || 0);
  return Number.isFinite(numero) ? numero : 0;
}

function normalizarRegistro(registro) {
  if (!registro || typeof registro !== "object") {
    return null;
  }

  const fecha = String(registro.fecha || "").trim();

  if (!fecha) {
    return null;
  }

  return {
    id: registro.id || crearId(),
    fecha,
    tipo: registro.tipo || "pasos",
    pasos: Math.round(normalizarNumero(registro.pasos)),
    bicicletaMin: normalizarNumero(registro.bicicletaMin),
    bicicletaKm: normalizarNumero(registro.bicicletaKm),
    nota: String(registro.nota || ""),
    creadoEn: registro.creadoEn || new Date().toISOString(),
    actualizadoEn: registro.actualizadoEn || registro.creadoEn || new Date().toISOString()
  };
}

function deduplicarPorFecha(registros) {
  const porFecha = new Map();

  normalizarRegistros(registros).forEach((registro) => {
    const existente = porFecha.get(registro.fecha);

    if (!existente || obtenerMarcaTiempo(registro) >= obtenerMarcaTiempo(existente)) {
      porFecha.set(registro.fecha, registro);
    }
  });

  return [...porFecha.values()].sort(compararRegistros);
}

function normalizarRegistros(valor) {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map(normalizarRegistro)
    .filter(Boolean);
}

export function crearActividadRepository(storage = crearSafeLocalStorageService()) {
  function guardarRegistros(registros) {
    const normalizados = deduplicarPorFecha(registros);
    storage.guardarJson(ACTIVIDAD_STORAGE_KEY, normalizados);
    return normalizados;
  }

  function leerRegistros() {
    const originales = normalizarRegistros(storage.leerJson(ACTIVIDAD_STORAGE_KEY, []));
    const reparados = deduplicarPorFecha(originales);

    if (reparados.length !== originales.length) {
      guardarRegistros(reparados);
    }

    return reparados;
  }

  function listar() {
    return leerRegistros();
  }

  function buscarPorFecha(fecha) {
    const fechaNormalizada = String(fecha || "").trim();
    if (!fechaNormalizada) return null;
    return listar().find((registro) => registro.fecha === fechaNormalizada) || null;
  }

  function guardarOActualizarPorFecha(registro) {
    const registros = listar();
    const fecha = String(registro.fecha || "").trim();
    const existente = buscarPorFecha(fecha);
    const ahora = new Date().toISOString();

    if (existente) {
      const actualizado = normalizarRegistro({
        ...existente,
        ...registro,
        id: existente.id,
        creadoEn: existente.creadoEn,
        actualizadoEn: ahora
      });

      guardarRegistros([actualizado, ...registros.filter((item) => item.fecha !== fecha)]);

      return {
        registro: actualizado,
        actualizado: true
      };
    }

    const nuevo = normalizarRegistro({
      id: crearId(),
      creadoEn: ahora,
      actualizadoEn: ahora,
      ...registro
    });

    guardarRegistros([nuevo, ...registros]);

    return {
      registro: nuevo,
      actualizado: false
    };
  }

  return {
    listar,
    buscarPorFecha,
    guardarOActualizarPorFecha,
    guardarRegistros
  };
}
