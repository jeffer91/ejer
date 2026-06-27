/*
  Nombre completo: diario.mapper.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.mapper.js

  Función o funciones:
    - Convertir los datos del formulario avanzado en una sesión guardable.
    - Calcular totales reales desde ejercicios marcados.
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

export function crearDetalleBaseDesdeDia(dia = {}) {
  return (dia.ejercicios || []).map((ejercicio) => ({
    ejercicioId: ejercicio.id,
    nombre: ejercicio.nombre,
    completado: false,
    seriesCompletadas: 0,
    repeticionesCompletadas: 0,
    dificultad: "media",
    notas: ""
  }));
}

export function mapearFormularioDiario(datos = {}, dia = {}) {
  const detalleEjercicios = (datos.detalleEjercicios || []).map((item) => ({
    ejercicioId: item.ejercicioId,
    nombre: item.nombre,
    completado: Boolean(item.completado),
    seriesCompletadas: Math.max(numero(item.seriesCompletadas, 0), 0),
    repeticionesCompletadas: Math.max(numero(item.repeticionesCompletadas, 0), 0),
    dificultad: texto(item.dificultad, "media"),
    notas: texto(item.notas)
  }));

  const ejerciciosCompletados = detalleEjercicios.filter((item) => item.completado).length;
  const seriesCompletadas = detalleEjercicios.reduce((total, item) => total + Number(item.seriesCompletadas || 0), 0);
  const repeticionesCompletadas = detalleEjercicios.reduce((total, item) => total + Number(item.repeticionesCompletadas || 0), 0);

  return {
    ejerciciosCompletados,
    seriesCompletadas,
    repeticionesCompletadas,
    tiempoMinutos: Math.max(numero(datos.tiempoMinutos, 0), 0),
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
    errores.push("Registra al menos 1 minuto de actividad.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}
