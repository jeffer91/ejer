/*
  Nombre completo: entrenamiento.service.js
  Ruta o ubicación: src/entrenamiento/entrenamiento.service.js

  Función:
    - Crear, validar y normalizar entrenamientos realizados.
    - Calcular volumen simple por ejercicio, cumplimiento y alertas básicas de técnica.
    - Preparar los entrenamientos para guardado local y sincronización con Firebase.

  Se conecta con:
    - src/data/rutina-base.js
    - src/firebase/firestore.service.js
    - src/estadisticas/estadisticas.calculos.js
    - src/recomendaciones/recomendaciones.prompt.js
    - src/app.js cuando se separe la lógica de entrenamiento.
*/

import { RUTINA_BASE, obtenerDiaPorNumero, TIPOS_EJERCICIO } from "../data/rutina-base.js";
import {
  guardarEntrenamientoFirestore,
  listarEntrenamientosFirestore
} from "../firebase/firestore.service.js";

export function crearEntrenamientoVacio(numeroDia = 1, fecha = obtenerFechaISO()) {
  const dia = obtenerDiaPorNumero(numeroDia);

  return {
    id: crearId("entrenamiento"),
    fecha,
    diaRutina: dia.numero,
    nombreDia: dia.nombre,
    estado: "completado",
    duracionMin: dia.duracionEstimadaMin,
    energiaInicial: "media",
    energiaFinal: "media",
    esfuerzoGeneral: "alto",
    dolor: false,
    zonaDolor: "",
    ejercicios: dia.ejercicios.map(crearEjercicioVacio),
    observacion: "",
    creadoEn: new Date().toISOString(),
    sincronizado: false
  };
}

export function crearEjercicioVacio(ejercicio) {
  if (
    ejercicio.tipoRegistro === TIPOS_EJERCICIO.REPETICIONES ||
    ejercicio.tipoRegistro === TIPOS_EJERCICIO.TIEMPO
  ) {
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      unidad: ejercicio.unidad,
      series: Array.from({ length: ejercicio.seriesObjetivo }, (_, index) => ({
        numero: index + 1,
        valor: 0,
        unidad: ejercicio.unidad,
        falloTecnico: false
      }))
    };
  }

  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.CARDIO) {
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      minutosObjetivo: ejercicio.minutosObjetivo,
      minutosCompletados: 0,
      intensidadReal: "media",
      seDetuvo: false
    };
  }

  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.HIIT) {
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      rondasObjetivo: ejercicio.rondasObjetivo,
      rondasCompletadas: 0,
      intensidadReal: "alta",
      seDetuvo: false
    };
  }

  return {
    id: ejercicio.id,
    nombre: ejercicio.nombre,
    tipoRegistro: ejercicio.tipoRegistro
  };
}

export function normalizarEntrenamiento(entrenamiento = {}) {
  const dia = obtenerDiaPorNumero(entrenamiento.diaRutina || 1);
  const base = crearEntrenamientoVacio(dia.numero, entrenamiento.fecha || obtenerFechaISO());

  return {
    ...base,
    ...entrenamiento,
    diaRutina: Number(entrenamiento.diaRutina || base.diaRutina),
    duracionMin: Number(entrenamiento.duracionMin || base.duracionMin),
    dolor: Boolean(entrenamiento.dolor),
    zonaDolor: limpiarTexto(entrenamiento.zonaDolor),
    observacion: limpiarTexto(entrenamiento.observacion),
    ejercicios: Array.isArray(entrenamiento.ejercicios)
      ? entrenamiento.ejercicios.map(normalizarEjercicioRealizado)
      : base.ejercicios
  };
}

export function normalizarEjercicioRealizado(ejercicio = {}) {
  const normalizado = {
    ...ejercicio,
    id: ejercicio.id || crearId("ejercicio"),
    nombre: limpiarTexto(ejercicio.nombre || "Ejercicio"),
    tipoRegistro: ejercicio.tipoRegistro || TIPOS_EJERCICIO.REPETICIONES
  };

  if (Array.isArray(normalizado.series)) {
    normalizado.series = normalizado.series.map((serie, index) => ({
      numero: Number(serie.numero || index + 1),
      valor: Number(serie.valor || 0),
      unidad: serie.unidad || normalizado.unidad || "repeticiones",
      falloTecnico: Boolean(serie.falloTecnico)
    }));
  }

  if (normalizado.tipoRegistro === TIPOS_EJERCICIO.CARDIO) {
    normalizado.minutosCompletados = Number(normalizado.minutosCompletados || 0);
    normalizado.minutosObjetivo = Number(normalizado.minutosObjetivo || 0);
    normalizado.seDetuvo = Boolean(normalizado.seDetuvo);
  }

  if (normalizado.tipoRegistro === TIPOS_EJERCICIO.HIIT) {
    normalizado.rondasCompletadas = Number(normalizado.rondasCompletadas || 0);
    normalizado.rondasObjetivo = Number(normalizado.rondasObjetivo || 0);
    normalizado.seDetuvo = Boolean(normalizado.seDetuvo);
  }

  return normalizado;
}

export function validarEntrenamiento(entrenamiento) {
  const errores = [];

  if (!entrenamiento) {
    errores.push("El entrenamiento está vacío.");
    return { ok: false, errores };
  }

  if (!entrenamiento.fecha) {
    errores.push("La fecha del entrenamiento es obligatoria.");
  }

  if (!entrenamiento.diaRutina || entrenamiento.diaRutina < 1 || entrenamiento.diaRutina > 4) {
    errores.push("El día de rutina debe estar entre 1 y 4.");
  }

  if (!Array.isArray(entrenamiento.ejercicios) || entrenamiento.ejercicios.length === 0) {
    errores.push("El entrenamiento debe tener ejercicios registrados.");
  }

  if (Number(entrenamiento.duracionMin) <= 0) {
    errores.push("La duración debe ser mayor a cero.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}

export function calcularResumenEntrenamiento(entrenamiento) {
  const normalizado = normalizarEntrenamiento(entrenamiento);
  let seriesTotales = 0;
  let valorTotal = 0;
  let fallosTecnicos = 0;
  let cardioMinutos = 0;
  let hiitRondas = 0;

  for (const ejercicio of normalizado.ejercicios) {
    if (Array.isArray(ejercicio.series)) {
      seriesTotales += ejercicio.series.length;
      valorTotal += ejercicio.series.reduce((total, serie) => total + Number(serie.valor || 0), 0);
      fallosTecnicos += ejercicio.series.filter((serie) => serie.falloTecnico).length;
    }

    if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.CARDIO) {
      cardioMinutos += Number(ejercicio.minutosCompletados || 0);
    }

    if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.HIIT) {
      hiitRondas += Number(ejercicio.rondasCompletadas || 0);
    }
  }

  return {
    id: normalizado.id,
    fecha: normalizado.fecha,
    diaRutina: normalizado.diaRutina,
    nombreDia: normalizado.nombreDia,
    estado: normalizado.estado,
    duracionMin: normalizado.duracionMin,
    seriesTotales,
    valorTotal,
    fallosTecnicos,
    cardioMinutos,
    hiitRondas,
    dolor: normalizado.dolor,
    energiaFinal: normalizado.energiaFinal,
    esfuerzoGeneral: normalizado.esfuerzoGeneral
  };
}

export function calcularSiguienteDiaRutina(ultimoDia) {
  const numero = Number(ultimoDia || 0);

  if (!numero || numero >= RUTINA_BASE.dias.length) {
    return 1;
  }

  return numero + 1;
}

export function obtenerEntrenamientosUltimosDias(entrenamientos = [], dias = 7) {
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);

  return entrenamientos.filter((entrenamiento) => {
    const fecha = new Date(`${entrenamiento.fecha || entrenamiento.creadoEn}T00:00:00`);
    return fecha >= limite;
  });
}

export function detectarAlertasEntrenamiento(entrenamiento) {
  const alertas = [];
  const normalizado = normalizarEntrenamiento(entrenamiento);

  if (normalizado.dolor) {
    alertas.push({
      tipo: "dolor",
      nivel: "alto",
      mensaje: "Se registró dolor o molestia. Conviene reducir intensidad y cuidar técnica."
    });
  }

  if (normalizado.energiaFinal === "baja") {
    alertas.push({
      tipo: "fatiga",
      nivel: "medio",
      mensaje: "Terminaste con energía baja. Si se repite, considera descanso activo."
    });
  }

  const resumen = calcularResumenEntrenamiento(normalizado);

  if (resumen.fallosTecnicos >= resumen.seriesTotales && resumen.seriesTotales > 0) {
    alertas.push({
      tipo: "fallo-excesivo",
      nivel: "medio",
      mensaje: "Todas las series llegaron al fallo técnico. Úsalo con control para evitar sobrecarga."
    });
  }

  return alertas;
}

export async function guardarEntrenamientoEnFirebase(entrenamiento) {
  const normalizado = normalizarEntrenamiento(entrenamiento);
  const validacion = validarEntrenamiento(normalizado);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores
    };
  }

  const respuesta = await guardarEntrenamientoFirestore(normalizado);

  return {
    ok: true,
    firebase: respuesta,
    entrenamiento: {
      ...normalizado,
      sincronizado: true,
      idFirestore: respuesta.id,
      rutaFirestore: respuesta.ruta
    }
  };
}

export async function cargarEntrenamientosDesdeFirebase(cantidad = 100) {
  const entrenamientos = await listarEntrenamientosFirestore(cantidad);
  return entrenamientos
    .map((entrenamiento) => ({
      ...normalizarEntrenamiento(entrenamiento),
      id: entrenamiento.id || entrenamiento.idFirestore,
      sincronizado: true
    }))
    .sort((a, b) => new Date(b.fecha || b.creadoEn) - new Date(a.fecha || a.creadoEn));
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
