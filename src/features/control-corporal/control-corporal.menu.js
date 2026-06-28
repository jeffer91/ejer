/*
  Nombre completo: control-corporal.menu.js
  Ruta o ubicacion: src/features/control-corporal/control-corporal.menu.js

  Funcion o funciones:
    - Definir el modulo principal Control corporal.
    - Centralizar su nombre, descripcion y submenu interno.
    - Abrir Hoy como pantalla principal simple para el usuario.
    - Facilitar que el shell global cargue este modulo sin mezclarlo con otros.

  Se conecta con:
    - src/shell/shell.menu.config.js
    - src/features/control-corporal/control-corporal.routes.js
*/

import { CONTROL_CORPORAL_ROUTE_ITEMS, CONTROL_CORPORAL_ROUTES } from "./control-corporal.routes.js";

export const CONTROL_CORPORAL_MODULE_ID = "control-corporal";

export const CONTROL_CORPORAL_MENU = {
  id: CONTROL_CORPORAL_MODULE_ID,
  label: "Control corporal",
  shortLabel: "Corporal",
  description: "Peso, medidas y evolución personal.",
  defaultRoute: CONTROL_CORPORAL_ROUTES.HOY,
  status: "Listo para hoy",
  routes: CONTROL_CORPORAL_ROUTE_ITEMS
};
