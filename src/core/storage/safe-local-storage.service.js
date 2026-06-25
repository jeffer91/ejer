/*
  Nombre completo: safe-local-storage.service.js
  Ruta o ubicación: src/core/storage/safe-local-storage.service.js

  Función o funciones:
    - Leer y guardar datos locales con protección básica ante errores.
    - Evitar que un JSON dañado rompa la app completa.
    - Devolver valores seguros cuando localStorage no esté disponible.

  Se conecta con:
    - src/core/status/app-status.service.js
    - src/core/diagnostics/app-diagnostics.service.js
    - futuros repositorios y sincronización con Firebase.
*/

function localStorageDisponible() {
  try {
    const clave = "fitjeff:test-storage";
    localStorage.setItem(clave, "ok");
    localStorage.removeItem(clave);
    return true;
  } catch {
    return false;
  }
}

export function crearSafeLocalStorageService() {
  const disponible = localStorageDisponible();

  function leerTexto(clave, valorDefecto = "") {
    if (!disponible) {
      return valorDefecto;
    }

    try {
      const valor = localStorage.getItem(clave);
      return valor === null ? valorDefecto : valor;
    } catch {
      return valorDefecto;
    }
  }

  function guardarTexto(clave, valor) {
    if (!disponible) {
      return false;
    }

    try {
      localStorage.setItem(clave, String(valor));
      return true;
    } catch {
      return false;
    }
  }

  function leerJson(clave, valorDefecto) {
    const texto = leerTexto(clave, "");

    if (!texto) {
      return valorDefecto;
    }

    try {
      return JSON.parse(texto);
    } catch {
      return valorDefecto;
    }
  }

  function guardarJson(clave, valor) {
    return guardarTexto(clave, JSON.stringify(valor));
  }

  function eliminar(clave) {
    if (!disponible) {
      return false;
    }

    try {
      localStorage.removeItem(clave);
      return true;
    } catch {
      return false;
    }
  }

  return {
    disponible,
    leerTexto,
    guardarTexto,
    leerJson,
    guardarJson,
    eliminar
  };
}
