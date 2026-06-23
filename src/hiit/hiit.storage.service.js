/*
  Nombre completo: hiit.storage.service.js
  Ruta o ubicación: src/hiit/hiit.storage.service.js
*/

const STORAGE_KEY = "fitjeff_hiit_sesiones";

export function obtenerSesionesHIIT() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(datos)
      ? datos.sort((a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)))
      : [];
  } catch (_) {
    return [];
  }
}

export function guardarSesionHIIT(datos = {}) {
  const sesion = {
    id: datos.id || `hiit_${Date.now()}`,
    rutinaId: datos.rutinaId || "",
    rutinaNombre: datos.rutinaNombre || "HIIT",
    duracionSegundos: Number(datos.duracionSegundos || 0),
    completado: datos.completado !== false,
    energiaInicial: datos.energiaInicial || "",
    energiaFinal: datos.energiaFinal || "",
    observacion: datos.observacion || "",
    creadoEn: datos.creadoEn || new Date().toISOString()
  };

  const sesiones = [sesion, ...obtenerSesionesHIIT()].slice(0, 80);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesiones));

  return {
    ok: true,
    mensaje: "Sesión HIIT guardada.",
    sesion,
    sesiones
  };
}

export function eliminarSesionHIIT(id) {
  const sesiones = obtenerSesionesHIIT().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesiones));

  return {
    ok: true,
    mensaje: "Sesión HIIT eliminada.",
    sesiones
  };
}

export function resumenHIIT() {
  const sesiones = obtenerSesionesHIIT();
  const totalSegundos = sesiones.reduce((total, item) => total + Number(item.duracionSegundos || 0), 0);

  return {
    sesiones: sesiones.length,
    minutos: Math.round(totalSegundos / 60),
    ultima: sesiones[0] || null
  };
}
