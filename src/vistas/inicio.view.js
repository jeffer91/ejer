/*
  Nombre completo: inicio.view.js
  Ruta o ubicación: src/vistas/inicio.view.js

  Función:
    - Renderizar un inicio tipo dashboard minimalista.
    - Mostrar enfoque del día, métricas clave, gráficos rápidos y acciones principales.
    - Reducir números sueltos y priorizar lectura visual.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/dashboard/dashboard.graficas.service.js
    - src/dashboard/dashboard.alertas.service.js
    - src/dashboard/dashboard.estilos.service.js
    - src/vistas/componentes.view.js
*/

import { prepararDashboard } from "../dashboard/dashboard.service.js";
import { crearAlertasDashboard, crearClaseAlertaDashboard } from "../dashboard/dashboard.alertas.service.js";
import { crearAnilloDashboard, crearGraficaLineaDashboard, crearGraficaBarrasDashboard } from "../dashboard/dashboard.graficas.service.js";
import { crearEstilosDashboard } from "../dashboard/dashboard.estilos.service.js";
import { escapeDashboard, formatoFechaCorta, formatoMinutos, limitarTextoDashboard } from "../dashboard/dashboard.format.service.js";
import { crearAlerta, crearBotones, crearTarjeta } from "./componentes.view.js";

export function renderInicioView(estado = {}) {
  const dashboard = prepararDashboard(estado);
  const alertas = crearAlertasDashboard(dashboard);

  return `
    ${crearEstilosDashboard()}

    <section class="card dashboard-hero">
      <div>
        <p class="pill">Inicio</p>
        <h1 class="dashboard-hero-title">Hola, ${escapeDashboard(dashboard.usuario)}</h1>
        <p class="dashboard-hero-subtitle">
          Un resumen simple para decidir qué hacer hoy: entrenar, revisar rutina, registrar medidas o mirar el avance.
        </p>
        ${crearBotones([
          { texto: "Entrenar hoy", nav: "entrenar" },
          { texto: "Entrenamiento guiado", nav: "guiado", tipo: "secundario" },
          { texto: "Medidas", nav: "medidas", tipo: "secundario" }
        ])}
      </div>

      <div class="dashboard-focus">
        ${crearAlerta({
          tipo: dashboard.enfoque.tipo,
          titulo: dashboard.enfoque.titulo,
          mensaje: dashboard.enfoque.mensaje
        })}
        <div>
          <p class="pill">Día ${escapeDashboard(dashboard.diaSugerido.numero)}</p>
          <h2>${escapeDashboard(dashboard.diaSugerido.nombre)}</h2>
          <p class="muted">${escapeDashboard(dashboard.diaSugerido.resumen)}</p>
        </div>
      </div>
    </section>

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
          valor: dashboard.estadisticas.cumplimiento?.porcentajeSemana || 0,
          max: 100,
          titulo: "Cumplimiento",
          detalle: `${dashboard.estadisticas.cumplimiento?.entrenamientosUltimos7Dias || 0} entrenamientos en 7 días`
        })
      })}

      ${crearTarjeta({
        titulo: "Peso / medidas",
        contenido: crearGraficaLineaDashboard({
          datos: dashboard.series.peso,
          titulo: "Tendencia reciente"
        })
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Minutos por día",
        contenido: crearGraficaBarrasDashboard({
          datos: dashboard.series.minutos,
          titulo: "Distribución"
        })
      })}

      ${crearTarjeta({
        titulo: "Alertas útiles",
        contenido: alertas.map((alerta) => `
          <div class="alerta ${crearClaseAlertaDashboard(alerta.tipo)}" style="margin-bottom:10px;">
            <strong>${escapeDashboard(alerta.titulo)}</strong>
            <p>${escapeDashboard(alerta.mensaje)}</p>
          </div>
        `).join("") || crearAlerta({
          tipo: "ok",
          mensaje: "Todo se ve estable con los datos actuales."
        })
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Último entrenamiento",
        contenido: crearUltimoEntrenamiento(dashboard.ultimoEntrenamiento)
      })}

      ${crearTarjeta({
        titulo: "Acciones rápidas",
        contenido: crearBotones(dashboard.acciones.map((accion) => ({
          texto: accion.texto,
          nav: accion.nav,
          tipo: accion.tipo === "principal" ? "" : "secundario"
        })))
      })}
    </section>
  `;
}

function crearUltimoEntrenamiento(entrenamiento) {
  if (!entrenamiento) {
    return `<p class="muted">Todavía no hay entrenamientos registrados.</p>`;
  }

  return `
    <article class="alerta">
      <strong>Día ${escapeDashboard(entrenamiento.diaRutina)} · ${escapeDashboard(entrenamiento.nombreDia || "Entrenamiento")}</strong>
      <p class="muted">
        ${escapeDashboard(formatoFechaCorta(entrenamiento.fecha))} · ${escapeDashboard(entrenamiento.estado || "sin estado")} · ${escapeDashboard(formatoMinutos(entrenamiento.duracionMin || 0))}
      </p>
      ${entrenamiento.observacion ? `<p>${escapeDashboard(limitarTextoDashboard(entrenamiento.observacion, 120))}</p>` : ""}
    </article>
  `;
}

export function crearResumenInicioTexto(estado = {}) {
  const dashboard = prepararDashboard(estado);

  return [
    `Día sugerido: ${dashboard.diaSugerido.numero} - ${dashboard.diaSugerido.nombre}`,
    `Constancia semanal: ${dashboard.estadisticas.cumplimiento?.porcentajeSemana || 0}%`,
    dashboard.ultimoEntrenamiento ? `Último entrenamiento: Día ${dashboard.ultimoEntrenamiento.diaRutina}` : "Sin entrenamientos registrados",
    `Fatiga: ${dashboard.estadisticas.fatiga?.nivel || "sin datos"}`
  ].join("\n");
}
