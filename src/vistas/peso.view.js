/*
  Nombre completo: peso.view.js
  Ruta o ubicación: src/vistas/peso.view.js

  Función:
    - Renderizar la pantalla para registrar peso.
    - Mostrar últimos registros, tendencia y resumen de cambio de peso.
    - Dejar el formulario listo para guardado local y sincronización con Firebase.

  Se conecta con:
    - src/peso/peso.service.js
    - src/vistas/componentes.view.js
    - src/ui/helpers.js
    - src/app.js cuando se actualice el flujo final.
*/

import { crearResumenPeso, obtenerPesoActual, ordenarPesosPorFecha } from "../peso/peso.service.js";
import { escaparHTML, formatearFecha, obtenerFechaISO } from "../ui/helpers.js";
import {
  crearAlerta,
  crearBotones,
  crearEncabezadoVista,
  crearGridMetricas,
  crearMiniGraficaLinea,
  crearTablaSimple
} from "./componentes.view.js";

export function renderPesoView(estado = {}) {
  const perfil = estado.usuario?.perfil || {};
  const pesos = ordenarPesosPorFecha(estado.pesos || []);
  const resumen = crearResumenPeso({
    pesos,
    pesoInicialKg: perfil.pesoInicialKg || 91
  });
  const pesoActual = obtenerPesoActual(pesos, perfil.pesoActualKg || 91);

  return `
    ${crearEncabezadoVista({
      titulo: "Peso",
      subtitulo: "Registra tu peso en condiciones parecidas para ver una tendencia real.",
      pill: "Registro corporal"
    })}

    <section class="grid grid-2 section-space">
      <form id="form-peso" class="card" data-form="peso">
        <h2>Registrar peso</h2>
        <p class="muted">No hace falta obsesionarse con el dato diario. La tendencia semanal es más útil.</p>

        <div class="grid grid-2">
          <div class="campo">
            <label for="fecha-peso">Fecha</label>
            <input id="fecha-peso" name="fecha" type="date" value="${obtenerFechaISO()}" />
          </div>

          <div class="campo">
            <label for="peso-kg">Peso en kg</label>
            <input id="peso-kg" name="pesoKg" type="number" min="1" step="0.1" value="${escaparHTML(pesoActual)}" />
          </div>

          <div class="campo">
            <label for="momento-peso">Momento</label>
            <select id="momento-peso" name="momento">
              <option value="mañana" selected>Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div class="campo">
          <label for="observacion-peso">Observación</label>
          <textarea id="observacion-peso" name="observacion" placeholder="Ejemplo: después de levantarme, antes de desayunar..."></textarea>
        </div>

        ${crearBotones([{ texto: "Guardar peso", action: "guardar-peso" }])}
      </form>

      <article class="card">
        <h2>Resumen</h2>
        ${crearAlerta({
          tipo: resumen.tendencia === "bajando" ? "ok" : resumen.tendencia === "subiendo" ? "warning" : "info",
          titulo: "Tendencia",
          mensaje: resumen.mensajeTendencia || "Sin datos suficientes."
        })}
        <div class="section-space">
          ${crearMiniGraficaLinea({
            datos: pesos.map((peso) => ({ fecha: peso.fecha, valor: Number(peso.pesoKg) })),
            campoX: "fecha",
            campoY: "valor"
          })}
        </div>
      </article>
    </section>

    ${crearGridMetricas([
      { titulo: "Peso inicial", valor: `${resumen.pesoInicialKg} kg`, detalle: "Dato base" },
      { titulo: "Peso actual", valor: `${resumen.pesoActualKg} kg`, detalle: "Último registro" },
      { titulo: "Cambio", valor: `${resumen.cambioKg} kg`, detalle: resumen.tendencia }
    ])}

    <section class="card section-space">
      <h2>Últimos registros</h2>
      ${crearTablaSimple({
        columnas: [
          { titulo: "Fecha", campo: (fila) => formatearFecha(fila.fecha) },
          { titulo: "Peso", campo: (fila) => `${fila.pesoKg} kg` },
          { titulo: "Momento", campo: "momento" },
          { titulo: "Observación", campo: "observacion" }
        ],
        filas: [...pesos].reverse().slice(0, 12),
        vacio: "Todavía no hay registros de peso."
      })}
    </section>
  `;
}
