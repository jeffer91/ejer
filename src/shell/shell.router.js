/*
  Nombre completo: shell.router.js
  Ruta o ubicación: src/shell/shell.router.js

  Función o funciones:
    - Resolver a qué módulo pertenece cada pantalla.
    - Entregar rutas por defecto para cada módulo.
    - Validar rutas antes de renderizar para evitar pantallas inexistentes.

  Se conecta con:
    - src/shell/shell.menu.config.js
    - src/app/app-router.js
    - src/shell/shell.controller.js
*/

import {
  SHELL_DEFAULT_MODULE_ID,
  SHELL_DEFAULT_ROUTE_ID,
  SHELL_MODULES
} from "./shell.menu.config.js";

export function obtenerModuloShell(moduloId, modulos = SHELL_MODULES) {
  return modulos.find((modulo) => modulo.id === moduloId) || null;
}

export function obtenerUbicacionPorRutaShell(rutaId, modulos = SHELL_MODULES) {
  for (const modulo of modulos) {
    const ruta = modulo.routes.find((rutaItem) => rutaItem.id === rutaId);

    if (ruta) {
      return {
        moduloId: modulo.id,
        rutaId: ruta.id,
        modulo,
        ruta
      };
    }
  }

  return null;
}

export function obtenerRutaPorDefectoShell(moduloId = SHELL_DEFAULT_MODULE_ID, modulos = SHELL_MODULES) {
  const modulo = obtenerModuloShell(moduloId, modulos) || obtenerModuloShell(SHELL_DEFAULT_MODULE_ID, modulos);

  if (!modulo) {
    return SHELL_DEFAULT_ROUTE_ID;
  }

  return modulo.defaultRoute || modulo.routes?.[0]?.id || SHELL_DEFAULT_ROUTE_ID;
}

export function resolverUbicacionShell(ubicacion = {}, modulos = SHELL_MODULES) {
  const ubicacionPorRuta = obtenerUbicacionPorRutaShell(ubicacion.rutaId, modulos);

  if (ubicacionPorRuta) {
    return ubicacionPorRuta;
  }

  const moduloId = ubicacion.moduloId || SHELL_DEFAULT_MODULE_ID;
  const rutaPorDefecto = obtenerRutaPorDefectoShell(moduloId, modulos);
  const ubicacionPorDefecto = obtenerUbicacionPorRutaShell(rutaPorDefecto, modulos);

  if (ubicacionPorDefecto) {
    return ubicacionPorDefecto;
  }

  return obtenerUbicacionPorRutaShell(SHELL_DEFAULT_ROUTE_ID, modulos);
}

export function obtenerRutasShell(modulos = SHELL_MODULES) {
  return modulos.flatMap((modulo) => modulo.routes.map((ruta) => ruta.id));
}
