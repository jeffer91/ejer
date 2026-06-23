/*
  Nombre completo: dashboard.graficas.service.js
  Ruta o ubicación: src/dashboard/dashboard.graficas.service.js

  Función:
    - Crear gráficos minimalistas en SVG y barras visuales.
    - No depender de librerías externas.
    - Renderizar líneas, barras y tarjetas de tendencia.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

import { escapeDashboard, formatoNumero } from "./dashboard.format.service.js";

export function crearGraficaLineaDashboard({ datos = [], titulo = "", alto = 120, campoX = "fecha", campoY = "valor" }) {
  if (!Array.isArray(datos) || datos.length < 2) {
    return crearEstadoGraficoVacio(titulo);
  }

  const ancho = 520;
  const margen = 18;
  const valores = datos.map((item) => Number(item[campoY] || 0));
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;

  const puntos = datos.map((item, index) => {
    const x = margen + (index / Math.max(1, datos.length - 1)) * (ancho - margen * 2);
    const y = alto - margen - ((Number(item[campoY] || 0) - min) / rango) * (alto - margen * 2);

    return {
      x,
      y,
      label: item[campoX],
      valor: item[campoY]
    };
  });

  const polyline = puntos.map((punto) => `${redondear(punto.x)},${redondear(punto.y)}`).join(" ");

  return `
    <div class="dashboard-chart-card">
      ${titulo ? `<strong>${escapeDashboard(titulo)}</strong>` : ""}
      <svg viewBox="0 0 ${ancho} ${alto}" width="100%" height="${alto}" role="img" aria-label="${escapeDashboard(titulo || "Gráfico")}">
        <line x1="${margen}" y1="${alto - margen}" x2="${ancho - margen}" y2="${alto - margen}" class="dashboard-axis"></line>
        <polyline fill="none" class="dashboard-line" points="${polyline}"></polyline>
        ${puntos.map((punto) => `
          <circle cx="${punto.x}" cy="${punto.y}" r="4" class="dashboard-point">
            <title>${escapeDashboard(punto.label)}: ${escapeDashboard(punto.valor)}</title>
          </circle>
        `).join("")}
      </svg>
      <div class="dashboard-chart-foot">
        <span>${escapeDashboard(datos[0]?.[campoX] || "")}</span>
        <span>${escapeDashboard(datos[datos.length - 1]?.[campoX] || "")}</span>
      </div>
    </div>
  `;
}

export function crearGraficaBarrasDashboard({ datos = [], titulo = "", max = null }) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return crearEstadoGraficoVacio(titulo);
  }

  const valorMax = max || Math.max(...datos.map((item) => Number(item.valor || 0)), 1);

  return `
    <div class="dashboard-chart-card">
      ${titulo ? `<strong>${escapeDashboard(titulo)}</strong>` : ""}
      <div class="dashboard-bars">
        ${datos.map((item) => {
          const valor = Number(item.valor || 0);
          const porcentaje = Math.max(0, Math.min(100, Math.round((valor / valorMax) * 100)));

          return `
            <div class="dashboard-bar-row">
              <div class="dashboard-bar-label">
                <span>${escapeDashboard(item.label)}</span>
                <strong>${escapeDashboard(formatoNumero(valor, 0, "0"))}</strong>
              </div>
              <div class="dashboard-bar">
                <span style="width:${porcentaje}%"></span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function crearAnilloDashboard({ valor = 0, max = 100, titulo = "", detalle = "" }) {
  const limpio = Math.max(0, Math.min(Number(max) || 100, Number(valor) || 0));
  const porcentaje = Math.round((limpio / (Number(max) || 100)) * 100);
  const grados = Math.round((porcentaje / 100) * 360);

  return `
    <div class="dashboard-ring-card">
      <div class="dashboard-ring" style="--valor:${grados}deg;">
        <span>${porcentaje}%</span>
      </div>
      <div>
        <strong>${escapeDashboard(titulo)}</strong>
        ${detalle ? `<p class="muted">${escapeDashboard(detalle)}</p>` : ""}
      </div>
    </div>
  `;
}

export function crearEstadoGraficoVacio(titulo = "") {
  return `
    <div class="dashboard-empty-chart">
      ${titulo ? `<strong>${escapeDashboard(titulo)}</strong>` : ""}
      <p>Faltan datos para graficar.</p>
    </div>
  `;
}

function redondear(valor) {
  return Math.round(Number(valor) * 10) / 10;
}
