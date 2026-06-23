export function crearResumenHoyFitJeff(estado = {}) {
  const rutina = estado.rutina || {};
  const diaActual = Number(estado.diaSeleccionado || rutina.diaActual || 1);
  const dia = Array.isArray(rutina.dias)
    ? rutina.dias.find((item) => Number(item.numero) === diaActual) || rutina.dias[0]
    : null;

  const entrenamientos = Array.isArray(estado.entrenamientos) ? estado.entrenamientos : [];
  const pesos = Array.isArray(estado.pesos) ? estado.pesos : [];
  const medidas = Array.isArray(estado.medidas) ? estado.medidas : [];

  return {
    fecha: obtenerFechaISOAutomatica(),
    diaSugerido: {
      numero: dia?.numero || diaActual,
      nombre: dia?.nombre || "Rutina sugerida",
      resumen: dia?.objetivo || dia?.resumen || "Entrenamiento del dia"
    },
    ultimoEntrenamiento: entrenamientos[0] || null,
    pesoRegistradoHoy: tieneRegistroHoy(pesos, "fecha"),
    medidasRegistradasSemana: tieneRegistroSemanaActual(medidas, "fecha"),
    totalEntrenamientos: entrenamientos.length
  };
}

export function obtenerFechaISOAutomatica(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10);
}

function tieneRegistroHoy(lista = [], campoFecha = "fecha") {
  const hoy = obtenerFechaISOAutomatica();
  return lista.some((item) => String(item?.[campoFecha] || "").slice(0, 10) === hoy);
}

function tieneRegistroSemanaActual(lista = [], campoFecha = "fecha") {
  const ahora = new Date();
  const inicio = new Date(ahora);
  inicio.setDate(ahora.getDate() - ahora.getDay());
  inicio.setHours(0, 0, 0, 0);

  return lista.some((item) => {
    const fecha = new Date(item?.[campoFecha]);
    return !Number.isNaN(fecha.getTime()) && fecha >= inicio;
  });
}
