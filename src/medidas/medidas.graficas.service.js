/*
  Nombre completo: medidas.graficas.service.js
  Ruta o ubicación: src/medidas/medidas.graficas.service.js

  Función:
    - Crear series simples para gráficos.
    - Crear mini gráficos SVG sin librerías externas.
    - Crear barra visual de constancia semanal.

  Se conecta con:
    - src/vistas/medidas.view.js
*/

export function crearSerieMedidas(historial = [], campo) {
  return historial
    .slice()
    .reverse()
    .filter((item) => item[campo] !== null && item[campo] !== undefined && item[campo] !== "")
    .map((item) => ({
      fecha: item.fecha,
      valor: Number(item[campo])
    }))
    .filter((item) => Number.isFinite(item.valor));
}

export function crearMiniGraficaSVG(historial = [], campo, etiqueta = "Gráfico") {
  const serie = crearSerieMedidas(historial, campo).slice(-10);

  if (serie.length < 2) {
    return `
      <div class="mini-grafica-vacia">
        <span>${escapeHTML(etiqueta)}</span>
        <p>Se necesitan al menos 2 registros.</p>
      </div>
    `;
  }

  const valores = serie.map((item) => item.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;

  const puntos = serie.map((item, index) => {
    const x = (index / (serie.length - 1)) * 100;
    const y = 90 - ((item.valor - min) / rango) * 70;
    return `${x},${y}`;
  }).join(" ");

  const primero = serie[0];
  const ultimo = serie[serie.length - 1];

  return `
    <div class="mini-grafica">
      <div class="mini-grafica-head">
        <span>${escapeHTML(etiqueta)}</span>
        <strong>${formatoNumero(ultimo.valor)}</strong>
      </div>
      <svg viewBox="0 0 100 100" role="img" aria-label="${escapeHTML(etiqueta)}">
        <polyline points="${puntos}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
      <small>${escapeHTML(primero.fecha)} → ${escapeHTML(ultimo.fecha)}</small>
    </div>
  `;
}

export function crearBarraCumplimiento(valor = 0, total = 7) {
  const limpio = Math.max(0, Math.min(total, Number(valor) || 0));
  const porcentaje = Math.round((limpio / total) * 100);

  return `
    <div class="barra-cumplimiento">
      <div class="barra">
        <span style="width:${porcentaje}%"></span>
      </div>
      <small>${limpio}/${total} entrenamientos completados</small>
    </div>
  `;
}

function formatoNumero(valor) {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
    return "-";
  }

  return String(Math.round(Number(valor) * 10) / 10);
}

function escapeHTML(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
