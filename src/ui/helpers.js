/*
  Nombre completo: helpers.js
  Ruta o ubicación: src/ui/helpers.js

  Función:
    - Agrupar funciones pequeñas reutilizables de interfaz y datos.
    - Escapar HTML, formatear fechas, crear ids, leer formularios y manejar localStorage seguro.
    - Reducir repetición de código en app.js y módulos UI.

  Se conecta con:
    - src/app.js
    - src/ui/router.js
    - src/ui/layout.js
    - src/ui/menu.js
    - src/ui/modal.js
    - src/actualizaciones/actualizaciones.service.js
*/

export function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function obtenerFechaISO(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10);
}

export function formatearFecha(fecha, locale = "es-EC") {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(`${fecha}T00:00:00`));
}

export function formatearFechaHora(fecha, locale = "es-EC") {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(fecha));
}

export function crearId(prefijo = "item") {
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function redondear(numero, decimales = 1) {
  const factor = 10 ** decimales;
  return Math.round(Number(numero || 0) * factor) / factor;
}

export function leerFormulario(form) {
  const elemento = typeof form === "string" ? document.querySelector(form) : form;

  if (!elemento) {
    return {};
  }

  const data = new FormData(elemento);
  const salida = {};

  for (const [clave, valor] of data.entries()) {
    if (salida[clave] !== undefined) {
      salida[clave] = Array.isArray(salida[clave])
        ? [...salida[clave], valor]
        : [salida[clave], valor];
    } else {
      salida[clave] = valor;
    }
  }

  return salida;
}

export function leerNumero(valor, defecto = 0) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
}

export function leerBooleano(valor) {
  return valor === true || valor === "true" || valor === "si" || valor === "on";
}

export function guardarLocalJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar ${clave} en localStorage.`, error);
    return false;
  }
}

export function leerLocalJSON(clave, defecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : defecto;
  } catch (error) {
    console.warn(`No se pudo leer ${clave} desde localStorage.`, error);
    return defecto;
  }
}

export function eliminarLocal(clave) {
  localStorage.removeItem(clave);
}

export function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce(callback, delay = 300) {
  let timeout = null;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
}

export function ordenarPorFechaDesc(items = [], campo = "fecha") {
  return [...items].sort((a, b) => {
    const fechaA = new Date(a[campo] || a.creadoEn || 0).getTime();
    const fechaB = new Date(b[campo] || b.creadoEn || 0).getTime();
    return fechaB - fechaA;
  });
}

export function obtenerUltimo(items = []) {
  return Array.isArray(items) && items.length ? items[0] : null;
}

export function limitarTexto(texto, max = 120) {
  const limpio = String(texto || "").trim();

  if (limpio.length <= max) {
    return limpio;
  }

  return `${limpio.slice(0, max - 1)}…`;
}

export function crearElementoDesdeHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function descargarTexto(nombreArchivo, contenido, tipo = "text/plain") {
  const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
