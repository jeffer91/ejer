/*
  Nombre completo: dashboard.alertas.service.js
  Ruta o ubicación: src/dashboard/dashboard.alertas.service.js

  Función:
    - Crear alertas minimalistas para el dashboard.
    - Priorizar mensajes útiles: constancia, energía, rutina y datos pendientes.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

import { DASHBOARD_LIMITES } from "./dashboard.constantes.js";

export function crearAlertasDashboard(dashboard) {
  const alertas = [];
  const cumplimiento = Number(dashboard.estadisticas?.cumplimiento?.porcentajeSemana || 0);
  const energia = Number(dashboard.estadisticas?.energia?.promedioFinal || 0);
  const fatiga = dashboard.estadisticas?.fatiga?.nivel || "sin datos";

  if (!dashboard.entrenamientos.length) {
    alertas.push({
      tipo: "info",
      titulo: "Empieza con un registro",
      mensaje: "Registra tu primer entrenamiento para activar el seguimiento visual."
    });
  }

  if (cumplimiento >= DASHBOARD_LIMITES.cumplimientoBueno) {
    alertas.push({
      tipo: "ok",
      titulo: "Buena constancia",
      mensaje: "La semana va con buen ritmo. Mantén sesiones realistas y bien registradas."
    });
  }

  if (cumplimiento > 0 && cumplimiento < DASHBOARD_LIMITES.cumplimientoBueno) {
    alertas.push({
      tipo: "warning",
      titulo: "Constancia en progreso",
      mensaje: "Todavía puedes completar más sesiones esta semana."
    });
  }

  if (energia > 0 && energia <= DASHBOARD_LIMITES.energiaBaja) {
    alertas.push({
      tipo: "warning",
      titulo: "Energía baja",
      mensaje: "Conviene priorizar control, pausas y recuperación."
    });
  }

  if (fatiga === "alto") {
    alertas.push({
      tipo: "danger",
      titulo: "Fatiga alta",
      mensaje: dashboard.estadisticas?.fatiga?.mensaje || "Revisa la carga antes de seguir."
    });
  }

  if (!dashboard.medidas.length) {
    alertas.push({
      tipo: "info",
      titulo: "Medidas pendientes",
      mensaje: "Registra medidas semanales para ver gráficos más claros."
    });
  }

  return alertas.slice(0, 4);
}

export function crearClaseAlertaDashboard(tipo) {
  if (tipo === "ok") return "ok";
  if (tipo === "danger") return "danger";
  if (tipo === "warning") return "warning";
  return "";
}
