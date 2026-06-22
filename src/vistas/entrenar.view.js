/*
  Nombre completo: entrenar.view.js
  Ruta o ubicación: src/vistas/entrenar.view.js

  Función:
    - Renderizar la pantalla para registrar entrenamientos.
    - Mostrar calentamiento, ejercicios, series, repeticiones, segundos, minutos, rondas y fallo técnico.
    - Dejar el formulario listo para que app.js guarde el entrenamiento local y luego en Firebase.

  Se conecta con:
    - src/data/rutina-base.js
    - src/vistas/componentes.view.js
    - src/ui/helpers.js
    - src/app.js
*/

import { TIPOS_EJERCICIO } from "../data/rutina-base.js";
import { escaparHTML, obtenerFechaISO } from "../ui/helpers.js";
import { crearAlerta, crearBotones, crearEncabezadoVista } from "./componentes.view.js";

export function renderEntrenarView(estado = {}) {
  const rutina = estado.rutina || { dias: [] };
  const diaSeleccionado = Number(estado.diaSeleccionado || rutina.diaActual || 1);
  const dia = rutina.dias?.find((item) => Number(item.numero) === diaSeleccionado) || rutina.dias?.[0];

  if (!dia) {
    return `${crearEncabezadoVista({ titulo: "Entrenar", subtitulo: "No hay rutina cargada.", pill: "Entrenamiento" })}${crearAlerta({ tipo: "warning", mensaje: "La rutina base todavía no está disponible." })}`;
  }

  return `
    ${crearEncabezadoVista({
      titulo: "Registrar entrenamiento",
      subtitulo: "Guarda lo que hiciste realmente: repeticiones, tiempo, rondas, energía, esfuerzo y técnica.",
      pill: `Día ${dia.numero}`
    })}

    <section class="card section-space">
      <div class="campo">
        <label for="selector-dia-entrenamiento">Día de rutina</label>
        <select id="selector-dia-entrenamiento" name="selectorDia" data-action="cambiar-dia-entrenamiento">
          ${rutina.dias.map((item) => `<option value="${escaparHTML(item.numero)}" ${Number(item.numero) === diaSeleccionado ? "selected" : ""}>Día ${escaparHTML(item.numero)} - ${escaparHTML(item.nombreCorto || item.nombre)}</option>`).join("")}
        </select>
      </div>
    </section>

    <form id="form-entrenamiento" class="card section-space" data-form="entrenamiento">
      <input type="hidden" name="diaRutina" value="${escaparHTML(dia.numero)}" />
      <input type="hidden" name="nombreDia" value="${escaparHTML(dia.nombre)}" />

      <h2>${escaparHTML(dia.nombre)}</h2>
      <p class="muted">${escaparHTML(dia.objetivo || "Entrenamiento del día.")}</p>

      ${crearDatosGenerales(dia)}
      ${crearCalentamiento(dia)}

      <section class="section-space">
        <h3>Ejercicios</h3>
        ${dia.ejercicios.map(crearEjercicioForm).join("")}
      </section>

      <div class="campo">
        <label for="observacion-entrenamiento">Observaciones</label>
        <textarea id="observacion-entrenamiento" name="observacion" placeholder="Ejemplo: buena energía, me costó un ejercicio, bajé intensidad..."></textarea>
      </div>

      ${crearBotones([
        { texto: "Guardar entrenamiento", action: "guardar-entrenamiento" },
        { texto: "Ver estadísticas", nav: "estadisticas", tipo: "secundario" }
      ])}
    </form>
  `;
}

function crearDatosGenerales(dia) {
  return `
    <section class="grid grid-2 section-space">
      <div class="campo"><label for="fecha-entrenamiento">Fecha</label><input id="fecha-entrenamiento" name="fecha" type="date" value="${obtenerFechaISO()}" /></div>
      <div class="campo"><label for="duracion-entrenamiento">Duración total aproximada en minutos</label><input id="duracion-entrenamiento" name="duracionMin" type="number" min="1" step="1" value="${escaparHTML(dia.duracionEstimadaMin || 30)}" /></div>
      <div class="campo"><label for="estado-entrenamiento">Estado</label><select id="estado-entrenamiento" name="estado"><option value="completado">Completado</option><option value="parcial">Parcial</option><option value="no-completado">No completado</option></select></div>
      <div class="campo"><label for="esfuerzo-general">Esfuerzo general</label><select id="esfuerzo-general" name="esfuerzoGeneral"><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto" selected>Alto</option><option value="maximo-controlado">Máximo controlado</option></select></div>
      <div class="campo"><label for="energia-inicial">Energía inicial</label><select id="energia-inicial" name="energiaInicial"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
      <div class="campo"><label for="energia-final">Energía final</label><select id="energia-final" name="energiaFinal"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
      <div class="campo"><label for="dolor-entrenamiento">¿Hubo dolor o molestia?</label><select id="dolor-entrenamiento" name="dolor"><option value="no" selected>No</option><option value="si">Sí</option></select></div>
      <div class="campo"><label for="zona-dolor">Zona de molestia si aplica</label><input id="zona-dolor" name="zonaDolor" type="text" placeholder="Ejemplo: muñeca, hombro, rodilla" /></div>
    </section>
  `;
}

function crearCalentamiento(dia) {
  const pasos = dia.calentamiento?.pasos || [];

  return `
    <section class="section-space">
      <h3>Calentamiento</h3>
      <div class="alerta">
        ${pasos.map((paso) => `<p><strong>${escaparHTML(paso.nombre)}:</strong> ${escaparHTML(paso.duracionSegundos)} segundos</p>`).join("")}
      </div>
    </section>
  `;
}

function crearEjercicioForm(ejercicio) {
  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.CARDIO) {
    return crearEjercicioCardio(ejercicio);
  }

  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.HIIT) {
    return crearEjercicioHIIT(ejercicio);
  }

  return crearEjercicioSeries(ejercicio);
}

function crearEjercicioSeries(ejercicio) {
  const series = Array.from({ length: ejercicio.seriesObjetivo || 3 }, (_, index) => index + 1);

  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}" data-tipo="${escaparHTML(ejercicio.tipoRegistro)}">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <p class="muted">${escaparHTML(ejercicio.instrucciones || "Registra el valor real de cada serie.")}</p>
      <p><span class="pill">Descanso: ${escaparHTML(ejercicio.descansoSegundos || 60)}s</span><span class="pill">Unidad: ${escaparHTML(ejercicio.unidad || "repeticiones")}</span></p>
      ${series.map((numeroSerie) => `
        <div class="serie-row">
          <strong>Serie ${numeroSerie}</strong>
          <input type="number" min="0" step="1" name="ex_${escaparHTML(ejercicio.id)}_serie_${numeroSerie}" placeholder="${escaparHTML(ejercicio.unidad || "valor")}" />
          <label><input type="checkbox" name="ex_${escaparHTML(ejercicio.id)}_fallo_${numeroSerie}" /> Fallo técnico</label>
        </div>
      `).join("")}
    </article>
  `;
}

function crearEjercicioCardio(ejercicio) {
  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}" data-tipo="cardio">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <p class="muted">${escaparHTML(ejercicio.instrucciones || "Registra minutos e intensidad real.")}</p>
      <section class="grid grid-2">
        <div class="campo"><label>Minutos completados</label><input type="number" min="0" step="1" name="ex_${escaparHTML(ejercicio.id)}_minutos" value="${escaparHTML(ejercicio.minutosObjetivo || 0)}" /></div>
        <div class="campo"><label>Intensidad real</label><select name="ex_${escaparHTML(ejercicio.id)}_intensidad"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
        <div class="campo"><label>¿Te detuviste?</label><select name="ex_${escaparHTML(ejercicio.id)}_detencion"><option value="no" selected>No</option><option value="si">Sí</option></select></div>
      </section>
    </article>
  `;
}

function crearEjercicioHIIT(ejercicio) {
  return `
    <article class="ejercicio" data-ejercicio-id="${escaparHTML(ejercicio.id)}" data-tipo="hiit">
      <h4>${escaparHTML(ejercicio.nombre)}</h4>
      <p class="muted">${escaparHTML(ejercicio.instrucciones || "Registra rondas e intensidad real.")}</p>
      <section class="grid grid-2">
        <div class="campo"><label>Rondas completadas</label><input type="number" min="0" max="${escaparHTML(ejercicio.rondasObjetivo || 10)}" step="1" name="ex_${escaparHTML(ejercicio.id)}_rondas" value="${escaparHTML(ejercicio.rondasObjetivo || 10)}" /></div>
        <div class="campo"><label>Intensidad real</label><select name="ex_${escaparHTML(ejercicio.id)}_intensidad"><option value="media">Media</option><option value="alta" selected>Alta</option><option value="maxima-controlada">Máxima controlada</option></select></div>
        <div class="campo"><label>¿Te detuviste?</label><select name="ex_${escaparHTML(ejercicio.id)}_detencion"><option value="no" selected>No</option><option value="si">Sí</option></select></div>
      </section>
    </article>
  `;
}
