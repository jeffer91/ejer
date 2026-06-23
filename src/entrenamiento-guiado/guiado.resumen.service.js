/*
  Nombre completo: guiado.resumen.service.js
  Ruta o ubicación: src/entrenamiento-guiado/guiado.resumen.service.js

  Función:
    - Crear resumen automático al terminar un entrenamiento guiado.
    - Calcular pasos completados, duración y observaciones.
    - Preparar datos para guardado local o futura sincronización.

  Se conecta con:
    - src/entrenamiento-guiado/guiado.service.js
    - src/entrenamiento-guiado/guiado.estado.js
    - src/vistas/entrenamiento-guiado.view.js
*/

export function crearResumenEntrenamientoGuiado({ estado, sesion, motivo = "completado" } = {}) {
  const pasosCompletados = Array.isArray(estado?.pasosCompletados) ? estado.pasosCompletados : [];
  const notas = Array.isArray(estado?.notas) ? estado.notas : [];
  const totalCalentamiento = Array.isArray(sesion?.calentamiento) ? sesion.calentamiento.length : 0;
  const totalSeries = calcularTotalSeries(sesion);
  const totalPasosEsperados = totalCalentamiento + totalSeries;
  const completados = pasosCompletados.length;
  const porcentaje = totalPasosEsperados > 0
    ? Math.round((completados / totalPasosEsperados) * 100)
    : 0;

  const iniciadoEn = estado?.iniciadoEn || sesion?.creadoEn || new Date().toISOString();
  const finalizadoEn = new Date().toISOString();

  return {
    id: `resumen_guiado_${Date.now()}`,
    motivo,
    diaRutina: sesion?.diaRutina || estado?.diaRutina || null,
    nombreDia: sesion?.nombreDia || estado?.nombreDia || "Entrenamiento",
    iniciadoEn,
    finalizadoEn,
    duracionMin: calcularDuracionMin(iniciadoEn, finalizadoEn),
    pasosCompletados: completados,
    pasosEsperados: totalPasosEsperados,
    porcentajeCompletado: limitarPorcentaje(porcentaje),
    calentamientosEsperados: totalCalentamiento,
    seriesEsperadas: totalSeries,
    notas,
    mensaje: crearMensajeResumen({
      motivo,
      porcentaje,
      nombreDia: sesion?.nombreDia || estado?.nombreDia || "Entrenamiento"
    }),
    creadoEn: finalizadoEn
  };
}

export function crearResumenVisualGuiado(resumen) {
  if (!resumen) {
    return {
      titulo: "Sin resumen",
      descripcion: "Todavía no hay un entrenamiento finalizado.",
      metricas: []
    };
  }

  return {
    titulo: resumen.nombreDia || "Entrenamiento",
    descripcion: resumen.mensaje || "Entrenamiento finalizado.",
    metricas: [
      {
        label: "Duración",
        valor: `${resumen.duracionMin || 0} min`
      },
      {
        label: "Completado",
        valor: `${resumen.porcentajeCompletado || 0}%`
      },
      {
        label: "Pasos",
        valor: `${resumen.pasosCompletados || 0}/${resumen.pasosEsperados || 0}`
      },
      {
        label: "Notas",
        valor: `${resumen.notas?.length || 0}`
      }
    ]
  };
}

function calcularTotalSeries(sesion) {
  const ejercicios = Array.isArray(sesion?.ejercicios) ? sesion.ejercicios : [];

  return ejercicios.reduce((total, ejercicio) => {
    return total + Number(ejercicio.seriesObjetivo || 1);
  }, 0);
}

function calcularDuracionMin(inicioISO, finISO) {
  try {
    const inicio = new Date(inicioISO).getTime();
    const fin = new Date(finISO).getTime();

    if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
      return 0;
    }

    return Math.max(1, Math.round((fin - inicio) / 60000));
  } catch (_) {
    return 0;
  }
}

function limitarPorcentaje(valor) {
  return Math.max(0, Math.min(100, Number(valor || 0)));
}

function crearMensajeResumen({ motivo, porcentaje, nombreDia }) {
  if (motivo === "cancelado") {
    return `${nombreDia} fue terminado antes de completar todos los pasos.`;
  }

  if (porcentaje >= 90) {
    return `${nombreDia} completado con muy buena constancia.`;
  }

  if (porcentaje >= 60) {
    return `${nombreDia} completado parcialmente. Buen avance.`;
  }

  return `${nombreDia} registrado como sesión corta.`;
}
