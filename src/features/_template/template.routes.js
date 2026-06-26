/*
  Nombre completo: template.routes.js
  Ruta o ubicación: src/features/_template/template.routes.js

  Función o funciones:
    - Definir rutas internas de una funcionalidad nueva.
    - Servir como plantilla para crear nuevos módulos grandes.
*/

export const TEMPLATE_ROUTES = {
  PRINCIPAL: "template-principal"
};

export const TEMPLATE_ROUTE_ITEMS = [
  {
    id: TEMPLATE_ROUTES.PRINCIPAL,
    label: "Principal",
    shortLabel: "Inicio",
    description: "Pantalla principal"
  }
];

export function esRutaTemplate(rutaId) {
  return Object.values(TEMPLATE_ROUTES).includes(rutaId);
}
