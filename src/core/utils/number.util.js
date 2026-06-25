/*
  Nombre completo: number.util.js
  Ruta o ubicación: src/core/utils/number.util.js

  Función o funciones:
    - Centralizar limpieza, conversión y formato de números.
    - Entender coma decimal y textos con unidades simples.
    - Evitar que cada módulo repita conversiones.

  Se conecta con:
    - futuros validadores centrales.
    - src/modules/registro/ingreso/ingreso.parser.js
    - src/modules/registro/estadisticas/estadisticas.calculations.js
*/

export function limpiarNumeroTexto(valor) {
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
    .replace("metros", "")
    .replace("metro", "")
    .replace("m", "")
    .replace(",", ".")
    .trim();
}

export function convertirNumero(valor) {
  const numero = Number(limpiarNumeroTexto(valor));
  return Number.isFinite(numero) ? numero : null;
}

export function redondear(valor, decimales = 1) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return null;
  }

  const factor = 10 ** decimales;
  return Math.round(numero * factor) / factor;
}

export function formatearNumero(valor, decimales = 1) {
  const numero = redondear(valor, decimales);

  if (numero === null) {
    return "-";
  }

  return String(numero).replace(".0", "");
}

export function limitarNumero(valor, minimo, maximo) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.max(minimo, Math.min(maximo, numero));
}
