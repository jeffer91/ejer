/*
  Nombre completo: recomendaciones.view.js
  Ruta o ubicación: src/vistas/recomendaciones.view.js

  Función:
    - Renderizar la pantalla de recomendaciones de FitJeff.
    - Mostrar recomendaciones locales, historial y preparación para Gemini.
    - Permitir escribir una observación para que la IA analice mejor el contexto.

  Se conecta con:
    - src/recomendaciones/recomendaciones.service.js
    - src/vistas/componentes.view.js
    - src/ui/helpers.js
    - src/app.js cuando se actualice el flujo final.
*/

import {
  generarRecomendacionesLocales,
  obtenerUltimaRecomendacion,
  prepararSolicitudGemini
} from "../recomendaciones/recomendaciones.service.js";
import { escaparHTML, formatearFechaHora, limitarTexto } from "../ui/helpers.js";
import {
  crearAlerta,
  crearBotones,
  crearEncabezadoVista,
  crearListaSimple,
  crearTarjeta
} from "./componentes.view.js";

export function renderRecomendacionesView(estado = {}) {
  const recomendacionesLocales = generarRecomendacionesLocales(estado);
  const ultima = obtenerUltimaRecomendacion(estado.recomendaciones || []);
  const solicitud = prepararSolicitudGemini(estado, "");

  return `
    ${crearEncabezadoVista({
      titulo: "Recomendaciones",
      subtitulo: "Analiza cómo vas y qué ajustar en entrenamiento, descanso, cardio y comida general.",
      pill: "Análisis inteligente"
    })}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Generar análisis",
        contenido: `
          <form id="form-recomendacion" data-form="recomendacion">
            <div class="campo">
              <label for="observacion-recomendacion">Observación para analizar</label>
              <textarea id="observacion-recomendacion" name="observacionUsuario" placeholder="Ejemplo: esta semana me sentí cansado, el HIIT me costó, subí de peso, me dolió la muñeca..."></textarea>
              <small>Esto se manda junto con tus datos importantes cuando conectemos Gemini.</small>
            </div>
          </form>
          ${crearBotones([
            { texto: "Guardar recomendación local", action: "generar-recomendacion-local" },
            { texto: "Preparar Gemini", action: "preparar-gemini", tipo: "secundario" },
            { texto: "Sincronizar", action: "sincronizar-ahora", tipo: "secundario" }
          ])}
        `
      })}

      ${crearTarjeta({
        titulo: "Estado Gemini",
        contenido: `
          ${crearAlerta({
            tipo: solicitud.modo === "con-datos" ? "ok" : "warning",
            titulo: solicitud.modo === "con-datos" ? "Datos listos" : "Faltan datos",
            mensaje: solicitud.modo === "con-datos"
              ? "Ya hay datos suficientes para construir una solicitud de análisis para Gemini."
              : "Todavía puedes usar recomendaciones iniciales, pero Gemini funcionará mejor con entrenamientos registrados."
          })}
          <p class="muted section-space">La clave privada de Gemini no va en el navegador. Se usará Firebase Functions.</p>
        `
      })}
    </section>

    <section class="card section-space">
      <h2>Recomendaciones locales de hoy</h2>
      <div class="grid grid-2">
        ${recomendacionesLocales.map(crearCardRecomendacion).join("")}
      </div>
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Última recomendación guardada",
        contenido: ultima ? crearUltimaRecomendacion(ultima) : crearAlerta({ tipo: "warning", mensaje: "Todavía no hay recomendaciones guardadas." })
      })}

      ${crearTarjeta({
        titulo: "Qué datos se analizan",
        contenido: crearListaSimple([
          "Peso inicial, peso actual y tendencia.",
          "Entrenamientos completados, parciales e incompletos.",
          "Repeticiones, segundos, minutos y rondas registradas.",
          "Energía inicial/final, dolor, esfuerzo y observaciones.",
          "Cumplimiento semanal y señales de fatiga."
        ])
      })}
    </section>
  `;
}

function crearCardRecomendacion(rec) {
  const tipo = rec.prioridad === "alta" ? "danger" : rec.prioridad === "media" ? "warning" : "info";

  return `
    <article class="alerta ${tipo === "danger" ? "danger" : tipo === "warning" ? "warning" : ""}">
      <p class="pill">${escaparHTML(rec.categoria || "general")}</p>
      <h3>${escaparHTML(rec.titulo)}</h3>
      <p>${escaparHTML(rec.mensaje)}</p>
      ${rec.accion ? `<small class="muted"><strong>Acción:</strong> ${escaparHTML(rec.accion)}</small>` : ""}
    </article>
  `;
}

function crearUltimaRecomendacion(ultima) {
  const lista = ultima.recomendaciones || [];

  return `
    <p class="muted">${escaparHTML(formatearFechaHora(ultima.creadoEn || ultima.fecha))}</p>
    <p><strong>Origen:</strong> ${escaparHTML(ultima.origen || "local")}</p>
    ${ultima.resumen ? `<p>${escaparHTML(limitarTexto(ultima.resumen, 180))}</p>` : ""}
    ${Array.isArray(lista) && lista.length ? crearListaSimple(lista.slice(0, 5)) : ""}
  `;
}
