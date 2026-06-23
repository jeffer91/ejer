import { crearBotones, crearEncabezadoVista, crearTarjeta } from "./componentes.view.js";

export function renderAsistenteView() {
  return `
    ${crearEncabezadoVista({
      titulo: "Asistente FitJeff",
      subtitulo: "Controla el entrenamiento con voz, botones y accesos rapidos.",
      pill: "Asistente"
    })}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Hablar",
        contenido: `<p class="muted">Activa Jarvis para iniciar, pausar, continuar, repetir o terminar una sesion guiada.</p>`,
        footer: crearBotones([
          { texto: "Activar voz", action: "jarvis-activar" },
          { texto: "Escuchar", action: "jarvis-escuchar", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Comandos rapidos",
        contenido: `<p class="muted">Usa botones cuando no quieras hablar o cuando el navegador no permita microfono.</p>`,
        footer: crearBotones([
          { texto: "Iniciar entrenamiento", action: "jarvis-iniciar-entrenamiento" },
          { texto: "Pausar", action: "jarvis-pausar", tipo: "secundario" },
          { texto: "Continuar", action: "jarvis-continuar", tipo: "secundario" },
          { texto: "Terminar", action: "jarvis-terminar", tipo: "secundario" }
        ])
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Nota rapida",
        contenido: `
          <div class="campo">
            <label for="jarvis-nota">Nota para guardar</label>
            <textarea id="jarvis-nota" placeholder="Ejemplo: hoy senti mejor energia en bicicleta..."></textarea>
          </div>
        `,
        footer: crearBotones([{ texto: "Guardar nota", action: "jarvis-guardar-nota" }])
      })}

      ${crearTarjeta({
        titulo: "Herramientas",
        contenido: `<p class="muted">Las funciones completas se mantienen disponibles como modulos internos.</p>`,
        footer: crearBotones([
          { texto: "Jarvis completo", nav: "jarvis" },
          { texto: "Audio remoto", nav: "audio-remoto", tipo: "secundario" },
          { texto: "HIIT", nav: "hiit", tipo: "secundario" }
        ])
      })}
    </section>
  `;
}
