import { ACTIVIDAD_ROUTE_ITEMS, ACTIVIDAD_ROUTES } from "./actividad.routes.js";

export const ACTIVIDAD_MODULE_ID = "actividad";

export const ACTIVIDAD_MENU = {
  id: ACTIVIDAD_MODULE_ID,
  label: "Actividad",
  shortLabel: "Actividad",
  description: "Pasos, bicicleta y conexiones preparadas.",
  defaultRoute: ACTIVIDAD_ROUTES.RESUMEN,
  status: "Manual y conexiones",
  routes: ACTIVIDAD_ROUTE_ITEMS
};
