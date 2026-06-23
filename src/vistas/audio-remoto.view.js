/*
  Nombre completo: audio-remoto.view.js
  Ruta o ubicación: src/vistas/audio-remoto.view.js

  Función:
    - Renderizar pantalla de control sonoro remoto.
    - Permitir configurar este dispositivo como receptor o control.
    - Enviar comandos desde celular hacia computadora.
*/

import { crearEncabezadoVista } from "./componentes.view.js";
import { mostrarMensaje } from "../ui/modal.js";
import { AUDIO_REMOTO_ACCIONES, AUDIO_REMOTO_ROLES } from "../audio/audio.remote.schema.js";
import { guardarConfigAudioRemoto, obtenerConfigAudioRemoto } from "../audio/audio.remote.storage.service.js";
import {
  activarReceptorAudioRemoto,
  desactivarReceptorAudioRemoto,
  enviarOrdenAudioRemota,
  obtenerEstadoReceptorAudioRemoto
} from "../audio/audio.remote.receiver.service.js";
import { obtenerConfigAudio } from "../audio/audio.speech.service.js";

let eventosAudioRemotoActivos = false;

export function renderAudioRemotoView() {
  activarEventosAudioRemoto();

  const config = obtenerConfigAudioRemoto();
  const receptor = obtenerEstadoReceptorAudioRemoto();
  const audio = obtenerConfigAudio();

  return `
    ${crearEncabezadoVista({
      titulo: "Control sonoro remoto",
      subtitulo: "Usa el celular como control y la computadora como parlante de FitJeff.",
      pill: "Audio remoto"
    })}

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Configuración</h2>
        <form id="form-audio-remoto" class="form-grid">
          <div class="campo">
            <label for="audioRol">Rol de este dispositivo</label>
            <select id="audioRol" name="rol">
              <option value="${AUDIO_REMOTO_ROLES.RECEPTOR}" ${config.rol === AUDIO_REMOTO_ROLES.RECEPTOR ? "selected" : ""}>Computadora / receptor</option>
              <option value="${AUDIO_REMOTO_ROLES.CONTROL}" ${config.rol === AUDIO_REMOTO_ROLES.CONTROL ? "selected" : ""}>Celular / control</option>
            </select>
          </div>

          <div class="campo">
            <label for="audioCanalId">Canal</label>
            <input id="audioCanalId" name="canalId" value="${escaparHTML(config.canalId)}" />
          </div>

          <div class="campo">
            <label for="audioDispositivoId">ID de este dispositivo</label>
            <input id="audioDispositivoId" name="dispositivoId" value="${escaparHTML(config.dispositivoId)}" />
          </div>

          <div class="campo">
            <label for="audioDestinoId">Destino</label>
            <input id="audioDestinoId" name="destinoId" value="${escaparHTML(config.destinoId)}" placeholder="todos o ID computadora" />
          </div>

          <label class="check-row">
            <input type="checkbox" name="usarFirebase" ${config.usarFirebase ? "checked" : ""} />
            Usar Firebase para celular/computadora
          </label>
        </form>

        <div class="acciones">
          <button class="btn" data-action="audio-remoto-guardar">Guardar configuración</button>
          <button class="btn" data-action="audio-remoto-activar">Activar receptor</button>
          <button class="btn peligro" data-action="audio-remoto-desactivar">Desactivar receptor</button>
        </div>
      </article>

      <article class="card">
        <h2>Estado</h2>
        <div class="grid-2">
          <div class="metric">
            <span>Receptor</span>
            <strong>${receptor.activo ? "Activo" : "Apagado"}</strong>
          </div>
          <div class="metric">
            <span>Firebase</span>
            <strong>${config.usarFirebase ? "Preparado" : "No usado"}</strong>
          </div>
          <div class="metric">
            <span>Canal</span>
            <strong>${escaparHTML(config.canalId)}</strong>
          </div>
          <div class="metric">
            <span>Volumen voz</span>
            <strong>${Math.round(audio.volumen * 100)}%</strong>
          </div>
        </div>

        <div class="alerta warning section-space">
          <strong>Importante</strong>
          <p>Para que la computadora suene, abre esta pantalla en la computadora y presiona “Activar receptor”. Luego desde el celular envías comandos.</p>
        </div>
      </article>
    </section>

    <section class="card section-space">
      <h2>Comandos remotos</h2>
      <div class="campo">
        <label for="audioTexto">Texto para que hable el receptor</label>
        <input id="audioTexto" value="FitJeff conectado desde el celular." />
      </div>

      <div class="acciones acciones-grid">
        <button class="btn" data-action="audio-remoto-hablar">Hablar en receptor</button>
        <button class="btn" data-action="audio-remoto-hiit-rapido">Iniciar HIIT rápido</button>
        <button class="btn secundario" data-action="audio-remoto-hiit-sin-saltos">HIIT sin saltos</button>
        <button class="btn secundario" data-action="audio-remoto-hiit-bici">HIIT bicicleta</button>
        <button class="btn secundario" data-action="audio-remoto-pausar">Pausar HIIT</button>
        <button class="btn secundario" data-action="audio-remoto-continuar">Continuar HIIT</button>
        <button class="btn peligro" data-action="audio-remoto-terminar">Terminar HIIT</button>
        <button class="btn secundario" data-action="audio-remoto-volumen-mas">Subir volumen voz</button>
        <button class="btn secundario" data-action="audio-remoto-volumen-menos">Bajar volumen voz</button>
        <button class="btn secundario" data-action="audio-remoto-silenciar">Silenciar voz</button>
        <button class="btn secundario" data-action="audio-remoto-activar-voz">Activar voz</button>
      </div>
    </section>
  `;
}

function activarEventosAudioRemoto() {
  if (eventosAudioRemotoActivos) return;
  eventosAudioRemotoActivos = true;

  document.body.addEventListener("click", async (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;
    if (!accion) return;

    try {
      if (accion === "audio-remoto-guardar") guardarConfigDesdeFormulario();
      if (accion === "audio-remoto-activar") await activarReceptor();
      if (accion === "audio-remoto-desactivar") desactivarReceptor();

      if (accion === "audio-remoto-hablar") {
        await enviarComando(AUDIO_REMOTO_ACCIONES.HABLAR, { texto: document.getElementById("audioTexto")?.value || "FitJeff conectado." });
      }

      if (accion === "audio-remoto-hiit-rapido") await enviarComando(AUDIO_REMOTO_ACCIONES.INICIAR_HIIT, { rutinaId: "rapido-10" });
      if (accion === "audio-remoto-hiit-sin-saltos") await enviarComando(AUDIO_REMOTO_ACCIONES.INICIAR_HIIT, { rutinaId: "sala-sin-saltos" });
      if (accion === "audio-remoto-hiit-bici") await enviarComando(AUDIO_REMOTO_ACCIONES.INICIAR_HIIT, { rutinaId: "bicicleta-basica" });
      if (accion === "audio-remoto-pausar") await enviarComando(AUDIO_REMOTO_ACCIONES.PAUSAR_HIIT);
      if (accion === "audio-remoto-continuar") await enviarComando(AUDIO_REMOTO_ACCIONES.CONTINUAR_HIIT);
      if (accion === "audio-remoto-terminar") await enviarComando(AUDIO_REMOTO_ACCIONES.TERMINAR_HIIT);
      if (accion === "audio-remoto-volumen-mas") await enviarComando(AUDIO_REMOTO_ACCIONES.SUBIR_VOLUMEN);
      if (accion === "audio-remoto-volumen-menos") await enviarComando(AUDIO_REMOTO_ACCIONES.BAJAR_VOLUMEN);
      if (accion === "audio-remoto-silenciar") await enviarComando(AUDIO_REMOTO_ACCIONES.SILENCIAR);
      if (accion === "audio-remoto-activar-voz") await enviarComando(AUDIO_REMOTO_ACCIONES.ACTIVAR_VOZ);
    } catch (error) {
      mostrarMensaje("Audio remoto", error.message || "No se pudo completar la acción.", "error");
    }
  });
}

function guardarConfigDesdeFormulario() {
  const form = document.getElementById("form-audio-remoto");
  const datos = new FormData(form);

  guardarConfigAudioRemoto({
    rol: datos.get("rol"),
    canalId: datos.get("canalId"),
    dispositivoId: datos.get("dispositivoId"),
    destinoId: datos.get("destinoId") || "todos",
    usarFirebase: datos.get("usarFirebase") === "on"
  });

  mostrarMensaje("Configuración guardada", "Audio remoto quedó configurado.", "ok");
  refrescarAudioRemoto();
}

async function activarReceptor() {
  guardarConfigDesdeFormulario();
  await activarReceptorAudioRemoto();
  mostrarMensaje("Receptor activo", "Este dispositivo escuchará comandos remotos.", "ok");
  refrescarAudioRemoto();
}

function desactivarReceptor() {
  desactivarReceptorAudioRemoto();
  mostrarMensaje("Receptor apagado", "Este dispositivo dejó de escuchar comandos.", "ok");
  refrescarAudioRemoto();
}

async function enviarComando(accion, extra = {}) {
  guardarConfigDesdeFormulario();

  const resultado = await enviarOrdenAudioRemota({
    accion,
    ...extra
  });

  mostrarMensaje("Comando enviado", resultado.mensaje, "ok");
}

function refrescarAudioRemoto() {
  const vista = document.getElementById("vista");
  if (!vista) return;
  vista.innerHTML = renderAudioRemotoView();
  vista.focus({ preventScroll: true });
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
