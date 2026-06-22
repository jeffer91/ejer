/*
  Nombre completo: peso.service.js
  Ruta o ubicación: src/peso/peso.service.js

  Función:
    - Crear, validar y normalizar registros de peso.
    - Calcular tendencia de peso y variación frente al peso inicial.
    - Preparar los registros para guardado local y sincronización con Firebase.

  Se conecta con:
    - src/perfil/perfil.service.js
    - src/firebase/firestore.service.js
    - src/estadisticas/estadisticas.calculos.js
    - src/app.js cuando se separe la lógica de peso.
*/

import { guardarPesoFirestore, listarPesosFirestore } from "../firebase/firestore.service.js";

export function crearRegistroPeso({
  pesoKg,
  fecha = obtenerFechaISO(),
  momento = "mañana",
  observacion = ""
}) {
  const registro = {
    id: crearId("peso"),
    fecha,
    pesoKg: Number(pesoKg),
    momento,
    observacion: limpiarTexto(observacion),
    creadoEn: new Date().toISOString(),
    sincronizado: false
  };

  const validacion = validarRegistroPeso(registro);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores,
      registro: null
    };
  }

  return {
    ok: true,
    errores: [],
    registro
  };
}

export function validarRegistroPeso(registro) {
  const errores = [];

  if (!registro) {
    errores.push("El registro de peso está vacío.");
    return { ok: false, errores };
  }

  if (!registro.fecha) {
    errores.push("La fecha del peso es obligatoria.");
  }

  if (!Number.isFinite(Number(registro.pesoKg))) {
    errores.push("El peso debe ser numérico.");
  }

  if (Number(registro.pesoKg) < 30 || Number(registro.pesoKg) > 250) {
    errores.push("El peso debe estar en un rango válido.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}

export function ordenarPesosPorFecha(pesos = []) {
  return [...pesos].sort((a, b) => {
    const fechaA = new Date(a.fecha || a.creadoEn || 0).getTime();
    const fechaB = new Date(b.fecha || b.creadoEn || 0).getTime();
    return fechaA - fechaB;
  });
}

export function obtenerPesoActual(pesos = [], pesoDefecto = 91) {
  if (!Array.isArray(pesos) || pesos.length === 0) {
    return Number(pesoDefecto);
  }

  const ordenados = ordenarPesosPorFecha(pesos);
  const ultimo = ordenados[ordenados.length - 1];
  return Number(ultimo.pesoKg) || Number(pesoDefecto);
}

export function calcularCambioPeso({ pesos = [], pesoInicialKg = 91 }) {
  const actual = obtenerPesoActual(pesos, pesoInicialKg);
  const inicial = Number(pesoInicialKg) || actual;

  return {
    pesoInicialKg: inicial,
    pesoActualKg: actual,
    cambioKg: redondear(actual - inicial, 1),
    cambioAbsolutoKg: redondear(Math.abs(actual - inicial), 1)
  };
}

export function calcularTendenciaPeso(pesos = []) {
  const ordenados = ordenarPesosPorFecha(pesos);

  if (ordenados.length < 2) {
    return {
      tendencia: "sin datos suficientes",
      diferenciaKg: 0,
      mensaje: "Registra al menos dos pesos para calcular tendencia."
    };
  }

  const primero = ordenados[0];
  const ultimo = ordenados[ordenados.length - 1];
  const diferencia = redondear(Number(ultimo.pesoKg) - Number(primero.pesoKg), 1);

  if (Math.abs(diferencia) < 0.2) {
    return {
      tendencia: "estable",
      diferenciaKg: diferencia,
      mensaje: "Tu peso se mantiene estable en los registros disponibles."
    };
  }

  if (diferencia < 0) {
    return {
      tendencia: "bajando",
      diferenciaKg: diferencia,
      mensaje: "Tu peso muestra una tendencia descendente."
    };
  }

  return {
    tendencia: "subiendo",
    diferenciaKg: diferencia,
    mensaje: "Tu peso muestra una tendencia ascendente."
  };
}

export function obtenerPesosUltimosDias(pesos = [], dias = 30) {
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);

  return pesos.filter((peso) => {
    const fecha = new Date(`${peso.fecha || peso.creadoEn}T00:00:00`);
    return fecha >= limite;
  });
}

export function crearResumenPeso({ pesos = [], pesoInicialKg = 91 }) {
  const cambio = calcularCambioPeso({ pesos, pesoInicialKg });
  const tendencia = calcularTendenciaPeso(pesos);
  const ultimos30 = obtenerPesosUltimosDias(pesos, 30);

  return {
    ...cambio,
    tendencia: tendencia.tendencia,
    mensajeTendencia: tendencia.mensaje,
    registrosTotales: pesos.length,
    registrosUltimos30Dias: ultimos30.length,
    ultimaFecha: obtenerUltimaFechaPeso(pesos)
  };
}

export async function guardarPesoEnFirebase(registro) {
  const validacion = validarRegistroPeso(registro);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores
    };
  }

  const respuesta = await guardarPesoFirestore(registro);

  return {
    ok: true,
    firebase: respuesta,
    registro: {
      ...registro,
      sincronizado: true,
      idFirestore: respuesta.id,
      rutaFirestore: respuesta.ruta
    }
  };
}

export async function cargarPesosDesdeFirebase(cantidad = 100) {
  const pesos = await listarPesosFirestore(cantidad);
  return ordenarPesosPorFecha(
    pesos.map((peso) => ({
      ...peso,
      id: peso.id || peso.idFirestore,
      sincronizado: true
    }))
  );
}

function obtenerUltimaFechaPeso(pesos) {
  if (!Array.isArray(pesos) || pesos.length === 0) {
    return null;
  }

  const ordenados = ordenarPesosPorFecha(pesos);
  return ordenados[ordenados.length - 1].fecha || null;
}

function obtenerFechaISO() {
  return new Date().toISOString().slice(0, 10);
}

function crearId(prefijo) {
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function redondear(numero, decimales) {
  const factor = 10 ** decimales;
  return Math.round(numero * factor) / factor;
}
