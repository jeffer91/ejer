/*
  Nombre completo: template.menu.js
  Ruta o ubicación: src/features/_template/template.menu.js

  Función o funciones:
    - Definir cómo aparece una funcionalidad nueva en el menú superior.
    - Servir como plantilla para registrar módulos futuros.
*/

import { TEMPLATE_ROUTE_ITEMS, TEMPLATE_ROUTES } from "./template.routes.js";

export const TEMPLATE_MODULE_ID = "template";

export const TEMPLATE_MENU = {
  id: TEMPLATE_MODULE_ID,
  label: "Nueva funcionalidad",
  shortLabel: "Nueva",
  description: "Descripción corta del módulo.",
  defaultRoute: TEMPLATE_ROUTES.PRINCIPAL,
  status: "Listo",
  routes: TEMPLATE_ROUTE_ITEMS
};
