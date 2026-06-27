/*
  Nombre completo: diario.mapper.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.mapper.js

  Función o funciones:
    - Convertir los datos del formulario avanzado en una sesión guardable.
    - Calcular totales reales desde ejercicios marcados.
    - Registrar ejercicios por repeticiones, por tiempo, mixtos o por distancia.
    - Mantener los cálculos separados de controller y view.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.service.js
*/

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function medicionEjercicio(ejercicio = {}) {
  const medicion = texto(ejercicio.medicion || ejercicio.tipoMedicion || ejercicio.unidadMedicion, "repeticiones");
  if (["repeticiones", "tiempo", "mixto", "distancia"].includes(medicion)) return medicion;
  if (Number(ejercicio.duracionMinutos || 0) > 0 || Number(ejercicio.duracionSegundos || 0) > 0) return "tiempo";
  if (Number(ejercicio.distanciaKm || 0) > 0) return "distancia";
  return "repeticiones";
}

export function crearDetalleBaseDesdeDia(dia = {}) {
  return (dia.ejercicios || []).map((ejercicio) => ({
    ejercicioId: ejercicio.id,
    nombre: ejercicio.nombre,
    medicion: medicionEjercicio(ejercicio),
    tipo: ejercicio.tipo || "otro",
    completado: false,
    seriesCompletadas: 0,
    repeticionesCompletadas: 0,
    tiempoCompletadoMinutos: 0,
    tiempoCompletadoSegundos: 0,
    distanciaCompletadaKm: null,
    alFallo: false,
    dificultad: "media",
    notas: ""
  }));
}

function mapearDetalleEjercicio(item = {}) {
  const medicion = medicionEjercicio(item);
  const tiempoCompletadoMinutos = Math.max(numero(item.tiempoCompletadoMinutos, 0), 0);
  const tiempoCompletadoSegundos = Math.max(numero(item.tiempoCompletadoSegundos, 0), 0);
  const distanciaCompletadaKm = item.distanciaCompletadaKm === null || item.distanciaCompletadaKm === ""
    ? null
    : Math.max(numero(item.distanciaCompletadaKm, 0), 0);

  return {
    ejercicioId: item.ejercicioId,
    nombre: item.nombre,
    medicion,
    tipo: item.tipo || "otro",
    completado: Boolean(item.completado),
    seriesCompletadas: Math.max(numero(item.seriesCompletadas, 0), 0),
    repeticionesCompletadas: Math.max(numero(item.repeticionesCompletadas, 0), 0),
    tiempoCompletadoMinutos,
    tiempoCompletadoSegundos,
    distanciaCompletadaKm,
    alFallo: Boolean(item.alFallo),
    dificultad: texto(item.dificultad, "media"),
    notas: texto(item.notas)
  };
}

function minutosTotalesDetalle(item = {}) {
  return Math.max(numero(item.tiempoCompletadoMinutos, 0), 0) + Math.max(numero(item.tiempoCompletadoSegundos, 0), 0) / 60;
}

export function mapearFormularioDiario(datos = {}, dia = {}) {
  const detalleEjercicios = (datos.detalleEjercicios || []).map(mapearDetalleEjercicio);
  const ejerciciosCompletados = detalleEjercicios.filter((item) => item.completado).length;
  const seriesCompletadas = detalleEjercicios.reduce((total, item) => total + Number(item.seriesCompletadas || 0), 0);
  const repeticionesCompletadas = detalleEjercicios.reduce((total, item) => total + Number(item.repeticionesCompletadas || 0), 0);
  const tiempoDesdeEjercicios = detalleEjercicios.reduce((total, item) => total + minutosTotalesDetalle(item), 0);
  const distanciaCompletadaKm = detalleEjercicios.reduce((total, item) => total + Number(item.distanciaCompletadaKm || 0), 0);
  const tiempoFormulario = Math.max(numero(datos.tiempoMinutos, 0), 0);

  return {
    ejerciciosCompletados,
    seriesCompletadas,
    repeticionesCompletadas,
    tiempoMinutos: Math.max(tiempoFormulario, Math.round(tiempoDesdeEjercicios * 100) / 100),
    distanciaCompletadaKm: Math.round(distanciaCompletadaKm * 100) / 100,
    dificultadGeneral: texto(datos.dificultadGeneral, "media"),
    molestias: texto(datos.molestias),
    notas: texto(datos.notas),
    detalleEjercicios: detalleEjercicios.length ? detalleEjercicios : crearDetalleBaseDesdeDia(dia)
  };
}

export function validarCierreSesion(datosSesion = {}) {
  const errores = [];

  if (datosSesion.ejerciciosCompletados < 1) {
    errores.push("Marca al menos un ejercicio completado antes de cerrar la sesión.");
  }

  if (datosSesion.tiempoMinutos < 1) {
    errores.push("Registra al menos 1 minuto de actividad o tiempo real en algún ejercicio.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}
