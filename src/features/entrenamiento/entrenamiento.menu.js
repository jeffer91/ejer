/*
  Nombre completo: entrenamiento.menu.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.menu.js

  Función o funciones:
    - Definir cómo aparece Entrenamiento en el menú superior de FitJeff.
    - Centralizar nombre, descripción, estado y submenú interno.
    - Mantener el módulo separado de Control corporal y Sistema.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.routes.js
    - src/features/features.registry.js
*/

import { ENTRENAMIENTO_ROUTE_ITEMS, ENTRENAMIENTO_ROUTES } from "./entrenamiento.routes.js";

export const ENTRENAMIENTO_MODULE_ID = "entrenamiento";

export const ENTRENAMIENTO_MENU = {
  id: ENTRENAMIENTO_MODULE_ID,
  label: "Entrenamiento",
  shortLabel: "Entreno",
  description: "Rutinas, diario, cardio e IA.",
  defaultRoute: ENTRENAMIENTO_ROUTES.STATS,
  status: "Listo para entrenar",
  routes: ENTRENAMIENTO_ROUTE_ITEMS
};
