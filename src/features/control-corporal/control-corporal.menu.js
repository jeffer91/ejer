/*
  Nombre completo: control-corporal.menu.js
  Ruta o ubicación: src/features/control-corporal/control-corporal.menu.js

  Función o funciones:
    - Definir el módulo principal Control corporal.
    - Centralizar su nombre, descripción y submenú interno.
    - Facilitar que el shell global cargue este módulo sin mezclarlo con otros.

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
  description: "Peso, medidas, progreso e historial.",
  defaultRoute: CONTROL_CORPORAL_ROUTES.ESTADISTICAS,
  status: "Datos al día",
  routes: CONTROL_CORPORAL_ROUTE_ITEMS
};
