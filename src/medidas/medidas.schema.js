/*
  Nombre completo: medidas.schema.js
  Ruta o ubicación: src/medidas/medidas.schema.js

  Función:
    - Definir la estructura oficial de las medidas semanales.
    - Normalizar números, fechas y campos opcionales.
    - Validar que el registro tenga información útil antes de guardar.

  Se conecta con:
    - src/medidas/medidas.storage.service.js
    - src/medidas/medidas.service.js
    - src/vistas/medidas.view.js
*/

export const MEDIDAS_CAMPOS = Object.freeze({
  FECHA: "fecha",
  PESO: "pesoKg",
  CINTURA: "cinturaCm",
  PECHO: "pechoCm",
  BRAZO: "brazoCm",
  PIERNA: "piernaCm",
  ENERGIA: "energiaSemana",
  CUMPLIMIENTO: "cumplimientoSemana",
  OBSERVACION: "observacion"
});

export const MEDIDAS_CONFIG = Object.freeze({
  version: "1.0.0",
  maxHistorial: 80,
  energiaMin: 1,
  energiaMax: 5,
  cumplimientoMin: 0,
  cumplimientoMax: 7
});

export function crearMedidaBase() {
  const ahora = new Date();

  return {
    id: `medida_${Date.now()}`,
    fecha: ahora.toISOString().slice(0, 10),
    pesoKg: null,
    cinturaCm: null,
    pechoCm: null,
    brazoCm: null,
    piernaCm: null,
    energiaSemana: 3,
    cumplimientoSemana: 0,
    observacion: "",
    creadoEn: ahora.toISOString(),
    actualizadoEn: ahora.toISOString()
  };
}

export function normalizarMedida(datos = {}) {
  const base = crearMedidaBase();

  return {
    ...base,
    ...datos,
    id: datos.id || base.id,
    fecha: normalizarFecha(datos.fecha || base.fecha),
    pesoKg: numeroOpcional(datos.pesoKg),
    cinturaCm: numeroOpcional(datos.cinturaCm),
    pechoCm: numeroOpcional(datos.pechoCm),
    brazoCm: numeroOpcional(datos.brazoCm),
    piernaCm: numeroOpcional(datos.piernaCm),
    energiaSemana: limitarNumero(datos.energiaSemana, 1, 5, 3),
    cumplimientoSemana: limitarNumero(datos.cumplimientoSemana, 0, 7, 0),
    observacion: String(datos.observacion || "").trim(),
    actualizadoEn: new Date().toISOString()
  };
}

export function validarMedida(medida) {
  const errores = [];
  const advertencias = [];

  if (!medida.fecha) {
    errores.push("La fecha es obligatoria.");
  }

  const tieneMedida = [
    medida.pesoKg,
    medida.cinturaCm,
    medida.pechoCm,
    medida.brazoCm,
    medida.piernaCm
  ].some((valor) => Number(valor) > 0);

  if (!tieneMedida && !medida.observacion) {
    errores.push("Registra al menos una medida o una observación.");
  }

  if (medida.energiaSemana < 1 || medida.energiaSemana > 5) {
    errores.push("La energía debe estar entre 1 y 5.");
  }

  if (medida.cumplimientoSemana < 0 || medida.cumplimientoSemana > 7) {
    errores.push("Los entrenamientos completados deben estar entre 0 y 7.");
  }

  return {
    ok: errores.length === 0,
    errores,
    advertencias
  };
}

export function numeroOpcional(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero = Number(String(valor).replace(",", "."));

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.round(numero * 10) / 10;
}

export function limitarNumero(valor, minimo, maximo, defecto) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return defecto;
  }

  return Math.min(maximo, Math.max(minimo, Math.round(numero)));
}

export function normalizarFecha(valor) {
  const texto = String(valor || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  return new Date().toISOString().slice(0, 10);
}
