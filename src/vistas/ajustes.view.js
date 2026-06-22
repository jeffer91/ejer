/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/vistas/ajustes.view.js

  Función:
    - Renderizar la pantalla de ajustes de FitJeff.
    - Permitir activar o desactivar Firebase, Gemini, sincronización, recomendaciones y estadísticas.
    - Mostrar información de PWA, Electron, versión, actualización y datos locales.

  Se conecta con:
    - src/actualizaciones/actualizaciones.service.js
    - src/pwa/pwa.service.js
    - src/vistas/componentes.view.js
    - src/ui/helpers.js
    - src/app.js cuando se actualice el flujo final.
*/

import { crearResumenActualizacion } from "../actualizaciones/actualizaciones.service.js";
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

  return `
    ${crearEncabezadoVista({
      titulo: "Ajustes",
      subtitulo: "Configura sincronización, recomendaciones, actualización, instalación y datos locales.",
      pill: "Configuración"
    })}

    <section class="grid grid-2 section-space">
      <form id="form-ajustes" class="card" data-form="ajustes">
        <h2>Preferencias</h2>

        <div class="grid grid-2">
          ${crearSelectBooleano("usarFirebase", "Usar Firebase", ajustes.usarFirebase !== false)}
          ${crearSelectBooleano("usarGemini", "Usar Gemini", ajustes.usarGemini !== false)}
          ${crearSelectBooleano("guardarLocalAutomatico", "Guardar local automático", ajustes.guardarLocalAutomatico !== false)}
          ${crearSelectBooleano("sincronizarAutomaticamente", "Sincronizar automáticamente", ajustes.sincronizarAutomaticamente !== false)}
          ${crearSelectBooleano("mostrarRecomendaciones", "Mostrar recomendaciones", ajustes.mostrarRecomendaciones !== false)}
          ${crearSelectBooleano("mostrarEstadisticas", "Mostrar estadísticas", ajustes.mostrarEstadisticas !== false)}
        </div>

        ${crearBotones([
          { texto: "Guardar ajustes", action: "guardar-ajustes" },
          { texto: "Sincronizar ahora", action: "sincronizar-ahora", tipo: "secundario" }
        ])}
      </form>

      ${crearTarjeta({
        titulo: "Actualización",
        contenido: `
          <p><strong>Versión actual:</strong> ${escaparHTML(actualizacion.versionActual)}</p>
          <p><strong>Modo:</strong> ${escaparHTML(actualizacion.modo)}</p>
          <p><strong>Service Worker:</strong> ${actualizacion.serviceWorkerDisponible ? "Disponible" : "No disponible"}</p>
          <p><strong>Última revisión:</strong> ${actualizacion.ultimaRevision ? escaparHTML(formatearFechaHora(actualizacion.ultimaRevision)) : "Sin revisión"}</p>
          ${crearAlerta({
            tipo: "info",
            mensaje: "El botón Actualizar app revisa version.json y fuerza la recarga/cache cuando corresponda."
          })}
        `,
        footer: crearBotones([
          { texto: "Buscar actualización", action: "revisar-actualizacion" },
          { texto: "Actualizar app", action: "actualizar-app", tipo: "secundario" }
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
        detalle: pwa.instalable ? "Lista para instalar" : "Instalación según navegador"
      },
      {
        titulo: "Datos locales",
        valor: "Activos",
        detalle: "localStorage + futura sincronización"
      }
    ])}

    <section class="grid grid-2 section-space">
      ${crearTarjeta({
        titulo: "Instalación en celular",
        contenido: `
          ${crearAlerta({
            tipo: pwa.instalada ? "ok" : "info",
            mensaje: pwa.instalada
              ? "FitJeff está abierta como app instalada."
              : "Puedes instalar FitJeff desde el navegador cuando la opción esté disponible."
          })}
          <p><strong>Service worker registrado:</strong> ${pwa.serviceWorkerRegistrado ? "Sí" : "No"}</p>
          <p><strong>Scope:</strong> ${escaparHTML(pwa.scope || "Sin scope")}</p>
        `,
        footer: crearBotones([
          { texto: "Instalar PWA", action: "instalar-pwa" },
          { texto: "Aplicar actualización PWA", action: "aplicar-actualizacion-pwa", tipo: "secundario" }
        ])
      })}

      ${crearTarjeta({
        titulo: "Zona de seguridad",
        contenido: crearAlerta({
          tipo: "warning",
          mensaje:
            "Borrar datos locales solo elimina la información de este dispositivo. Si algo no se sincronizó con Firebase, podría perderse aquí."
        }),
        footer: crearBotones([
          { texto: "Exportar datos", action: "exportar-datos", tipo: "secundario" },
          { texto: "Borrar datos locales", action: "borrar-datos-locales", tipo: "peligro" }
        ])
      })}
    </section>

    <section class="card section-space">
      <h2>Información técnica</h2>
      <pre style="white-space:pre-wrap;overflow:auto;">${escaparHTML(JSON.stringify({ entorno, pwa, actualizacion }, null, 2))}</pre>
    </section>
  `;
}

function crearSelectBooleano(nombre, label, activo) {
  return `
    <div class="campo">
      <label for="${escaparHTML(nombre)}">${escaparHTML(label)}</label>
      <select id="${escaparHTML(nombre)}" name="${escaparHTML(nombre)}">
        <option value="true" ${activo ? "selected" : ""}>Sí</option>
        <option value="false" ${!activo ? "selected" : ""}>No</option>
      </select>
    </div>
  `;
}

function obtenerEntorno() {
  const desktop = window.FitJeffDesktop?.obtenerEntorno?.();

  return {
    esElectron: Boolean(window.FitJeffDesktop?.esElectron),
    plataforma: desktop?.plataforma || navigator.platform || "web",
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
