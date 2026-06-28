/*
  Nombre completo: hoy.rules.js
  Ruta o ubicacion: src/features/control-corporal/hoy/hoy.rules.js

  Funcion o funciones:
    - Convertir datos corporales en una lectura simple para la pantalla Hoy.
    - Decidir que accion mostrar primero segun lo que falte.
    - Preparar tarjetas compactas con estados visuales.
    - Evitar saturar al usuario con todos los numeros de estadisticas.

  Se conecta con:
    - src/features/control-corporal/hoy/hoy.service.js
    - src/features/control-corporal/hoy/hoy.constants.js
    - src/features/control-corporal/control-corporal.routes.js
*/

import { CONTROL_CORPORAL_ROUTES } from "../control-corporal.routes.js";
import { HOY_ESTADOS, HOY_LABELS, HOY_TEXTOS } from "./hoy.constants.js";

function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatearKg(valor) {
  return valor === null || valor === undefined ? "Sin dato" : `${valor} kg`;
}

function formatearFaltante(valor) {
  return valor === null || valor === undefined ? "Meta pendiente" : `Faltan ${valor} kg`;
}

function estaActivo(registro) {
  return registro && registro.estado !== "eliminado";
}

function tienePesoHoy(registros, fecha = fechaHoyISO()) {
  return registros.some((registro) => (
    estaActivo(registro)
    && registro.tipo === "peso"
    && registro.fecha === fecha
    && registro.datos?.pesoKg
  ));
}

function construirAccionPrincipal({ hayPesoActual, pesoRegistradoHoy, medidasPendientes }) {
  if (!hayPesoActual) {
    return {
      estado: HOY_ESTADOS.PENDING,
      titulo: HOY_TEXTOS.TITULO_INICIAL,
      descripcion: HOY_TEXTOS.SUBTITULO_INICIAL,
      boton: "Registrar peso",
      ruta: CONTROL_CORPORAL_ROUTES.REGISTRO
    };
  }

  if (!pesoRegistradoHoy) {
    return {
      estado: HOY_ESTADOS.PENDING,
      titulo: HOY_TEXTOS.TITULO_PESO,
      descripcion: HOY_TEXTOS.SUBTITULO_PESO,
      boton: "Registrar peso",
      ruta: CONTROL_CORPORAL_ROUTES.REGISTRO
    };
  }

  if (medidasPendientes) {
    return {
      estado: HOY_ESTADOS.PENDING,
      titulo: HOY_TEXTOS.TITULO_MEDIDAS,
      descripcion: HOY_TEXTOS.SUBTITULO_MEDIDAS,
      boton: "Registrar medidas",
      ruta: CONTROL_CORPORAL_ROUTES.REGISTRO
    };
  }

  return {
    estado: HOY_ESTADOS.SUCCESS,
    titulo: HOY_TEXTOS.TITULO_OK,
    descripcion: HOY_TEXTOS.SUBTITULO_OK,
    boton: "Ver progreso",
    ruta: CONTROL_CORPORAL_ROUTES.ESTADISTICAS
  };
}

function construirTarjetas({ estadisticas, pesoRegistradoHoy, medidasPendientes }) {
  const hayPesoActual = Boolean(estadisticas.pesoActualKg);
  const hayMedidas = Number(estadisticas.cantidadMedidas || 0) > 0;
  const hayMeta = Boolean(estadisticas.pesoObjetivoKg);

  return [
    {
      id: "peso",
      titulo: HOY_LABELS.PESO,
      estado: pesoRegistradoHoy ? HOY_ESTADOS.SUCCESS : HOY_ESTADOS.PENDING,
      estadoTexto: pesoRegistradoHoy ? "Al día" : "Pendiente",
      valor: formatearKg(estadisticas.pesoActualKg),
      detalle: hayPesoActual ? "Último peso registrado" : "Aún no hay peso guardado",
      boton: "Registrar",
      ruta: CONTROL_CORPORAL_ROUTES.REGISTRO
    },
    {
      id: "medidas",
      titulo: HOY_LABELS.MEDIDAS,
      estado: !hayMedidas ? HOY_ESTADOS.EMPTY : medidasPendientes ? HOY_ESTADOS.PENDING : HOY_ESTADOS.SUCCESS,
      estadoTexto: !hayMedidas ? "Sin datos" : medidasPendientes ? "Pendiente" : "Al día",
      valor: !hayMedidas ? "Sin registro" : medidasPendientes ? "Toca medir" : "Completas",
      detalle: !hayMedidas ? "Registra tus primeras medidas" : medidasPendientes ? "Actualiza tus medidas semanales" : "Medidas vigentes esta semana",
      boton: "Registrar",
      ruta: CONTROL_CORPORAL_ROUTES.REGISTRO
    },
    {
      id: "progreso",
      titulo: HOY_LABELS.PROGRESO,
      estado: hayMeta ? HOY_ESTADOS.INFO : HOY_ESTADOS.EMPTY,
      estadoTexto: hayMeta ? "Meta activa" : "Sin meta",
      valor: hayMeta ? `${estadisticas.progresoObjetivo || 0}%` : "Pendiente",
      detalle: hayMeta ? formatearFaltante(estadisticas.faltanteObjetivoKg) : "Agrega una meta para ver avance",
      boton: "Ver detalle",
      ruta: CONTROL_CORPORAL_ROUTES.ESTADISTICAS
    },
    {
      id: "tendencia",
      titulo: HOY_LABELS.TENDENCIA,
      estado: estadisticas.cantidadPesos >= 3 ? HOY_ESTADOS.INFO : HOY_ESTADOS.EMPTY,
      estadoTexto: estadisticas.cantidadPesos >= 3 ? "Disponible" : "Faltan datos",
      valor: estadisticas.tendencia || "Sin tendencia",
      detalle: estadisticas.cantidadPesos >= 3 ? "Basada en tus últimos registros" : "Registra más pesos para calcularla",
      boton: "Ver detalle",
      ruta: CONTROL_CORPORAL_ROUTES.ESTADISTICAS
    }
  ];
}

export function construirResumenHoy({ estado, estadisticas }) {
  const registros = estado.registros || [];
  const pesoRegistradoHoy = tienePesoHoy(registros);
  const medidasPendientes = Boolean(estadisticas.proximaMedicion?.pendiente);
  const hayPesoActual = Boolean(estadisticas.pesoActualKg);
  const accionPrincipal = construirAccionPrincipal({ hayPesoActual, pesoRegistradoHoy, medidasPendientes });

  return {
    fecha: fechaHoyISO(),
    accionPrincipal,
    tarjetas: construirTarjetas({ estadisticas, pesoRegistradoHoy, medidasPendientes }),
    graficoPeso: (estadisticas.graficoPeso || []).slice(-7),
    estadisticas
  };
}
