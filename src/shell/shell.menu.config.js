/*
  Nombre completo: shell.menu.config.js
  Ruta o ubicación: src/shell/shell.menu.config.js

  Función o funciones:
    - Registrar los módulos visibles en el menú superior de FitJeff.
    - Cargar funcionalidades desde src/features/features.registry.js.
    - Mantener Sistema separado de las funcionalidades principales.

  Se conecta con:
    - src/shell/shell.router.js
    - src/shell/shell.controller.js
    - src/app/app-router.js
    - src/features/features.registry.js
*/

import { FEATURE_DEFAULT_MODULE_ID, FEATURE_DEFAULT_ROUTE_ID, FEATURE_MODULES } from "../features/features.registry.js";

export const SHELL_DEFAULT_MODULE_ID = FEATURE_DEFAULT_MODULE_ID;
export const SHELL_DEFAULT_ROUTE_ID = FEATURE_DEFAULT_ROUTE_ID;
export const SHELL_ONBOARDING_ROUTE_ID = "inicio";

const SYSTEM_MODULE = {
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
};

export const SHELL_MODULES = [
  ...FEATURE_MODULES,
  SYSTEM_MODULE
];
