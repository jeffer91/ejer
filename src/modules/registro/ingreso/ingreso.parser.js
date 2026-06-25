/*
  Nombre completo: ingreso.parser.js
  Ruta o ubicación: src/modules/registro/ingreso/ingreso.parser.js

  Función o funciones:
    - Interpretar datos escritos de forma flexible por el usuario.
    - Entender coma decimal, kg, cm y espacios.
    - Convertir entradas a números limpios para guardar en Registro.

  Se conecta con:
    - src/modules/registro/ingreso/ingreso.validator.js
    - src/modules/registro/ingreso/ingreso.controller.js
*/

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
  return new Date().toISOString().slice(0, 10);
}

export function normalizarFecha(valor) {
  return String(valor || "").trim() || fechaHoy();
}
