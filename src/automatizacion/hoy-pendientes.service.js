import { crearResumenHoyFitJeff } from "./fitjeff-hoy.service.js";

export function obtenerPendientesHoyFitJeff(estado = {}) {
  const hoy = crearResumenHoyFitJeff(estado);
  const items = [];

  if (!hoy.pesoRegistradoHoy) {
    items.push({
      id: "peso",
      titulo: "Registrar peso",
      mensaje: "Aun no registras el peso de hoy.",
      nav: "registrar"
    });
  }

  if (!hoy.medidasRegistradasSemana) {
    items.push({
      id: "medidas",
      titulo: "Registrar medidas",
      mensaje: "Esta semana aun no tienes medidas registradas.",
      nav: "medidas"
    });
  }

  return items;
}
