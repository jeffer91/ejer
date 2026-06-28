/*
  Nombre completo: estadisticas.presenter.js
  Ruta o ubicacion: src/features/control-corporal/estadisticas/estadisticas.presenter.js

  Funcion o funciones:
    - Preparar la informacion visual para la pantalla Progreso.
    - Separar la seleccion de tarjetas y textos de la vista HTML.
    - Reducir saturacion mostrando primero lo importante y luego el detalle.
    - Integrar análisis corporal inteligente sin etiquetar cuerpos por peso.
    - Explicar cuando una comparacion semanal o mensual aun no tiene datos suficientes.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.view.js
    - src/features/control-corporal/estadisticas/estadisticas.constants.js
    - src/features/control-corporal/analisis-corporal/analisis-corporal.presenter.js
*/

import { prepararAnalisisCorporalVista } from "../analisis-corporal/analisis-corporal.presenter.js";
import { ESTADISTICAS_LABELS, ESTADISTICAS_TEXTOS, ESTADISTICAS_TENDENCIAS } from "./estadisticas.constants.js";

function formatearKg(valor) {
  return valor === null || valor === undefined ? "Sin dato" : `${valor} kg`;
}

function formatearCm(valor) {
  return valor === null || valor === undefined ? "-" : `${valor} cm`;
}

function formatearCambio(valor) {
  if (valor === null || valor === undefined) return "Sin dato";
  if (valor > 0) return `+${valor} kg`;
  return `${valor} kg`;
}

function estadoTendencia(tendencia) {
  if (tendencia === ESTADISTICAS_TENDENCIAS.BAJANDO) return "success";
  if (tendencia === ESTADISTICAS_TENDENCIAS.SUBIENDO) return "info";
  if (tendencia === ESTADISTICAS_TENDENCIAS.ESTABLE) return "info";
  return "empty";
}

function estadoProximaMedicion(proximaMedicion) {
  if (!proximaMedicion) return "empty";
  return proximaMedicion.pendiente ? "pending" : "success";
}

function detalleComparacion(disponible, dias) {
  return disponible ? `Comparación de al menos ${dias} días` : `Faltan ${dias} días de datos`;
}

function crearResumenPrincipal(resumen) {
  const tienePeso = Boolean(resumen.pesoActualKg);
  const tieneObjetivo = Boolean(resumen.pesoObjetivoKg);

  return [
    {
      id: "peso-actual",
      titulo: ESTADISTICAS_LABELS.pesoActualKg,
      valor: formatearKg(resumen.pesoActualKg),
      detalle: tienePeso ? "Último registro guardado" : "Registra tu primer peso",
      estado: tienePeso ? "success" : "pending"
    },
    {
      id: "objetivo",
      titulo: ESTADISTICAS_LABELS.pesoObjetivoKg,
      valor: formatearKg(resumen.pesoObjetivoKg),
      detalle: tieneObjetivo ? `${resumen.progresoObjetivo || 0}% de avance` : "Agrega una meta",
      estado: tieneObjetivo ? "info" : "empty"
    },
    {
      id: "avance",
      titulo: ESTADISTICAS_LABELS.progresoObjetivo,
      valor: `${resumen.progresoObjetivo || 0}%`,
      detalle: resumen.faltanteObjetivoKg !== null && resumen.faltanteObjetivoKg !== undefined ? `Faltan ${resumen.faltanteObjetivoKg} kg` : "Meta pendiente",
      estado: resumen.progresoObjetivo >= 100 ? "success" : tieneObjetivo ? "info" : "empty"
    },
    {
      id: "tendencia",
      titulo: ESTADISTICAS_LABELS.tendencia,
      valor: resumen.tendencia || ESTADISTICAS_TENDENCIAS.INSUFICIENTE,
      detalle: resumen.cantidadPesos >= 3 ? "Últimos registros" : "Faltan datos",
      estado: estadoTendencia(resumen.tendencia)
    }
  ];
}

function crearDetallePeso(resumen) {
  return [
    {
      id: "peso-inicial",
      titulo: ESTADISTICAS_LABELS.pesoInicialKg,
      valor: formatearKg(resumen.pesoInicialKg),
      detalle: `${resumen.diasRegistro ?? 0} día(s) de seguimiento`,
      estado: resumen.pesoInicialKg ? "info" : "empty"
    },
    {
      id: "cambio-total",
      titulo: ESTADISTICAS_LABELS.cambioTotalKg,
      valor: formatearCambio(resumen.cambioTotalKg),
      detalle: "Desde el inicio",
      estado: resumen.cambioTotalKg === null || resumen.cambioTotalKg === undefined ? "empty" : "info"
    },
    {
      id: "cambio-semana",
      titulo: ESTADISTICAS_LABELS.cambioSemanaKg,
      valor: formatearCambio(resumen.cambioSemanaKg),
      detalle: detalleComparacion(resumen.comparacionSemanaDisponible, 7),
      estado: resumen.comparacionSemanaDisponible ? "info" : "empty"
    },
    {
      id: "cambio-mes",
      titulo: ESTADISTICAS_LABELS.cambioMesKg,
      valor: formatearCambio(resumen.cambioMesKg),
      detalle: detalleComparacion(resumen.comparacionMesDisponible, 30),
      estado: resumen.comparacionMesDisponible ? "info" : "empty"
    },
    {
      id: "imc",
      titulo: ESTADISTICAS_LABELS.imc,
      valor: resumen.imc?.valor ? String(resumen.imc.valor) : "Sin dato",
      detalle: resumen.imc?.categoria || "Faltan datos",
      estado: resumen.imc?.valor ? "info" : "empty"
    },
    {
      id: "proxima-medicion",
      titulo: ESTADISTICAS_LABELS.proximaMedicion,
      valor: resumen.proximaMedicion?.texto || "Sin dato",
      detalle: resumen.proximaMedicion?.pendiente ? "Actualiza medidas" : "Medidas vigentes",
      estado: estadoProximaMedicion(resumen.proximaMedicion)
    }
  ];
}

function crearMedidas(resumen) {
  const medidas = resumen.ultimasMedidas || {};
  const campos = ["cuelloCm", "cinturaCm", "abdomenCm", "pechoCm", "brazoCm", "piernaCm", "caderaCm"];

  return campos.map((campo) => ({
    id: campo,
    titulo: ESTADISTICAS_LABELS[campo] || campo,
    valor: formatearCm(medidas[campo]),
    estado: medidas[campo] ? "success" : "empty"
  }));
}

export function prepararVistaEstadisticas(resumen) {
  const tieneDatos = Number(resumen.cantidadPesos || 0) > 0 || Number(resumen.cantidadMedidas || 0) > 0;

  return {
    header: {
      kicker: "Control corporal",
      titulo: ESTADISTICAS_TEXTOS.TITULO,
      subtitulo: ESTADISTICAS_TEXTOS.SUBTITULO
    },
    hero: {
      titulo: tieneDatos ? "Tu progreso está organizado." : "Aún faltan datos para analizar.",
      descripcion: resumen.mensajeInteligente || ESTADISTICAS_TEXTOS.SIN_DATOS,
      estado: tieneDatos ? "info" : "pending"
    },
    analisisCorporal: prepararAnalisisCorporalVista(resumen.analisisCorporal),
    resumenPrincipal: crearResumenPrincipal(resumen),
    detallePeso: crearDetallePeso(resumen),
    progreso: {
      porcentaje: resumen.progresoObjetivo || 0,
      pesoInicialKg: formatearKg(resumen.pesoInicialKg),
      pesoActualKg: formatearKg(resumen.pesoActualKg),
      pesoObjetivoKg: formatearKg(resumen.pesoObjetivoKg),
      faltanteObjetivoKg: resumen.faltanteObjetivoKg === null || resumen.faltanteObjetivoKg === undefined ? "Meta pendiente" : `${resumen.faltanteObjetivoKg} kg`
    },
    medidas: crearMedidas(resumen),
    graficoPeso: resumen.graficoPeso || [],
    sinDatos: !tieneDatos
  };
}
