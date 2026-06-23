import { prepararDashboard } from "../dashboard/dashboard.service.js";
import { escapeDashboard, formatoMinutos } from "../dashboard/dashboard.format.service.js";
import { crearBotones, crearEncabezadoVista, crearGridMetricas, crearTarjeta } from "./componentes.view.js";

export function renderProgresoView(estado = {}) {
  const dashboard = prepararDashboard(estado);
  const cumplimiento = dashboard.estadisticas?.cumplimiento || {};
  const pesoActual = estado.usuario?.perfil?.pesoActualKg || dashboard.tarjetas?.find((item) => item.titulo === "Peso actual")?.valor || "Sin dato";

  return `
    ${crearEncabezadoVista({
      titulo: "Progreso",
      subtitulo: "Resumen simple de avance, estadisticas, reportes y recomendaciones.",
      pill: "Avance"
    })}

    ${crearGridMetricas([
      {
        titulo: "Peso actual",
        valor: `${escapeDashboard(pesoActual)}${String(pesoActual).includes("kg") ? "" : " kg"}`,
        detalle: "Ultimo dato guardado"
      },
      {
        titulo: "Constancia",
        valor: `${cumplimiento.porcentajeSemana || 0}%`,
        detalle: `${cumplimiento.entrenamientosUltimos7Dias || 0} entrenamientos en 7 dias`
      },
      {
        titulo: "Tiempo semanal",
        valor: formatoMinutos(dashboard.estadisticas?.tiempo?.minutosUltimos7Dias || 0),
        detalle: "Minutos acumulados"
      }
    ])}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Resumen",
        contenido: `
          <p><strong>Dia sugerido:</strong> Dia ${escapeDashboard(dashboard.diaSugerido?.numero || 1)} · ${escapeDashboard(dashboard.diaSugerido?.nombre || "Rutina")}</p>
          <p class="muted">${escapeDashboard(dashboard.enfoque?.mensaje || "Sigue registrando para mejorar la lectura del progreso.")}</p>
        `,
        footer: crearBotones([
          { texto: "Entrenar", nav: "entrenar" },
          { texto: "Registrar", nav: "registrar", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Ver mas detalle",
        contenido: `<p class="muted">Las pantallas completas siguen disponibles, pero ya no saturan el menu diario.</p>`,
        footer: crearBotones([
          { texto: "Estadisticas", nav: "estadisticas" },
          { texto: "Reportes", nav: "reportes", tipo: "secundario" },
          { texto: "Recomendaciones", nav: "recomendaciones", tipo: "secundario" }
        ])
      })}
    </section>
  `;
}
