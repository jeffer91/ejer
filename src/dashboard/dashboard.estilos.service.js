/*
  Nombre completo: dashboard.estilos.service.js
  Ruta o ubicación: src/dashboard/dashboard.estilos.service.js

  Función:
    - Inyectar estilos mínimos del dashboard sin depender de modificar CSS global.
    - Dar soporte visual a tarjetas, anillos, gráficos y barras.

  Se conecta con:
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

export function crearEstilosDashboard() {
  return `
    <style id="dashboard-inline-styles">
      .dashboard-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
        gap: 16px;
        align-items: stretch;
      }

      .dashboard-hero-title {
        font-size: clamp(2rem, 6vw, 4rem);
        line-height: 0.96;
        letter-spacing: -0.06em;
        margin: 0;
      }

      .dashboard-hero-subtitle {
        max-width: 680px;
        color: var(--fit-muted);
        font-size: 1.02rem;
      }

      .dashboard-focus {
        display: grid;
        gap: 10px;
        align-content: center;
      }

      .dashboard-card-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .dashboard-metric-card {
        border: 1px solid var(--fit-line);
        border-radius: 18px;
        padding: 14px;
        background: #ffffff;
        display: grid;
        gap: 8px;
      }

      .dashboard-metric-card span {
        color: var(--fit-muted);
        font-size: 0.86rem;
        font-weight: 650;
      }

      .dashboard-metric-card strong {
        font-size: clamp(1.45rem, 4vw, 2.2rem);
        line-height: 1;
      }

      .dashboard-metric-card[data-estado="ok"] {
        background: var(--fit-ok-soft);
      }

      .dashboard-metric-card[data-estado="warning"] {
        background: var(--fit-warning-soft);
      }

      .dashboard-chart-card,
      .dashboard-empty-chart,
      .dashboard-ring-card {
        border: 1px solid var(--fit-line);
        border-radius: 18px;
        padding: 14px;
        background: #ffffff;
      }

      .dashboard-chart-card {
        display: grid;
        gap: 10px;
      }

      .dashboard-axis {
        stroke: #e5e7eb;
        stroke-width: 2;
      }

      .dashboard-line {
        stroke: var(--fit-primary);
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .dashboard-point {
        fill: var(--fit-primary);
      }

      .dashboard-chart-foot,
      .dashboard-bar-label {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: var(--fit-muted);
        font-size: 0.84rem;
      }

      .dashboard-bars {
        display: grid;
        gap: 12px;
      }

      .dashboard-bar-row {
        display: grid;
        gap: 6px;
      }

      .dashboard-bar {
        width: 100%;
        height: 12px;
        border-radius: 999px;
        background: #e5e7eb;
        overflow: hidden;
      }

      .dashboard-bar span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--fit-primary);
      }

      .dashboard-ring-card {
        display: flex;
        gap: 14px;
        align-items: center;
      }

      .dashboard-ring {
        width: 86px;
        height: 86px;
        flex: 0 0 auto;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: conic-gradient(var(--fit-primary) var(--valor), #e5e7eb 0deg);
        position: relative;
      }

      .dashboard-ring::after {
        content: "";
        position: absolute;
        inset: 10px;
        border-radius: inherit;
        background: #ffffff;
      }

      .dashboard-ring span {
        position: relative;
        z-index: 1;
        font-weight: 900;
      }

      .dashboard-empty-chart {
        color: var(--fit-muted);
        min-height: 120px;
        display: grid;
        align-content: center;
      }

      @media (max-width: 900px) {
        .dashboard-hero {
          grid-template-columns: 1fr;
        }

        .dashboard-card-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .dashboard-card-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
