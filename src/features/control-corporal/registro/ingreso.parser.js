/*
  Nombre completo: ingreso.parser.js
  Ruta o ubicacion: src/features/control-corporal/registro/ingreso.parser.js

  Funcion o funciones:
    - Interpretar datos escritos de forma flexible por el usuario.
    - Entender coma decimal, kg, cm y espacios.
    - Convertir entradas a numeros limpios para guardar en Registro.
    - Usar fecha local para evitar desfases por UTC.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.validator.js
    - src/features/control-corporal/registro/registro.controller.js
    - src/core/utils/date.util.js
*/

import { obtenerFechaHoyISO } from "../../../core/utils/date.util.js";

function limpiarTexto(valor) {
  return String(valor || "")
    .toLowerCase()
    .replace("kilogramos", "")
    .replace("kilogramo", "")
    .replace("kilos", "")
    .replace("kilo", "")
    .replace("kg", "")
    .replace("centimetros", "")
    .replace("centímetros", "")
    .replace("centimetro", "")
    .replace("centímetro", "")
    .replace("cm", "")
    .replace(",", ".")
    .trim();
}

export function textoVacio(valor) {
  return String(valor || "").trim() === "";
}

export function convertirAKg(valor) {
  if (textoVacio(valor)) {
    return null;
  }

  const numero = Number(limpiarTexto(valor));

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.round(numero * 10) / 10;
}

export function convertirACm(valor) {
  if (textoVacio(valor)) {
    return null;
  }

  const numero = Number(limpiarTexto(valor));

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.round(numero * 10) / 10;
}

export function fechaHoy() {
  return obtenerFechaHoyISO();
}

export function normalizarFecha(valor) {
  return String(valor || "").trim() || fechaHoy();
}
