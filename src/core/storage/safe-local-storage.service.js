/*
  Nombre completo: safe-local-storage.service.js
  Ruta o ubicación: src/core/storage/safe-local-storage.service.js

  Función o funciones:
    - Leer, guardar y eliminar datos locales con protección básica ante errores.
    - Evitar que un JSON dañado rompa la app completa.
    - Devolver valores seguros cuando localStorage no esté disponible.
    - Centralizar lectura por prefijo para backups y restauraciones.

  Se conecta con:
    - src/core/status/app-status.service.js
    - src/core/diagnostics/app-diagnostics.service.js
    - src/core/backup/backup-local.service.js
    - src/core/backup/backup-restore.service.js
    - repositorios locales de FitJeff.
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

  function listarClaves(prefijo = "") {
    if (!disponible) {
      return [];
    }

    try {
      return Object.keys(localStorage).filter((clave) => String(clave).startsWith(prefijo));
    } catch {
      return [];
    }
  }

  function leerMapaTextoPorPrefijo(prefijo = "", excluir = []) {
    const excluidas = new Set(excluir);

    return listarClaves(prefijo).reduce((datos, clave) => {
      if (!excluidas.has(clave)) {
        datos[clave] = leerTexto(clave, "");
      }
      return datos;
    }, {});
  }

  function eliminarPorPrefijo(prefijo = "", excluir = []) {
    const excluidas = new Set(excluir);
    let total = 0;

    listarClaves(prefijo).forEach((clave) => {
      if (!excluidas.has(clave) && eliminar(clave)) {
        total += 1;
      }
    });

    return total;
  }

  return {
    disponible,
    leerTexto,
    guardarTexto,
    leerJson,
    guardarJson,
    eliminar,
    listarClaves,
    leerMapaTextoPorPrefijo,
    eliminarPorPrefijo
  };
}
