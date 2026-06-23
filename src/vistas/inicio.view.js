/*
  Nombre completo: inicio.view.js
  Ruta o ubicación: src/vistas/inicio.view.js

  Función:
    - Mostrar un inicio simple enfocado en qué hacer hoy.
    - Evitar saturar con reportes, diagnóstico o formularios largos.
*/

import { prepararDashboard } from "../dashboard/dashboard.service.js";
import { escapeDashboard, formatoMinutos } from "../dashboard/dashboard.format.service.js";
import { obtenerAccionesHoyFitJeff } from "../automatizacion/hoy-acciones.service.js";
import { obtenerPendientesHoyFitJeff } from "../automatizacion/hoy-pendientes.service.js";
import { crearAlerta, crearBotones, crearGridMetricas, crearTarjeta } from "./componentes.view.js";

export function renderInicioView(estado = {}) {
  const dashboard = prepararDashboard(estado);
  const cumplimiento = dashboard.estadisticas?.cumplimiento || {};
  const tiempo = dashboard.estadisticas?.tiempo || {};
  const pesoActual = estado.usuario?.perfil?.pesoActualKg || "Sin dato";
  const acciones = obtenerAccionesHoyFitJeff(estado);
  const pendientes = obtenerPendientesHoyFitJeff(estado);
  const pendientePrincipal = pendientes[0];

  return `
    <section class="card dashboard-hero">
      <div>
        <p class="pill">Inicio</p>
        <h1 class="dashboard-hero-title">Hola, ${escapeDashboard(dashboard.usuario)}</h1>
        <p class="dashboard-hero-subtitle">Hoy toca avanzar con una sola accion clara.</p>
        ${crearBotones(acciones.map((accion) => ({
          texto: accion.texto,
          nav: accion.nav,
          tipo: accion.tipo === "principal" ? "" : "secundario"
        })))}
      </div>

      <div class="dashboard-focus">
        ${crearAlerta({
          tipo: dashboard.enfoque?.tipo || "info",
          titulo: dashboard.enfoque?.titulo || "Accion recomendada",
          mensaje: dashboard.enfoque?.mensaje || "Revisa tu entrenamiento sugerido para hoy."
        })}
        <div>
          <p class="pill">Dia ${escapeDashboard(dashboard.diaSugerido?.numero || 1)}</p>
          <h2>${escapeDashboard(dashboard.diaSugerido?.nombre || "Rutina sugerida")}</h2>
          <p class="muted">${escapeDashboard(dashboard.diaSugerido?.resumen || "Entrenamiento del dia")}</p>
        </div>
      </div>
    </section>

    ${crearGridMetricas([
      {
        titulo: "Peso actual",
        valor: String(pesoActual).includes("kg") ? pesoActual : `${pesoActual} kg`,
        detalle: "Ultimo registro"
      },
      {
        titulo: "Constancia",
        valor: `${cumplimiento.porcentajeSemana || 0}%`,
        detalle: `${cumplimiento.entrenamientosUltimos7Dias || 0} entrenamientos en 7 dias`
      },
      {
        titulo: "Tiempo semanal",
        valor: formatoMinutos(tiempo.minutosUltimos7Dias || 0),
        detalle: "Minutos registrados"
      }
    ])}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: pendientePrincipal?.titulo || "Pendiente principal",
        contenido: `<p class="muted">${escapeDashboard(pendientePrincipal?.mensaje || "Todo se ve estable con los datos actuales.")}</p>`,
        footer: crearBotones([{ texto: pendientePrincipal ? "Resolver ahora" : "Registrar", nav: pendientePrincipal?.nav || "registrar" }])
      })}

      ${crearTarjeta({
        titulo: "Acceso rapido",
        contenido: `<p class="muted">Las funciones completas siguen disponibles, pero ahora estan agrupadas por proceso.</p>`,
        footer: crearBotones([
          { texto: "Entrenar", nav: "entrenar" },
          { texto: "Progreso", nav: "progreso", tipo: "secundario" }
        ])
      })}
    </section>
  `;
}

export function crearResumenInicioTexto(estado = {}) {
  const dashboard = prepararDashboard(estado);

  return [
    `Dia sugerido: ${dashboard.diaSugerido.numero} - ${dashboard.diaSugerido.nombre}`,
    `Constancia semanal: ${dashboard.estadisticas.cumplimiento?.porcentajeSemana || 0}%`,
    dashboard.ultimoEntrenamiento ? `Ultimo entrenamiento: Dia ${dashboard.ultimoEntrenamiento.diaRutina}` : "Sin entrenamientos registrados"
  ].join("\n");
}
