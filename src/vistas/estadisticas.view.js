/*
  Nombre completo: estadisticas.view.js
  Ruta o ubicación: src/vistas/estadisticas.view.js

  Función:
    - Renderizar estadísticas con tablero visual mejorado.
    - Mostrar constancia, minutos, peso/medidas, energía, fatiga y rendimiento.
    - Mantener gráficos simples sin librerías externas.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/dashboard/dashboard.graficas.service.js
    - src/dashboard/dashboard.alertas.service.js
    - src/vistas/componentes.view.js
*/

import { prepararDashboard } from "../dashboard/dashboard.service.js";
import { crearAlertasDashboard, crearClaseAlertaDashboard } from "../dashboard/dashboard.alertas.service.js";
import { crearAnilloDashboard, crearGraficaBarrasDashboard, crearGraficaLineaDashboard } from "../dashboard/dashboard.graficas.service.js";
import { crearEstilosDashboard } from "../dashboard/dashboard.estilos.service.js";
import { escapeDashboard, formatoFechaCorta, formatoMinutos } from "../dashboard/dashboard.format.service.js";
import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";
import {
  crearBotones,
  crearEncabezadoVista,
  crearTablaSimple,
  crearTarjeta
} from "./componentes.view.js";

export function renderEstadisticasView(estado = {}) {
  const dashboard = prepararDashboard(estado);
  const estadisticas = generarResumenEstadistico(estado);
  const alertas = crearAlertasDashboard(dashboard);

  return `
    ${crearEstilosDashboard()}

    ${crearEncabezadoVista({
      titulo: "Estadísticas",
      subtitulo: "Tablero visual para revisar constancia, carga, energía y progreso sin complicarlo.",
      pill: "Dashboard"
    })}

    <section class="dashboard-card-grid section-space">
      ${dashboard.tarjetas.map((tarjeta) => `
        <article class="dashboard-metric-card" data-estado="${escapeDashboard(tarjeta.estado)}">
          <span>${escapeDashboard(tarjeta.titulo)}</span>
          <strong>${escapeDashboard(tarjeta.valor)}</strong>
          <small class="muted">${escapeDashboard(tarjeta.detalle)}</small>
        </article>
      `).join("")}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Constancia semanal",
        contenido: crearAnilloDashboard({
          valor: estadisticas.cumplimiento?.porcentajeSemana || 0,
          max: 100,
          titulo: "Cumplimiento",
          detalle: `${estadisticas.cumplimiento?.entrenamientosUltimos7Dias || 0} entrenamientos en 7 días`
        })
      })}

      ${crearTarjeta({
        titulo: "Evolución peso / medidas",
        contenido: crearGraficaLineaDashboard({
          datos: dashboard.series.peso,
          titulo: "Últimos registros"
        })
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Minutos por día de rutina",
        contenido: crearGraficaBarrasDashboard({
          datos: dashboard.series.minutos,
          titulo: "Minutos acumulados"
        })
      })}

      ${crearTarjeta({
        titulo: "Cumplimiento por semana",
        contenido: crearGraficaBarrasDashboard({
          datos: dashboard.series.cumplimiento,
          titulo: "Porcentaje semanal",
          max: 100
        })
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Energía semanal",
        contenido: crearGraficaLineaDashboard({
          datos: dashboard.series.energia,
          titulo: "Energía registrada"
        })
      })}

      ${crearTarjeta({
        titulo: "Alertas",
        contenido: alertas.map((alerta) => `
          <div class="alerta ${crearClaseAlertaDashboard(alerta.tipo)}" style="margin-bottom:10px;">
            <strong>${escapeDashboard(alerta.titulo)}</strong>
            <p>${escapeDashboard(alerta.mensaje)}</p>
          </div>
        `).join("") || `<p class="muted">Sin alertas importantes.</p>`
      })}
    </section>

    <section class="card section-space">
      <h2>Rendimiento por ejercicio</h2>
      ${crearTablaSimple({
        columnas: [
          { titulo: "Ejercicio", campo: "nombre" },
          { titulo: "Primero", campo: "primero" },
          { titulo: "Último", campo: "ultimo" },
          { titulo: "Cambio", campo: "cambio" },
          { titulo: "Tendencia", campo: "tendencia" }
        ],
        filas: estadisticas.rendimiento || [],
        vacio: "Todavía no hay suficientes entrenamientos para comparar ejercicios."
      })}
    </section>

    <section class="card section-space">
      <h2>Entrenamientos recientes</h2>
      ${crearTablaSimple({
        columnas: [
          { titulo: "Fecha", campo: (fila) => formatoFechaCorta(fila.fecha) },
          { titulo: "Día", campo: (fila) => `Día ${fila.diaRutina}` },
          { titulo: "Duración", campo: (fila) => formatoMinutos(fila.duracionMin || 0) },
          { titulo: "Estado", campo: "estado" },
          { titulo: "Energía final", campo: "energiaFinal" }
        ],
        filas: [...(estado.entrenamientos || [])].slice(0, 10),
        vacio: "Todavía no hay entrenamientos registrados."
      })}

      <div class="section-space">
        ${crearBotones([
          { texto: "Registrar entrenamiento", nav: "entrenar" },
          { texto: "Ver medidas", nav: "medidas", tipo: "secundario" },
          { texto: "Guardar estadísticas en Firebase", action: "guardar-estadisticas", tipo: "secundario" }
        ])}
      </div>
    </section>
  `;
}
