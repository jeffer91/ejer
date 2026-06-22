/*
  Nombre completo: recomendaciones.prompt.js
  Ruta o ubicación: src/recomendaciones/recomendaciones.prompt.js

  Función:
    - Construir el texto estructurado que se enviará a Gemini para generar recomendaciones.
    - Resumir datos importantes: perfil, peso, entrenamientos, rendimiento, fatiga y cumplimiento.
    - Limitar la respuesta esperada para que sea segura, clara y accionable.

  Se conecta con:
    - src/estadisticas/estadisticas.service.js
    - src/estadisticas/estadisticas.calculos.js
    - src/recomendaciones/recomendaciones.service.js cuando se cree.
    - functions/index.js cuando se conecte Gemini desde Firebase Functions.
*/

export function construirPromptRecomendaciones({
  perfil = {},
  estadisticas = {},
  entrenamientos = [],
  pesos = [],
  observacionUsuario = ""
}) {
  const datos = construirResumenParaIA({
    perfil,
    estadisticas,
    entrenamientos,
    pesos,
    observacionUsuario
  });

  return `
Actúa como un entrenador personal prudente y claro.
Analiza los datos de FitJeff y entrega recomendaciones prácticas.

Reglas importantes:
- No recomiendes dietas extremas.
- No recomiendes entrenar con dolor.
- No recomiendes aumentar intensidad si hay fatiga alta.
- Usa lenguaje directo y fácil de entender.
- Prioriza técnica, constancia, descanso y progreso gradual.
- Las recomendaciones nutricionales deben ser generales: proteína suficiente, agua, alimentos poco procesados, horarios y control de porciones.
- No des diagnóstico médico.

Datos del usuario:
${JSON.stringify(datos.perfil, null, 2)}

Resumen de peso:
${JSON.stringify(datos.peso, null, 2)}

Resumen de entrenamiento:
${JSON.stringify(datos.entrenamiento, null, 2)}

Fatiga y alertas:
${JSON.stringify(datos.fatiga, null, 2)}

Rendimiento por ejercicio:
${JSON.stringify(datos.rendimiento, null, 2)}

Últimos entrenamientos:
${JSON.stringify(datos.ultimosEntrenamientos, null, 2)}

Últimos pesos:
${JSON.stringify(datos.ultimosPesos, null, 2)}

Observación del usuario:
${datos.observacionUsuario || "Sin observación adicional."}

Responde en este formato:
1. Resumen corto de cómo voy.
2. Qué estoy haciendo bien.
3. Qué debo corregir en entrenamiento.
4. Qué debo ajustar en cardio o HIIT.
5. Qué debo cuidar en descanso y recuperación.
6. Recomendaciones generales de comida.
7. Acción concreta para los próximos 4 días.
8. Alertas si hay dolor, fatiga o caída de rendimiento.
`;
}

export function construirResumenParaIA({
  perfil = {},
  estadisticas = {},
  entrenamientos = [],
  pesos = [],
  observacionUsuario = ""
}) {
  return {
    perfil: {
      nombre: perfil.nombre || "Jeff",
      edad: perfil.edad || 35,
      alturaCm: perfil.alturaCm || 174,
      pesoInicialKg: perfil.pesoInicialKg || 91,
      pesoActualKg:
        estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || 91,
      objetivoPrincipal:
        perfil.objetivoPrincipal ||
        "Mejorar rendimiento, bajar grasa de forma segura y ganar constancia."
    },

    peso: {
      pesoInicialKg: estadisticas.peso?.pesoInicialKg || perfil.pesoInicialKg || 91,
      pesoActualKg: estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || 91,
      cambioKg: estadisticas.peso?.cambioKg || 0,
      tendencia: estadisticas.peso?.tendencia || "sin datos suficientes",
      registrosTotales: estadisticas.peso?.registrosTotales || pesos.length
    },

    entrenamiento: {
      entrenamientosTotales: estadisticas.entrenamientos?.total || entrenamientos.length,
      entrenamientosCompletados: estadisticas.entrenamientos?.completados || 0,
      minutosTotales: estadisticas.entrenamientos?.minutosTotales || 0,
      seriesTotales: estadisticas.entrenamientos?.seriesTotales || 0,
      fallosTecnicos: estadisticas.entrenamientos?.fallosTecnicos || 0,
      cardioMinutos: estadisticas.entrenamientos?.cardioMinutos || 0,
      hiitRondas: estadisticas.entrenamientos?.hiitRondas || 0,
      cumplimientoSemana: estadisticas.cumplimiento?.porcentajeSemana || 0,
      mensajeCumplimiento: estadisticas.cumplimiento?.mensaje || "Sin datos suficientes"
    },

    fatiga: {
      nivel: estadisticas.fatiga?.nivel || "sin datos suficientes",
      mensaje: estadisticas.fatiga?.mensaje || "Sin datos suficientes",
      energiaBajaUltimos6: estadisticas.fatiga?.energiaBajaUltimos6 || 0,
      dolorUltimos6: estadisticas.fatiga?.dolorUltimos6 || 0,
      incompletosUltimos6: estadisticas.fatiga?.incompletosUltimos6 || 0
    },

    rendimiento: resumirRendimiento(estadisticas.rendimiento || []),
    ultimosEntrenamientos: resumirUltimosEntrenamientos(entrenamientos, 6),
    ultimosPesos: resumirUltimosPesos(pesos, 6),
    observacionUsuario: limpiarTexto(observacionUsuario)
  };
}

export function crearPromptSinDatos() {
  return `
Actúa como entrenador prudente.
Todavía no hay suficientes datos de FitJeff.
Entrega una recomendación inicial para empezar una rutina de 4 días con bicicleta y ejercicios de peso corporal.
Reglas: prioriza técnica, constancia, calentamiento, descanso y registro de peso 2 a 3 veces por semana.
No recomiendes dietas extremas ni entrenar con dolor.
`;
}

function resumirRendimiento(rendimiento) {
  return rendimiento.slice(0, 12).map((item) => ({
    ejercicio: item.nombre,
    tipo: item.tipoRegistro,
    primero: item.primero,
    ultimo: item.ultimo,
    cambio: item.cambio,
    tendencia: item.tendencia
  }));
}

function resumirUltimosEntrenamientos(entrenamientos, cantidad) {
  return entrenamientos.slice(0, cantidad).map((item) => ({
    fecha: item.fecha,
    diaRutina: item.diaRutina,
    nombreDia: item.nombreDia,
    estado: item.estado,
    duracionMin: item.duracionMin,
    energiaInicial: item.energiaInicial,
    energiaFinal: item.energiaFinal,
    esfuerzoGeneral: item.esfuerzoGeneral,
    dolor: item.dolor,
    zonaDolor: item.zonaDolor,
    observacion: item.observacion,
    ejercicios: (item.ejercicios || []).map((ejercicio) => ({
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      series: ejercicio.series,
      minutosCompletados: ejercicio.minutosCompletados,
      rondasCompletadas: ejercicio.rondasCompletadas
    }))
  }));
}

function resumirUltimosPesos(pesos, cantidad) {
  return pesos.slice(0, cantidad).map((item) => ({
    fecha: item.fecha,
    pesoKg: item.pesoKg,
    momento: item.momento,
    observacion: item.observacion
  }));
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}
