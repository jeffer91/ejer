/*
  Nombre completo: shell.menu.config.js
  Ruta o ubicación: src/shell/shell.menu.config.js

  Función o funciones:
    - Registrar los módulos principales de FitJeff.
    - Definir submenús internos por módulo.
    - Permitir agregar nuevas funcionalidades sin reescribir el router principal.

  Se conecta con:
    - src/shell/shell.router.js
    - src/shell/shell.controller.js
    - src/app/app-router.js
    - src/features/control-corporal/control-corporal.menu.js
*/

import { CONTROL_CORPORAL_MENU, CONTROL_CORPORAL_MODULE_ID } from "../features/control-corporal/control-corporal.menu.js";
import { CONTROL_CORPORAL_ROUTES } from "../features/control-corporal/control-corporal.routes.js";

export const SHELL_DEFAULT_MODULE_ID = CONTROL_CORPORAL_MODULE_ID;
export const SHELL_DEFAULT_ROUTE_ID = CONTROL_CORPORAL_ROUTES.ESTADISTICAS;
export const SHELL_ONBOARDING_ROUTE_ID = "inicio";

export const SHELL_MODULES = [
  CONTROL_CORPORAL_MENU,
  {
    id: "sistema",
    label: "Sistema",
    shortLabel: "Sistema",
    description: "Actualizaciones, ajustes y respaldo.",
    defaultRoute: "actualizaciones",
    status: "App lista",
    routes: [
      {
        id: "actualizaciones",
        label: "Actualizaciones",
        shortLabel: "Updates",
        description: "Versiones de la app"
      },
      {
        id: "ajustes",
        label: "Ajustes",
        shortLabel: "Ajustes",
        description: "Perfil y respaldo"
      }
    ]
  }
];
