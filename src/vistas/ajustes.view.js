/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/vistas/ajustes.view.js

  Función:
    - Renderizar la pantalla de ajustes de FitJeff.
    - Permitir activar o desactivar Firebase, Gemini, sincronización, recomendaciones y estadísticas.
    - Mostrar información de PWA, Electron, versión, actualización, datos locales y Firestore.
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

  return `
    ${crearEncabezadoVista({
      titulo: "Ajustes",
      subtitulo: "Configura sincronizacion, Firebase, actualizacion, instalacion y datos locales.",
      pill: "Configuracion"
    })}

    <section class="grid grid-2 section-space">
      <form id="form-ajustes" class="card" data-form="ajustes">
        <h2>Preferencias</h2>

        <div class="grid grid-2">
          ${crearSelectBooleano("usarFirebase", "Usar Firebase", ajustes.usarFirebase !== false)}
          ${crearSelectBooleano("usarGemini", "Usar Gemini", ajustes.usarGemini !== false)}
          ${crearSelectBooleano("guardarLocalAutomatico", "Guardar local automatico", ajustes.guardarLocalAutomatico !== false)}
          ${crearSelectBooleano("sincronizarAutomaticamente", "Sincronizar automaticamente", ajustes.sincronizarAutomaticamente !== false)}
          ${crearSelectBooleano("mostrarRecomendaciones", "Mostrar recomendaciones", ajustes.mostrarRecomendaciones !== false)}
          ${crearSelectBooleano("mostrarEstadisticas", "Mostrar estadisticas", ajustes.mostrarEstadisticas !== false)}
        </div>

        ${crearBotones([
          { texto: "Guardar ajustes", action: "guardar-ajustes" },
          { texto: "Sincronizar ahora", action: "sincronizar-ahora", tipo: "secundario" }
        ])}
      </form>

      ${crearTarjeta({
        titulo: "Firebase / Firestore",
        contenido: `
          <p><strong>Proyecto:</strong> ${escaparHTML(FIREBASE_APP_INFO.nombreProyecto)} · ${escaparHTML(FIREBASE_APP_INFO.idProyecto)}</p>
          <p><strong>App web:</strong> ${escaparHTML(FIREBASE_APP_INFO.nombreAppWeb)}</p>
          <p><strong>Usuario:</strong> ${escaparHTML(FIREBASE_APP_INFO.usuarioPrincipalId)}</p>
          <p><strong>Ruta base:</strong> ${escaparHTML(FIRESTORE_RUTAS.usuario)}</p>
          ${crearAlerta({
            tipo: ajustes.usarFirebase ? "ok" : "info",
            mensaje: ajustes.usarFirebase
              ? "Firebase esta activo. La app mantiene modo local primero y sincroniza cuando corresponde."
              : "Firebase esta desactivado. Tus datos siguen guardados localmente."
          })}
        `,
        footer: crearBotones([{ texto: "Sincronizar ahora", action: "sincronizar-ahora" }])
      })}
    </section>

    <section class="grid grid-2 section-space">
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
        titulo: "Datos locales",
        valor: "Activos",
        detalle: "localStorage + sincronizacion opcional"
      }
    ])}

    <section class="card section-space">
      <h2>Zona de seguridad</h2>
      ${crearAlerta({
        tipo: "warning",
        mensaje: "Borrar datos locales solo elimina la informacion de este dispositivo. Exporta antes si necesitas respaldo."
      })}
      ${crearBotones([
        { texto: "Exportar datos", action: "exportar-datos", tipo: "secundario" },
        { texto: "Borrar datos locales", action: "borrar-datos-locales", tipo: "peligro" }
      ])}
    </section>

    <section class="card section-space">
      <h2>Informacion tecnica</h2>
      <pre style="white-space:pre-wrap;overflow:auto;">${escaparHTML(JSON.stringify({ entorno, pwa, actualizacion, firestore: FIRESTORE_RUTAS }, null, 2))}</pre>
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
