/*
  Nombre completo: diagnostico.schema.js
  Ruta o ubicación: src/diagnostico/diagnostico.schema.js

  Función:
    - Definir estructura estándar de resultados de diagnóstico.
    - Centralizar niveles, áreas, estados y resumen.
    - Evitar que cada servicio cree resultados con formatos distintos.

  Se conecta con:
    - src/diagnostico/diagnostico.modulos.service.js
    - src/diagnostico/diagnostico.pwa.service.js
    - src/diagnostico/diagnostico.firebase.service.js
    - src/diagnostico/diagnostico.completo.service.js
    - src/vistas/diagnostico.view.js
*/

export const DIAGNOSTICO_NIVELES = Object.freeze({
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
  INFO: "info"
});

export const DIAGNOSTICO_AREAS = Object.freeze({
  ARRANQUE: "arranque",
  MODULOS: "modulos",
  DATOS: "datos",
  PWA: "pwa",
  FIREBASE: "firebase",
  NAVEGADOR: "navegador",
  RENDIMIENTO: "rendimiento"
});

export const DIAGNOSTICO_CONFIG = Object.freeze({
  version: "1.0.0",
  maxResultadosPorArea: 80,
  maxErroresVisibles: 20
});

export function crearResultadoDiagnostico({
  id,
  area = DIAGNOSTICO_AREAS.ARRANQUE,
  ok = true,
  nivel = null,
  titulo = "",
  mensaje = "",
  detalle = null,
  solucion = ""
}) {
  const nivelFinal = nivel || (ok ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.ERROR);

  return {
    id: String(id || `diag_${Date.now()}`),
    area,
    ok: Boolean(ok),
    nivel: nivelFinal,
    titulo: String(titulo || id || "Diagnóstico"),
    mensaje: String(mensaje || ""),
    detalle,
    solucion: String(solucion || ""),
    creadoEn: new Date().toISOString()
  };
}

export function crearDiagnosticoBase(resultados = []) {
  const normalizados = resultados.map(normalizarResultadoDiagnostico);
  const resumen = calcularResumenDiagnostico(normalizados);

  return {
    ok: resumen.errores === 0,
    resumen,
    resultados: normalizados,
    generadoEn: new Date().toISOString(),
    version: DIAGNOSTICO_CONFIG.version
  };
}

export function normalizarResultadoDiagnostico(resultado = {}) {
  return crearResultadoDiagnostico({
    id: resultado.id,
    area: resultado.area,
    ok: resultado.ok,
    nivel: resultado.nivel,
    titulo: resultado.titulo,
    mensaje: resultado.mensaje,
    detalle: resultado.detalle,
    solucion: resultado.solucion
  });
}

export function calcularResumenDiagnostico(resultados = []) {
  const total = resultados.length;
  const correctos = resultados.filter((item) => item.nivel === DIAGNOSTICO_NIVELES.OK).length;
  const advertencias = resultados.filter((item) => item.nivel === DIAGNOSTICO_NIVELES.WARNING).length;
  const errores = resultados.filter((item) => item.nivel === DIAGNOSTICO_NIVELES.ERROR).length;
  const informativos = resultados.filter((item) => item.nivel === DIAGNOSTICO_NIVELES.INFO).length;

  return {
    total,
    correctos,
    advertencias,
    errores,
    informativos,
    porcentajeOk: total ? Math.round((correctos / total) * 100) : 0
  };
}

export function agruparResultadosPorArea(resultados = []) {
  return resultados.reduce((grupo, item) => {
    const area = item.area || DIAGNOSTICO_AREAS.ARRANQUE;

    if (!grupo[area]) {
      grupo[area] = [];
    }

    grupo[area].push(item);
    return grupo;
  }, {});
}
