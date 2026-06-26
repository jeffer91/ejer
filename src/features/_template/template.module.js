/*
  Nombre completo: template.module.js
  Ruta o ubicación: src/features/_template/template.module.js

  Función o funciones:
    - Concentrar el montaje de pantallas de una funcionalidad nueva.
    - Servir como entrada única para el router de funcionalidades.
*/

import { TEMPLATE_ROUTES, esRutaTemplate } from "./template.routes.js";
import { crearTemplatePrincipalController } from "./pantalla-principal/pantalla-principal.controller.js";

export { TEMPLATE_ROUTES, esRutaTemplate };

export function montarPantallaTemplate(rutaId, contenedor, opciones = {}) {
  if (rutaId === TEMPLATE_ROUTES.PRINCIPAL) {
    const controller = crearTemplatePrincipalController(opciones);
    controller.montar(contenedor);
    return controller;
  }

  const controller = crearTemplatePrincipalController(opciones);
  controller.montar(contenedor);
  return controller;
}
