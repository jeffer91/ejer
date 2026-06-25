/*
  Nombre completo: ingreso.validator.js
  Ruta o ubicación: src/modules/registro/ingreso/ingreso.validator.js

  Función o funciones:
    - Validar peso diario y medidas semanales.
    - Revisar rangos normales del cuerpo.
    - Detectar cambios poco comunes frente al último registro guardado.

  Se conecta con:
    - src/modules/registro/ingreso/ingreso.parser.js
    - src/modules/registro/ingreso/ingreso.constants.js
    - src/modules/registro/ingreso/ingreso.controller.js
*/

import { INGRESO_CAMPOS_MEDIDAS, INGRESO_LIMITES, INGRESO_LABELS } from "./ingreso.constants.js";
import { convertirACm, convertirAKg, normalizarFecha, textoVacio } from "./ingreso.parser.js";

function validarRango(campo, valor, errores) {
  const limite = INGRESO_LIMITES[campo];

  if (!limite || valor === null) {
    return;
  }

  if (valor < limite.minimo || valor > limite.maximo) {
    errores[campo] = `${INGRESO_LABELS[campo]} parece fuera de rango.`;
  }
}

function obtenerUltimoRegistro(registros, tipo) {
  return registros.find((registro) => registro.tipo === tipo && registro.estado !== "eliminado") || null;
}

function detectarCambiosRaros(datos, ultimoRegistro) {
  const alertas = [];

  if (!ultimoRegistro || !ultimoRegistro.datos) {
    return alertas;
  }

  Object.entries(datos).forEach(([campo, valor]) => {
    const limite = INGRESO_LIMITES[campo];
    const anterior = Number(ultimoRegistro.datos[campo]);

    if (!limite || valor === null || !Number.isFinite(anterior)) {
      return;
    }

    const diferencia = Math.abs(valor - anterior);

    if (diferencia >= limite.cambioRaro) {
      alertas.push(`${INGRESO_LABELS[campo]} cambió ${diferencia.toFixed(1)} en comparación con el último registro.`);
    }
  });

  return alertas;
}

export function validarPesoIngreso(datos, registros) {
  const errores = {};
  const pesoKg = convertirAKg(datos.pesoKg);
  const fecha = normalizarFecha(datos.fecha);

  if (pesoKg === null) {
    errores.pesoKg = "Escribe tu peso.";
  }

  validarRango("pesoKg", pesoKg, errores);

  const ultimoPeso = obtenerUltimoRegistro(registros, "peso");
  const alertas = detectarCambiosRaros({ pesoKg }, ultimoPeso);

  return {
    ok: Object.keys(errores).length === 0,
    errores,
    alertas,
    datosLimpios: {
      pesoKg,
      fecha,
      origen: "registro"
    }
  };
}

export function validarMedidasIngreso(datos, registros) {
  const errores = {};
  const fecha = normalizarFecha(datos.fecha);
  const campos = Object.values(INGRESO_CAMPOS_MEDIDAS).filter((campo) => campo !== "fecha");
  const datosLimpios = { fecha, origen: "registro" };
  let tieneDato = false;

  campos.forEach((campo) => {
    const valorTexto = datos[campo];
    const valor = convertirACm(valorTexto);

    if (!textoVacio(valorTexto)) {
      tieneDato = true;
      datosLimpios[campo] = valor;
      validarRango(campo, valor, errores);
    }
  });

  if (!tieneDato) {
    errores.general = "Escribe al menos una medida.";
  }

  const ultimoMedidas = obtenerUltimoRegistro(registros, "medidas");
  const alertas = detectarCambiosRaros(datosLimpios, ultimoMedidas);

  return {
    ok: Object.keys(errores).length === 0,
    errores,
    alertas,
    datosLimpios
  };
}
