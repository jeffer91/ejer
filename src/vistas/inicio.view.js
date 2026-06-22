/*
  Nombre completo: inicio.view.js
  Ruta o ubicación: src/vistas/inicio.view.js

  Función:
    - Renderizar la pantalla de inicio de FitJeff.
    - Mostrar peso actual, día sugerido, cumplimiento, último entrenamiento y recomendaciones rápidas.
    - Dar acceso directo a entrenar, registrar peso, estadísticas y recomendaciones.

  Se conecta con:
    - src/vistas/componentes.view.js
    - src/estadisticas/estadisticas.service.js
    - src/data/rutina-base.js
    - src/ui/helpers.js
    - src/app.js cuando se actualice el flujo final.
*/

import { obtenerDiaPorNumero } from "../data/rutina-base.js";
import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";
import { escaparHTML, formatearFecha, ordenarPorFechaDesc } from "../ui/helpers.js";
import {
  crearAlerta,
  crearBotones,
  crearEncabezadoVista,
  crearGridMetricas,
  crearResumenEntrenamientoCard,
  crearTarjeta
} from "./componentes.view.js";

export function renderInicioView(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const perfil = estado.usuario?.perfil || {};
  const entrenamientos = ordenarPorFechaDesc(estado.entrenamientos || []);
  const ultimoEntrenamiento = entrenamientos[0] || null;
  const diaActual = estado.rutina?.diaActual || calcularDiaSugerido(ultimoEntrenamiento);
  const dia = obtenerDiaPorNumero(diaActual);
  const pesoActual = estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || 91;

  return `
    ${crearEncabezadoVista({
      titulo: `Hola, ${estado.usuario?.nombre || "Jeff"}`,
      subtitulo: "Registra lo que haces, cómo te sientes y cómo va tu progreso real.",
      pill: "Inicio"
    })}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Día sugerido",
        contenido: `
          <p class="pill">Día ${escaparHTML(dia.numero)}</p>
          <h3>${escaparHTML(dia.nombre)}</h3>
          <p class="muted">${escaparHTML(dia.objetivo)}</p>
          <p><strong>Duración estimada:</strong> ${escaparHTML(dia.duracionEstimadaMin)} minutos</p>
        `,
        footer: crearBotones([
          { texto: "Iniciar entrenamiento", nav: "entrenar" },
          { texto: "Registrar peso", nav: "peso", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Estado de hoy",
        contenido: `
          ${crearAlerta({
            tipo: estadisticas.fatiga?.nivel === "alto" ? "danger" : estadisticas.fatiga?.nivel === "medio" ? "warning" : "ok",
            titulo: "Fatiga",
            mensaje: estadisticas.fatiga?.mensaje || "Sin alertas importantes."
          })}
          <div class="section-space">
            ${crearAlerta({
              tipo: "info",
              titulo: "Fallo técnico",
              mensaje: "Entrenar al fallo significa parar cuando se pierde la postura correcta, no forzar con mala técnica."
            })}
          </div>
        `
      })}
    </section>

    ${crearGridMetricas([
      {
        titulo: "Peso actual",
        valor: `${pesoActual} kg`,
        detalle: `Inicial: ${perfil.pesoInicialKg || 91} kg`
      },
      {
        titulo: "Cumplimiento semanal",
        valor: `${estadisticas.cumplimiento?.porcentajeSemana || 0}%`,
        detalle: `${estadisticas.cumplimiento?.entrenamientosUltimos7Dias || 0} entrenamientos en 7 días`
      },
      {
        titulo: "Minutos totales",
        valor: `${estadisticas.entrenamientos?.minutosTotales || 0}`,
        detalle: "Tiempo registrado"
      }
    ])}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Último entrenamiento",
        contenido: crearResumenEntrenamientoCard(ultimoEntrenamiento)
      })}

      ${crearTarjeta({
        titulo: "Recomendación rápida",
        contenido: crearRecomendacionRapida(estadisticas)
      })}
    </section>

    <section class="card section-space">
      <h2>Acciones principales</h2>
      ${crearBotones([
        { texto: "Entrenar hoy", nav: "entrenar" },
        { texto: "Ver estadísticas", nav: "estadisticas", tipo: "secundario" },
        { texto: "Generar recomendaciones", nav: "recomendaciones", tipo: "secundario" },
        { texto: "Sincronizar", action: "sincronizar-ahora", tipo: "secundario" }
      ])}
    </section>
  `;
}

function crearRecomendacionRapida(estadisticas) {
  const recomendaciones = estadisticas.recomendacionesRapidas || [];

  if (!recomendaciones.length) {
    return crearAlerta({
      tipo: "info",
      mensaje: "Sigue registrando datos para mejorar las recomendaciones."
    });
  }

  return recomendaciones
    .slice(0, 3)
    .map((rec) =>
      crearAlerta({
        tipo: rec.tipo === "fatiga" ? "warning" : "info",
        titulo: rec.tipo,
        mensaje: rec.mensaje
      })
    )
    .join("<div style='height:10px;'></div>");
}

function calcularDiaSugerido(ultimoEntrenamiento) {
  if (!ultimoEntrenamiento?.diaRutina) {
    return 1;
  }

  return Number(ultimoEntrenamiento.diaRutina) >= 4
    ? 1
    : Number(ultimoEntrenamiento.diaRutina) + 1;
}

export function crearResumenInicioTexto(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const perfil = estado.usuario?.perfil || {};
  const ultimo = ordenarPorFechaDesc(estado.entrenamientos || [])[0];

  return [
    `Peso actual: ${estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || 91} kg`,
    `Cumplimiento semanal: ${estadisticas.cumplimiento?.porcentajeSemana || 0}%`,
    ultimo ? `Último entrenamiento: Día ${ultimo.diaRutina}, ${formatearFecha(ultimo.fecha)}` : "Sin entrenamientos registrados",
    `Fatiga: ${estadisticas.fatiga?.nivel || "sin datos"}`
  ].join("\n");
}
