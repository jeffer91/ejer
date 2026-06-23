import { TIPOS_EJERCICIO } from "../data/rutina-base.js";
import { escaparHTML, obtenerFechaISO } from "../ui/helpers.js";
import { crearAlerta, crearBotones, crearEncabezadoVista } from "./componentes.view.js";

export function renderEntrenarView(estado = {}) {
  const rutina = estado.rutina || { dias: [] };
  const diaSeleccionado = Number(estado.diaSeleccionado || rutina.diaActual || 1);
  const dia = rutina.dias?.find((item) => Number(item.numero) === diaSeleccionado) || rutina.dias?.[0];

  if (!dia) {
    return `${crearEncabezadoVista({ titulo: "Entrenar", subtitulo: "No hay rutina cargada.", pill: "Entrenamiento" })}${crearAlerta({ tipo: "warning", mensaje: "La rutina base todavia no esta disponible." })}`;
  }

  return `
    ${crearEncabezadoVista({
      titulo: "Entrenar",
      subtitulo: "Entrena con guia, HIIT o registro manual en una sola pantalla.",
      pill: `Dia ${dia.numero}`
    })}

    <section class="card section-space">
      <h2>${escaparHTML(dia.nombre)}</h2>
      <p class="muted">${escaparHTML(dia.objetivo || "Entrenamiento del dia.")}</p>
      ${crearBotones([
        { texto: "Entrenamiento guiado", nav: "guiado" },
        { texto: "HIIT", nav: "hiit", tipo: "secundario" },
        { texto: "Rutinas", nav: "rutinas", tipo: "secundario" }
      ])}
    </section>

    <section class="card section-space">
      <div class="campo">
        <label for="selector-dia-entrenamiento">Dia de rutina</label>
        <select id="selector-dia-entrenamiento" name="selectorDia">
          ${rutina.dias.map((item) => `<option value="${escaparHTML(item.numero)}" ${Number(item.numero) === diaSeleccionado ? "selected" : ""}>Dia ${escaparHTML(item.numero)} - ${escaparHTML(item.nombreCorto || item.nombre)}</option>`).join("")}
        </select>
      </div>
    </section>

    <form id="form-entrenamiento" class="card section-space" data-form="entrenamiento">
      <input type="hidden" name="diaRutina" value="${escaparHTML(dia.numero)}" />
      <input type="hidden" name="nombreDia" value="${escaparHTML(dia.nombre)}" />
      <input type="hidden" name="estado" value="completado" />
      <input type="hidden" name="energiaInicial" value="media" />
      <input type="hidden" name="energiaFinal" value="media" />
      <input type="hidden" name="esfuerzoGeneral" value="alto" />
      <input type="hidden" name="dolor" value="no" />
      <input type="hidden" name="zonaDolor" value="" />

      <h2>Registro manual rapido</h2>
      <p class="muted">Guarda lo realizado. Los detalles avanzados quedan ocultos para que la pantalla sea mas simple.</p>

      <section class="grid grid-2 section-space">
        <div class="campo">
          <label for="fecha-entrenamiento">Fecha</label>
          <input id="fecha-entrenamiento" name="fecha" type="date" value="${obtenerFechaISO()}" />
        </div>
        <div class="campo">
          <label for="duracion-entrenamiento">Duracion en minutos</label>
          <input id="duracion-entrenamiento" name="duracionMin" type="number" min="1" step="1" value="${escaparHTML(dia.duracionEstimadaMin || 30)}" />
        </div>
      </section>

      <details class="section-space">
        <summary>Calentamiento</summary>
        <div class="alerta section-space">
          ${(dia.calentamiento?.pasos || []).map((paso) => `<p><strong>${escaparHTML(paso.nombre)}:</strong> ${escaparHTML(paso.duracionSegundos)} segundos</p>`).join("")}
        </div>
      </details>

      <section class="section-space">
        <h3>Ejercicios</h3>
        ${dia.ejercicios.map(crearEjercicioForm).join("")}
      </section>

      <div class="campo section-space">
        <label for="observacion-entrenamiento">Observaciones</label>
        <textarea id="observacion-entrenamiento" name="observacion" placeholder="Ejemplo: buena energia, baje intensidad..."></textarea>
      </div>

      ${crearBotones([
        { texto: "Guardar entrenamiento", action: "guardar-entrenamiento" },
        { texto: "Ver progreso", nav: "progreso", tipo: "secundario" }
      ])}
    </form>
  `;
}

function crearEjercicioForm(ejercicio) {
  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.CARDIO) return crearEjercicioCardio(ejercicio);
  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.HIIT) return crearEjercicioHIIT(ejercicio);
  return crearEjercicioSeries(ejercicio);
}

function crearEjercicioSeries(ejercicio) {
  const series = Array.from({ length: ejercicio.seriesObjetivo || 3 }, (_, index) => index + 1);
  const unidad = ejercicio.unidad || "valor";

  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <p class="muted">${escaparHTML(ejercicio.instrucciones || "Registra el valor real de cada serie.")}</p>
      ${series.map((numeroSerie) => `
        <div class="serie-row">
          <strong>Serie ${numeroSerie}</strong>
          <input type="number" min="0" step="1" name="ex_${escaparHTML(ejercicio.id)}_serie_${numeroSerie}" placeholder="${escaparHTML(unidad)}" />
          <label><input type="checkbox" name="ex_${escaparHTML(ejercicio.id)}_fallo_${numeroSerie}" /> Fallo tecnico</label>
        </div>
      `).join("")}
    </article>
  `;
}

function crearEjercicioCardio(ejercicio) {
  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <div class="grid grid-2">
        <div class="campo"><label>Minutos</label><input type="number" min="0" step="1" name="ex_${escaparHTML(ejercicio.id)}_minutos" value="${escaparHTML(ejercicio.minutosObjetivo || 0)}" /></div>
        <div class="campo"><label>Intensidad</label><select name="ex_${escaparHTML(ejercicio.id)}_intensidad"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
        <input type="hidden" name="ex_${escaparHTML(ejercicio.id)}_detencion" value="no" />
      </div>
    </article>
  `;
}

function crearEjercicioHIIT(ejercicio) {
  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <div class="grid grid-2">
        <div class="campo"><label>Rondas</label><input type="number" min="0" max="${escaparHTML(ejercicio.rondasObjetivo || 10)}" step="1" name="ex_${escaparHTML(ejercicio.id)}_rondas" value="${escaparHTML(ejercicio.rondasObjetivo || 10)}" /></div>
        <div class="campo"><label>Intensidad</label><select name="ex_${escaparHTML(ejercicio.id)}_intensidad"><option value="media">Media</option><option value="alta" selected>Alta</option><option value="maxima-controlada">Maxima controlada</option></select></div>
        <input type="hidden" name="ex_${escaparHTML(ejercicio.id)}_detencion" value="no" />
      </div>
    </article>
  `;
}
