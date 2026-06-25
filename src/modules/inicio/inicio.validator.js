/*
  Nombre completo: inicio.validator.js
  Ruta o ubicación: src/modules/inicio/inicio.validator.js

  Función o funciones:
    - Validar altura, fecha de nacimiento, peso inicial y peso objetivo.
    - Entender valores escritos con coma decimal o unidades simples.
    - Devolver mensajes simples, sin mostrar código técnico en la app.

  Se conecta con:
    - src/modules/inicio/inicio.service.js
    - src/modules/inicio/inicio.controller.js
    - src/modules/inicio/inicio.constants.js
*/

function limpiarNumero(valor) {
  return String(valor || "")
    .toLowerCase()
    .replace("kg", "")
    .replace("cm", "")
    .replace("m", "")
    .replace(",", ".")
    .trim();
}

export function convertirAlturaACm(valor) {
  const numero = Number(limpiarNumero(valor));

  if (!Number.isFinite(numero)) {
    return null;
  }

  if (numero > 0 && numero < 3) {
    return Math.round(numero * 100);
  }

  return Math.round(numero);
}

export function convertirPesoAKg(valor) {
  const numero = Number(limpiarNumero(valor));

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.round(numero * 10) / 10;
}

function fechaEsValida(fecha) {
  if (!fecha) {
    return false;
  }

  const valor = new Date(fecha);
  return !Number.isNaN(valor.getTime()) && valor < new Date();
}

export function validarInicio(datos) {
  const errores = {};
  const alturaCm = convertirAlturaACm(datos.alturaCm);
  const pesoInicialKg = convertirPesoAKg(datos.pesoInicialKg);
  const pesoObjetivoKg = convertirPesoAKg(datos.pesoObjetivoKg);

  if (!alturaCm || alturaCm < 100 || alturaCm > 230) {
    errores.alturaCm = "Escribe una altura válida.";
  }

  if (!fechaEsValida(datos.fechaNacimiento)) {
    errores.fechaNacimiento = "Escribe una fecha de nacimiento válida.";
  }

  if (!pesoInicialKg || pesoInicialKg < 30 || pesoInicialKg > 250) {
    errores.pesoInicialKg = "Escribe un peso inicial válido.";
  }

  if (!pesoObjetivoKg || pesoObjetivoKg < 30 || pesoObjetivoKg > 250) {
    errores.pesoObjetivoKg = "Escribe un peso objetivo válido.";
  }

  return {
    ok: Object.keys(errores).length === 0,
    errores,
    datosLimpios: {
      alturaCm,
      fechaNacimiento: datos.fechaNacimiento,
      pesoInicialKg,
      pesoObjetivoKg
    }
  };
}
