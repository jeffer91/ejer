/*
  Nombre completo: features.registry.js
  Ruta o ubicacion: src/features/features.registry.js

  Funcion o funciones:
    - Registrar todas las funcionalidades principales de FitJeff.
    - Centralizar el menu y el montaje de cada modulo.
    - Definir Hoy como primera pantalla de Control corporal.
    - Permitir agregar futuras funcionalidades sin tocar app-router.js.

  Se conecta con:
    - src/shell/shell.menu.config.js
    - src/app/app-router.js
    - src/features/control-corporal/control-corporal.menu.js
    - src/features/control-corporal/control-corporal.module.js
    - src/features/entrenamiento/entrenamiento.menu.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { CONTROL_CORPORAL_MENU, CONTROL_CORPORAL_MODULE_ID } from "./control-corporal/control-corporal.menu.js";
import { CONTROL_CORPORAL_ROUTES } from "./control-corporal/control-corporal.routes.js";
import { esRutaControlCorporal, montarPantallaControlCorporal } from "./control-corporal/control-corporal.module.js";
import { ENTRENAMIENTO_MENU, ENTRENAMIENTO_MODULE_ID } from "./entrenamiento/entrenamiento.menu.js";
import { esRutaEntrenamiento, montarPantallaEntrenamiento } from "./entrenamiento/entrenamiento.module.js";

export const FEATURE_MODULES = [
  CONTROL_CORPORAL_MENU,
  ENTRENAMIENTO_MENU
];

export const FEATURE_DEFAULT_MODULE_ID = CONTROL_CORPORAL_MODULE_ID;
export const FEATURE_DEFAULT_ROUTE_ID = CONTROL_CORPORAL_ROUTES.HOY;

const FEATURE_MOUNTERS = [
  {
    id: CONTROL_CORPORAL_MODULE_ID,
    aceptaRuta: esRutaControlCorporal,
    montar: montarPantallaControlCorporal
  },
  {
    id: ENTRENAMIENTO_MODULE_ID,
    aceptaRuta: esRutaEntrenamiento,
    montar: montarPantallaEntrenamiento
  }
];

export function esRutaFeature(rutaId) {
  return FEATURE_MOUNTERS.some((feature) => feature.aceptaRuta(rutaId));
}

export function montarPantallaFeature(rutaId, contenedor, opciones = {}) {
  const feature = FEATURE_MOUNTERS.find((item) => item.aceptaRuta(rutaId));

  if (!feature) {
    return null;
  }

  return feature.montar(rutaId, contenedor, opciones);
}
