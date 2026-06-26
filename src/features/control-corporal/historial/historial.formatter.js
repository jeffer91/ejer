/*
  Nombre completo: historial.formatter.js
  Ruta o ubicación: src/features/control-corporal/historial/historial.formatter.js

  Función o funciones:
    - Convertir registros internos en textos simples para la pantalla Historial.
    - Formatear peso, medidas, fechas y cambios sin mostrar datos técnicos.
    - Mantener la vista limpia y sin lógica de formato pesada.

  Se conecta con:
    - src/features/control-corporal/historial/historial.service.js
    - src/features/control-corporal/historial/historial.view.js
    - src/features/control-corporal/historial/historial.constants.js
*/

import { HISTORIAL_LABELS } from "./historial.constants.js";

function formatearNumero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero.toFixed(1).replace(".0", "") : "-";
}

export function formatearPeso(valor) {
  return `${formatearNumero(valor)} kg`;
}

export function formatearMedida(valor) {
  return `${formatearNumero(valor)} cm`;
}

export function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return fecha;
}

export function formatearResumenRegistro(registro) {
  if (!registro) {
    return "Registro no encontrado.";
  }

  if (registro.tipo === "peso") {
    return `Peso: ${formatearPeso(registro.datos?.pesoKg)}`;
  }

  const partes = Object.entries(HISTORIAL_LABELS)
    .filter(([campo]) => campo !== "pesoKg" && registro.datos?.[campo] !== undefined && registro.datos?.[campo] !== null)
    .map(([campo, label]) => `${label}: ${formatearMedida(registro.datos[campo])}`);

  return partes.length ? partes.join(" · ") : "Medidas sin datos visibles.";
}

export function formatearTituloRegistro(registro) {
  if (!registro) {
    return "Registro";
  }

  return registro.tipo === "peso" ? "Peso" : "Medidas corporales";
}

export function formatearCambio(cambio) {
  if (!cambio) {
    return "Cambio no disponible.";
  }

  const fecha = cambio.creadoEn ? cambio.creadoEn.slice(0, 16).replace("T", " ") : "Sin fecha";

  if (cambio.accion === "editar") {
    return `${fecha}: Registro editado.`;
  }

  if (cambio.accion === "enviar-a-papelera") {
    return `${fecha}: Registro enviado a papelera.`;
  }

  return `${fecha}: Cambio guardado.`;
}
