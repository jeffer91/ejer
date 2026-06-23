import { obtenerPesoActual, ordenarPesosPorFecha } from "../peso/peso.service.js";
import { escaparHTML, obtenerFechaISO } from "../ui/helpers.js";
import { crearBotones, crearEncabezadoVista } from "./componentes.view.js";

export function renderRegistrarView(estado = {}) {
  const perfil = estado.usuario?.perfil || {};
  const pesos = ordenarPesosPorFecha(estado.pesos || []);
  const pesoActual = obtenerPesoActual(pesos, perfil.pesoActualKg || 91);

  return `
    ${crearEncabezadoVista({
      titulo: "Registrar",
      subtitulo: "Guarda peso, medidas o una nota rapida sin entrar a pantallas tecnicas.",
      pill: "Registro diario"
    })}

    <section class="grid grid-2 section-space">
      <form id="form-peso" class="card" data-form="peso">
        <h2>Peso de hoy</h2>
        <p class="muted">Registro rapido para mantener actualizado tu progreso.</p>

        <div class="grid grid-2">
          <div class="campo">
            <label for="fecha-peso">Fecha</label>
            <input id="fecha-peso" name="fecha" type="date" value="${obtenerFechaISO()}" />
          </div>

          <div class="campo">
            <label for="peso-kg">Peso en kg</label>
            <input id="peso-kg" name="pesoKg" type="number" min="1" step="0.1" value="${escaparHTML(pesoActual)}" />
          </div>
        </div>

        <input type="hidden" name="momento" value="manana" />

        <details class="section-space">
          <summary>Agregar nota</summary>
          <div class="campo section-space">
            <label for="observacion-peso">Observacion</label>
            <textarea id="observacion-peso" name="observacion" placeholder="Ejemplo: antes de desayunar, despues de entrenar..."></textarea>
          </div>
        </details>

        ${crearBotones([{ texto: "Guardar peso", action: "guardar-peso" }])}
      </form>

      <article class="card">
        <h2>Registros rapidos</h2>
        <p class="muted">Tambien puedes entrar a los modulos completos cuando necesites mas detalle.</p>
        ${crearBotones([
          { texto: "Medidas", nav: "medidas" },
          { texto: "Peso completo", nav: "peso", tipo: "secundario" }
        ])}
      </article>
    </section>
  `;
}
