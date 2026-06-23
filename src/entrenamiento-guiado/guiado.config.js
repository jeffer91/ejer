/*
  Nombre completo: guiado.config.js
  Ruta o ubicación: src/entrenamiento-guiado/guiado.config.js

  Función:
    - Definir configuración base del entrenamiento guiado visual.
    - Centralizar fases, acciones, textos y tiempos.
    - Servir como base para Jarvis y para control manual.

  Se conecta con:
    - src/entrenamiento-guiado/guiado.estado.js
    - src/entrenamiento-guiado/guiado.timer.service.js
    - src/entrenamiento-guiado/guiado.service.js
    - src/vistas/entrenamiento-guiado.view.js
*/

export const GUIADO_FASES = Object.freeze({
  INICIO: "inicio",
  CALENTAMIENTO: "calentamiento",
  EJERCICIO: "ejercicio",
  DESCANSO: "descanso",
  NOTAS: "notas",
  RESUMEN: "resumen",
  FINALIZADO: "finalizado"
});

export const GUIADO_ACCIONES = Object.freeze({
  INICIAR: "iniciar",
  HECHO: "hecho",
  REPETIR: "repetir",
  PAUSAR: "pausar",
  CONTINUAR: "continuar",
  SIGUIENTE: "siguiente",
  TERMINAR: "terminar",
  GUARDAR_NOTA: "guardar_nota",
  GUARDAR_RESUMEN: "guardar_resumen"
});

export const GUIADO_CONFIG = Object.freeze({
  descansoDefectoSeg: 90,
  descansoCortoSeg: 60,
  cuentaRegresivaInicialSeg: 5,
  maxMensajes: 30,
  guardarAutomaticamente: true,
  mostrarGraficosMini: true,
  textos: {
    inicio: "Entrenamiento guiado listo.",
    calentamiento: "Primero completa el calentamiento.",
    ejercicio: "Completa el ejercicio con control.",
    descanso: "Descanso activo. Respira y prepárate para continuar.",
    pausa: "Sesión pausada.",
    continuar: "Sesión reanudada.",
    finalizado: "Entrenamiento finalizado."
  }
});

export function crearPasoGuiado(tipo, datos = {}) {
  return {
    id: datos.id || `paso_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    tipo,
    titulo: datos.titulo || "",
    descripcion: datos.descripcion || "",
    duracionSeg: Number(datos.duracionSeg || 0),
    ejercicioId: datos.ejercicioId || null,
    serie: datos.serie || null,
    totalSeries: datos.totalSeries || null,
    creadoEn: new Date().toISOString()
  };
}
