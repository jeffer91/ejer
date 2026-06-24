/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/vistas/ajustes.view.js

  Función:
    - Renderizar la pantalla de ajustes de FitJeff.
    - Permitir activar o desactivar Firebase, Gemini, sincronización, recomendaciones y estadísticas.
    - Mostrar información de PWA, Electron, versión, actualización, datos locales, Firestore y Gemini.
*/

import { crearResumenActualizacion } from "../actualizaciones/actualizaciones.service.js";
import { FIREBASE_APP_INFO } from "../firebase/firebase.config.js";
import { FIRESTORE_RUTAS } from "../firebase/firestore.service.js";
import { obtenerResumenPWA } from "../pwa/pwa.service.js";
import { escaparHTML, formatearFechaHora } from "../ui/helpers.js";
import {
  crearAlerta,
  crearBotones,
  crearEncabezadoVista,
  crearGridMetricas,
  crearTarjeta
} from "./componentes.view.js";

export function renderAjustesView(estado = {}) {
  const ajustes = estado.ajustes || {};
  const actualizacion = crearResumenActualizacion();
  const pwa = obtenerResumenPWASeguro();
  const entorno = obtenerEntorno();
  const geminiListo = Boolean(ajustes.usarGemini && ajustes.usarFirebase);

  return `
    ${crearEncabezadoVista({
      titulo: "Ajustes",
      subtitulo: "Configura sincronizacion, Gemini, instalacion, actualizacion y datos locales desde un solo lugar.",
      pill: "Configuracion"
    })}

    <section class="grid grid-2 section-space">
      <form id="form-ajustes" class="card" data-form="ajustes">
        <h2>Preferencias principales</h2>
        <p class="muted">Para usar Jarvis remoto con Gemini necesitas Firebase activo, Gemini activo y la clave configurada en Firebase Functions.</p>

        <div class="grid grid-2">
          ${crearSelectBooleano("usarFirebase", "Usar Firebase", ajustes.usarFirebase === true)}
          ${crearSelectBooleano("usarGemini", "Usar Gemini / Jarvis remoto", ajustes.usarGemini !== false)}
          ${crearSelectBooleano("guardarLocalAutomatico", "Guardar local automatico", ajustes.guardarLocalAutomatico !== false)}
          ${crearSelectBooleano("sincronizarAutomaticamente", "Sincronizar automaticamente", ajustes.sincronizarAutomaticamente === true)}
          ${crearSelectBooleano("mostrarRecomendaciones", "Mostrar recomendaciones", ajustes.mostrarRecomendaciones !== false)}
          ${crearSelectBooleano("mostrarEstadisticas", "Mostrar estadisticas", ajustes.mostrarEstadisticas !== false)}
        </div>

        ${crearBotones([
          { texto: "Guardar ajustes", action: "guardar-ajustes" },
          { texto: "Sincronizar ahora", action: "sincronizar-ahora", tipo: "secundario" }
        ])}
      </form>

      ${crearTarjeta({
        titulo: "Gemini API / Jarvis remoto",
        contenido: `
          ${crearAlerta({
            tipo: geminiListo ? "ok" : "warning",
            mensaje: geminiListo
              ? "La app intentara usar Gemini mediante Firebase Functions. Si la clave no esta configurada, Jarvis vuelve a modo local."
              : "Gemini remoto necesita Firebase activo y la clave GEMINI_API_KEY configurada en Functions."
          })}
          <p><strong>Donde va la API key:</strong> Firebase Functions, no en el frontend.</p>
          <p><strong>Nombre esperado:</strong> <code>GEMINI_API_KEY</code></p>
          <pre style="white-space:pre-wrap;overflow:auto;">firebase functions:secrets:set GEMINI_API_KEY
npm run firebase:functions</pre>
          <p class="muted">Luego abre Jarvis y usa Preguntar. Si falla el remoto, la app responde localmente para no romperse.</p>
        `,
        footer: crearBotones([
          { texto: "Abrir Jarvis", nav: "jarvis" },
          { texto: "Diagnostico", nav: "diagnostico", tipo: "secundario" }
        ])
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Firebase / Firestore",
        contenido: `
          <p><strong>Proyecto:</strong> ${escaparHTML(FIREBASE_APP_INFO.nombreProyecto)} · ${escaparHTML(FIREBASE_APP_INFO.idProyecto)}</p>
          <p><strong>App web:</strong> ${escaparHTML(FIREBASE_APP_INFO.nombreAppWeb)}</p>
          <p><strong>Usuario:</strong> ${escaparHTML(FIREBASE_APP_INFO.usuarioPrincipalId)}</p>
          <p><strong>Ruta base:</strong> ${escaparHTML(FIRESTORE_RUTAS.usuario)}</p>
          <p><strong>Documentos fijos:</strong> ${escaparHTML(FIRESTORE_RUTAS.documentos)}</p>
          ${crearAlerta({
            tipo: ajustes.usarFirebase ? "ok" : "info",
            mensaje: ajustes.usarFirebase
              ? "Firebase esta activo. La app mantiene modo local primero y sincroniza cuando corresponde."
              : "Firebase esta desactivado. Tus datos siguen guardados localmente."
          })}
        `,
        footer: crearBotones([{ texto: "Sincronizar ahora", action: "sincronizar-ahora" }])
      })}

      ${crearTarjeta({
        titulo: "Actualizacion",
        contenido: `
          <p><strong>Version actual:</strong> ${escaparHTML(actualizacion.versionActual)}</p>
          <p><strong>Modo:</strong> ${escaparHTML(actualizacion.modo)}</p>
          <p><strong>Service Worker:</strong> ${actualizacion.serviceWorkerDisponible ? "Disponible" : "No disponible"}</p>
          <p><strong>Ultima revision:</strong> ${actualizacion.ultimaRevision ? escaparHTML(formatearFechaHora(actualizacion.ultimaRevision)) : "Sin revision"}</p>
          ${crearAlerta({
            tipo: "info",
            mensaje: "El boton Actualizar app revisa version.json y fuerza recarga/cache cuando corresponda."
          })}
        `,
        footer: crearBotones([
          { texto: "Buscar actualizacion", action: "revisar-actualizacion" },
          { texto: "Actualizar app", action: "actualizar-app", tipo: "secundario" }
        ])
      })}
    </section>

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Instalacion en celular",
        contenido: `
          ${crearAlerta({
            tipo: pwa.instalada ? "ok" : "info",
            mensaje: pwa.instalada
              ? "FitJeff esta abierta como app instalada."
              : "Puedes instalar FitJeff desde el navegador cuando la opcion este disponible."
          })}
          <p><strong>Service worker registrado:</strong> ${pwa.serviceWorkerRegistrado ? "Si" : "No"}</p>
          <p><strong>Scope:</strong> ${escaparHTML(pwa.scope || "Sin scope")}</p>
        `,
        footer: crearBotones([
          { texto: "Instalar PWA", action: "instalar-pwa" },
          { texto: "Aplicar actualizacion PWA", action: "aplicar-actualizacion-pwa", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Zona de seguridad",
        contenido: `
          ${crearAlerta({
            tipo: "warning",
            mensaje: "Borrar datos locales solo elimina la informacion de este dispositivo. Exporta antes si necesitas respaldo."
          })}
        `,
        footer: crearBotones([
          { texto: "Exportar datos", action: "exportar-datos", tipo: "secundario" },
          { texto: "Borrar datos locales", action: "borrar-datos-locales", tipo: "peligro" }
        ])
      })}
    </section>

    ${crearGridMetricas([
      {
        titulo: "Entorno",
        valor: entorno.esElectron ? "Electron" : "Web/PWA",
        detalle: entorno.plataforma
      },
      {
        titulo: "PWA",
        valor: pwa.instalada ? "Instalada" : pwa.soportada ? "Soportada" : "No soportada",
        detalle: pwa.instalable ? "Lista para instalar" : "Instalacion segun navegador"
      },
      {
        titulo: "Gemini",
        valor: geminiListo ? "Activado" : "Local",
        detalle: geminiListo ? "Functions + GEMINI_API_KEY" : "Sin remoto activo"
      }
    ])}

    <section class="card section-space">
      <h2>Informacion tecnica</h2>
      <pre style="white-space:pre-wrap;overflow:auto;">${escaparHTML(JSON.stringify({ entorno, pwa, actualizacion, firestore: FIRESTORE_RUTAS, gemini: { geminiListo, secretoEsperado: "GEMINI_API_KEY" } }, null, 2))}</pre>
    </section>
  `;
}

function crearSelectBooleano(nombre, label, activo) {
  return `
    <div class="campo">
      <label for="${escaparHTML(nombre)}">${escaparHTML(label)}</label>
      <select id="${escaparHTML(nombre)}" name="${escaparHTML(nombre)}">
        <option value="true" ${activo ? "selected" : ""}>Si</option>
        <option value="false" ${!activo ? "selected" : ""}>No</option>
      </select>
    </div>
  `;
}

function obtenerEntorno() {
  return {
    esElectron: Boolean(window.FitJeffDesktop?.esElectron),
    plataforma: navigator.platform || "web",
    userAgent: navigator.userAgent,
    online: navigator.onLine
  };
}

function obtenerResumenPWASeguro() {
  try {
    return obtenerResumenPWA();
  } catch (error) {
    return {
      soportada: false,
      instalada: false,
      instalable: false,
      serviceWorkerRegistrado: false,
      scope: null
    };
  }
}
