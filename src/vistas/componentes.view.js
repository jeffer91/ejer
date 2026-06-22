/*
  Nombre completo: componentes.view.js
  Ruta o ubicación: src/vistas/componentes.view.js

  Función:
    - Centralizar componentes HTML reutilizables para las vistas de FitJeff.
    - Crear tarjetas, métricas, alertas, barras de progreso, mini gráficas SVG y listados.
    - Evitar repetir estructuras visuales en Inicio, Entrenar, Peso, Estadísticas, Recomendaciones y Ajustes.

  Se conecta con:
    - src/vistas/inicio.view.js
    - src/vistas/entrenar.view.js
    - src/vistas/peso.view.js
    - src/vistas/estadisticas.view.js
    - src/vistas/recomendaciones.view.js
    - src/vistas/ajustes.view.js
    - src/ui/helpers.js
*/

import { escaparHTML, formatearFecha, limitarTexto, redondear } from "../ui/helpers.js";

export function crearEncabezadoVista({ titulo, subtitulo = "", pill = "" }) {
  return `
    <section class="card">
      ${pill ? `<p class="pill">${escaparHTML(pill)}</p>` : ""}
      <h1>${escaparHTML(titulo)}</h1>
      ${subtitulo ? `<p class="muted">${escaparHTML(subtitulo)}</p>` : ""}
    </section>
  `;
}

export function crearTarjeta({ titulo = "", contenido = "", clase = "", footer = "" }) {
  return `
    <article class="card ${escaparHTML(clase)}">
      ${titulo ? `<h2>${escaparHTML(titulo)}</h2>` : ""}
      ${contenido}
      ${footer ? `<div class="section-space">${footer}</div>` : ""}
    </article>
  `;
}

export function crearMetrica({ titulo, valor, detalle = "", estado = "" }) {
  return `
    <article class="card metric" ${estado ? `data-estado="${escaparHTML(estado)}"` : ""}>
      <span class="muted">${escaparHTML(titulo)}</span>
      <strong>${escaparHTML(valor)}</strong>
      ${detalle ? `<small class="muted">${escaparHTML(detalle)}</small>` : ""}
    </article>
  `;
}

export function crearGridMetricas(metricas = [], columnas = 3) {
  const clase = columnas === 2 ? "grid-2" : "grid-3";

  if (!metricas.length) {
    return "";
  }

  return `
    <section class="grid ${clase} section-space">
      ${metricas.map(crearMetrica).join("")}
    </section>
  `;
}

export function crearAlerta({ mensaje, tipo = "info", titulo = "" }) {
  const claseTipo = tipo === "ok" ? "ok" : tipo === "danger" || tipo === "error" ? "danger" : tipo === "warning" ? "warning" : "";

  return `
    <div class="alerta ${claseTipo}">
      ${titulo ? `<strong>${escaparHTML(titulo)}</strong>` : ""}
      <p>${escaparHTML(mensaje)}</p>
    </div>
  `;
}

export function crearBotones(acciones = []) {
  if (!acciones.length) {
    return "";
  }

  return `
    <div class="acciones">
      ${acciones
        .map(
          (accion) => `
            <button
              class="btn ${accion.tipo === "secundario" ? "secundario" : accion.tipo === "peligro" ? "peligro" : ""}"
              type="button"
              ${accion.nav ? `data-nav="${escaparHTML(accion.nav)}"` : ""}
              ${accion.action ? `data-action="${escaparHTML(accion.action)}"` : ""}
            >
              ${escaparHTML(accion.texto)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

export function crearBarraProgreso({ valor = 0, max = 100, etiqueta = "" }) {
  const porcentaje = max > 0 ? Math.max(0, Math.min(100, Math.round((Number(valor) / Number(max)) * 100))) : 0;

  return `
    <div class="stack">
      ${etiqueta ? `<small class="muted">${escaparHTML(etiqueta)} · ${porcentaje}%</small>` : ""}
      <div class="barra" role="progressbar" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
        <span style="width: ${porcentaje}%;"></span>
      </div>
    </div>
  `;
}

export function crearListaSimple(items = [], vacio = "Sin datos todavía.") {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p class="muted">${escaparHTML(vacio)}</p>`;
  }

  return `
    <div class="stack">
      ${items
        .map(
          (item) => `
            <article class="alerta">
              ${typeof item === "string" ? escaparHTML(item) : crearContenidoItem(item)}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

export function crearTablaSimple({ columnas = [], filas = [], vacio = "Sin datos." }) {
  if (!filas.length) {
    return `<p class="muted">${escaparHTML(vacio)}</p>`;
  }

  return `
    <div style="overflow-x:auto;">
      <table class="tabla-simple">
        <thead>
          <tr>
            ${columnas.map((columna) => `<th>${escaparHTML(columna.titulo)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${filas
            .map(
              (fila) => `
                <tr>
                  ${columnas
                    .map((columna) => `<td>${escaparHTML(obtenerValorCelda(fila, columna.campo))}</td>`)
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function crearMiniGraficaLinea({ datos = [], campoX = "fecha", campoY = "valor", alto = 130 }) {
  if (!Array.isArray(datos) || datos.length < 2) {
    return crearAlerta({
      tipo: "warning",
      mensaje: "Faltan datos para mostrar una gráfica. Registra al menos dos valores."
    });
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
    return { x, y, label: item[campoX], valor: item[campoY] };
  });

  const polyline = puntos.map((punto) => `${redondear(punto.x, 1)},${redondear(punto.y, 1)}`).join(" ");

  return `
    <div class="fit-chart" role="img" aria-label="Gráfica de línea">
      <svg viewBox="0 0 ${ancho} ${alto}" width="100%" height="${alto}">
        <line x1="${margen}" y1="${alto - margen}" x2="${ancho - margen}" y2="${alto - margen}" stroke="#e5e7eb" stroke-width="2" />
        <line x1="${margen}" y1="${margen}" x2="${margen}" y2="${alto - margen}" stroke="#e5e7eb" stroke-width="2" />
        <polyline fill="none" stroke="currentColor" stroke-width="3" points="${polyline}" />
        ${puntos
          .map(
            (punto) => `
              <circle cx="${punto.x}" cy="${punto.y}" r="4" fill="currentColor">
                <title>${escaparHTML(punto.label)}: ${escaparHTML(punto.valor)}</title>
              </circle>
            `
          )
          .join("")}
      </svg>
    </div>
  `;
}

export function crearGraficaBarras({ datos = [], campoLabel = "label", campoValor = "valor", max = null }) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return `<p class="muted">Sin datos para graficar.</p>`;
  }

  const valorMax = max || Math.max(...datos.map((item) => Number(item[campoValor] || 0)), 1);

  return `
    <div class="stack">
      ${datos
        .map((item) => {
          const valor = Number(item[campoValor] || 0);
          return `
            <div>
              <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:6px;">
                <small><strong>${escaparHTML(item[campoLabel])}</strong></small>
                <small class="muted">${escaparHTML(valor)}</small>
              </div>
              ${crearBarraProgreso({ valor, max: valorMax })}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

export function crearResumenEntrenamientoCard(entrenamiento) {
  if (!entrenamiento) {
    return `<p class="muted">Todavía no hay entrenamientos.</p>`;
  }

  return `
    <article class="alerta">
      <strong>Día ${escaparHTML(entrenamiento.diaRutina)} · ${escaparHTML(entrenamiento.nombreDia || "Entrenamiento")}</strong>
      <p class="muted">
        ${formatearFecha(entrenamiento.fecha)} · ${escaparHTML(entrenamiento.estado || "sin estado")} · ${escaparHTML(entrenamiento.duracionMin || 0)} min
      </p>
      <p>
        Energía final: ${escaparHTML(entrenamiento.energiaFinal || "sin dato")}
        · Esfuerzo: ${escaparHTML(entrenamiento.esfuerzoGeneral || "sin dato")}
      </p>
      ${entrenamiento.dolor ? `<p><strong>Molestia:</strong> ${escaparHTML(entrenamiento.zonaDolor || "No especificada")}</p>` : ""}
      ${entrenamiento.observacion ? `<p>${escaparHTML(limitarTexto(entrenamiento.observacion, 160))}</p>` : ""}
    </article>
  `;
}

export function crearEstadoVacio({ titulo = "Sin datos", mensaje = "Registra información para ver resultados." }) {
  return `
    <section class="card center" style="min-height: 220px;">
      <div>
        <h2>${escaparHTML(titulo)}</h2>
        <p class="muted">${escaparHTML(mensaje)}</p>
      </div>
    </section>
  `;
}

function crearContenidoItem(item) {
  const titulo = item.titulo || item.nombre || item.fecha || "Registro";
  const mensaje = item.mensaje || item.detalle || item.observacion || "";
  const accion = item.accion || "";

  return `
    <strong>${escaparHTML(titulo)}</strong>
    ${mensaje ? `<p>${escaparHTML(mensaje)}</p>` : ""}
    ${accion ? `<small class="muted">Acción: ${escaparHTML(accion)}</small>` : ""}
  `;
}

function obtenerValorCelda(fila, campo) {
  if (typeof campo === "function") {
    return campo(fila);
  }

  return fila[campo] ?? "";
}
