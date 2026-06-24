/*
  Nombre completo: asistente.view.js
  Ruta o ubicación: src/vistas/asistente.view.js

  Función:
    - Renderizar una pantalla puente simple para el asistente.
    - Evitar duplicar controles completos de Jarvis.
    - Guiar al usuario hacia Jarvis completo, entrenamiento guiado y configuración Gemini.
*/

import { crearBotones, crearEncabezadoVista, crearTarjeta } from "./componentes.view.js";

export function renderAsistenteView(estado = {}) {
  const geminiActivo = Boolean(estado.ajustes?.usarGemini && estado.ajustes?.usarFirebase);

  return `
    ${crearEncabezadoVista({
      titulo: "Asistente FitJeff",
      subtitulo: "Centro rápido para elegir cómo quieres usar Jarvis, sin repetir pantallas.",
      pill: "Asistente"
    })}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Jarvis completo",
        contenido: `
          <p class="muted">Aquí están la voz, los comandos manuales, la consulta inteligente, las notas y el historial de respuestas.</p>
          <p><strong>Estado Gemini:</strong> ${geminiActivo ? "Remoto activo por Firebase Functions" : "Modo local / pendiente de configurar"}</p>
        `,
        footer: crearBotones([
          { texto: "Abrir Jarvis", nav: "jarvis" },
          { texto: "Configurar Gemini", nav: "ajustes", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Entrenamiento guiado",
        contenido: `<p class="muted">Para entrenar paso a paso con botones de hecho, repetir, pausar, continuar y terminar.</p>`,
        footer: crearBotones([
          { texto: "Iniciar guiado", nav: "guiado" },
          { texto: "Entrenar manual", nav: "entrenar", tipo: "secundario" }
        ])
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "HIIT y audio",
        contenido: `<p class="muted">Accede al temporizador HIIT sonoro o al control remoto de audio cuando uses otro dispositivo.</p>`,
        footer: crearBotones([
          { texto: "HIIT", nav: "hiit" },
          { texto: "Audio remoto", nav: "audio-remoto", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Qué usar primero",
        contenido: `
          <ol>
            <li>Usa <strong>Entrenamiento guiado</strong> para la sesión diaria.</li>
            <li>Usa <strong>Jarvis completo</strong> para preguntas, voz y notas.</li>
            <li>Usa <strong>Ajustes</strong> solo para activar Firebase, Gemini y actualización.</li>
          </ol>
        `,
        footer: crearBotones([{ texto: "Ir a Ajustes", nav: "ajustes", tipo: "secundario" }])
      })}
    </section>
  `;
}
