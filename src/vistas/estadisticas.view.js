/*
  Nombre completo: estadisticas.view.js
  Ruta o ubicación: src/vistas/estadisticas.view.js

  Función:
    - Renderizar un tablero gráfico de progreso de FitJeff.
    - Mostrar peso, cumplimiento, minutos, fatiga, rendimiento por ejercicio y gráficas simples.
    - Preparar datos visuales sin depender de librerías externas.

  Se conecta con:
    - src/estadisticas/estadisticas.service.js
    - src/vistas/componentes.view.js
    - src/ui/helpers.js
    - src/app.js cuando se actualice el flujo final.
*/

import { generarResumenEstadistico, prepararDatosParaGraficas } from "../estadisticas/estadisticas.service.js";
import { escaparHTML, formatearFecha } from "../ui/helpers.js";
import {
  crearAlerta,
  crearBotones,
  crearEncabezadoVista,
  crearGraficaBarras,
  crearGridMetricas,
  crearMiniGraficaLinea,
  crearTablaSimple,
  crearTarjeta
} from "./componentes.view.js";

export function renderEstadisticasView(estado = {}) {
  const estadisticas = generarResumenEstadistico(estado);
  const graficas = prepararDatosParaGraficas(estadisticas);

  return `
    ${crearEncabezadoVista({
      titulo: "Estadísticas",
      subtitulo: "Mira tu progreso con datos simples: cumplimiento, peso, minutos, fatiga y rendimiento.",
      pill: "Tablero gráfico"
    })}

    ${crearGridMetricas(
      estadisticas.tarjetas.map((tarjeta) => ({
        titulo: tarjeta.titulo,
        valor: tarjeta.valor,
        detalle: tarjeta.detalle
      }))
    )}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Evolución de peso",
        contenido: crearMiniGraficaLinea({
          datos: graficas.peso,
          campoX: "fecha",
          campoY: "valor"
        })
      })}

      ${crearTarjeta({
        titulo: "Minutos por día de rutina",
        contenido: crearGraficaBarras({
          datos: graficas.minutosPorDiaRutina.map((item) => ({
            label: `Día ${item.diaRutina}`,
            valor: item.minutos
          })),
          campoLabel: "label",
          campoValor: "valor"
        })
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Cumplimiento semanal",
        contenido: crearGraficaBarras({
          datos: graficas.cumplimientoSemanal.map((item) => ({
            label: item.semana,
            valor: item.cumplimiento
          })),
          campoLabel: "label",
          campoValor: "valor",
          max: 100
        })
      })}

      ${crearTarjeta({
        titulo: "Fatiga y recuperación",
        contenido: `
          ${crearAlerta({
            tipo: estadisticas.fatiga.nivel === "alto" ? "danger" : estadisticas.fatiga.nivel === "medio" ? "warning" : "ok",
            titulo: `Nivel: ${estadisticas.fatiga.nivel}`,
            mensaje: estadisticas.fatiga.mensaje
          })}
          <div class="section-space">
            <p><strong>Energía baja últimos 6:</strong> ${escaparHTML(estadisticas.fatiga.energiaBajaUltimos6 || 0)}</p>
            <p><strong>Dolor últimos 6:</strong> ${escaparHTML(estadisticas.fatiga.dolorUltimos6 || 0)}</p>
            <p><strong>Incompletos últimos 6:</strong> ${escaparHTML(estadisticas.fatiga.incompletosUltimos6 || 0)}</p>
          </div>
        `
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
          { titulo: "Fecha", campo: (fila) => formatearFecha(fila.fecha) },
          { titulo: "Día", campo: (fila) => `Día ${fila.diaRutina}` },
          { titulo: "Duración", campo: (fila) => `${fila.duracionMin || 0} min` },
          { titulo: "Estado", campo: "estado" },
          { titulo: "Energía final", campo: "energiaFinal" }
        ],
        filas: [...(estado.entrenamientos || [])].slice(0, 10),
        vacio: "Todavía no hay entrenamientos registrados."
      })}

      <div class="section-space">
        ${crearBotones([
          { texto: "Registrar entrenamiento", nav: "entrenar" },
          { texto: "Generar recomendaciones", nav: "recomendaciones", tipo: "secundario" },
          { texto: "Guardar estadísticas en Firebase", action: "guardar-estadisticas", tipo: "secundario" }
        ])}
      </div>
    </section>
  `;
}
