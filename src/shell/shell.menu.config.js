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
*/

export const SHELL_DEFAULT_MODULE_ID = "control-corporal";
export const SHELL_DEFAULT_ROUTE_ID = "estadisticas";
export const SHELL_ONBOARDING_ROUTE_ID = "inicio";

export const SHELL_MODULES = [
  {
    id: "control-corporal",
    label: "Control corporal",
    shortLabel: "Corporal",
    description: "Peso, medidas, progreso e historial.",
    defaultRoute: "estadisticas",
    status: "Datos al día",
    routes: [
      {
        id: "estadisticas",
        label: "Estadísticas",
        shortLabel: "Stats",
        description: "Resumen y progreso"
      },
      {
        id: "registro",
        label: "Registro",
        shortLabel: "Registro",
        description: "Peso y medidas"
      },
      {
        id: "historial",
        label: "Historial",
        shortLabel: "Historial",
        description: "Cambios guardados"
      }
    ]
  },
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
