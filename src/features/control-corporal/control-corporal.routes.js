/*
  Nombre completo: control-corporal.routes.js
  Ruta o ubicación: src/features/control-corporal/control-corporal.routes.js

  Función o funciones:
    - Definir las rutas internas de Control corporal.
    - Evitar rutas escritas manualmente en varios archivos.
    - Preparar el módulo para crecer sin tocar el shell global.
    - Agregar acceso directo a la guía visual de medidas corporales.

  Se conecta con:
    - src/features/control-corporal/control-corporal.menu.js
    - src/features/control-corporal/control-corporal.module.js
    - src/app/app-router.js
*/

export const CONTROL_CORPORAL_ROUTES = {
  ESTADISTICAS: "estadisticas",
  REGISTRO: "registro",
  GUIA_MEDIDAS: "guia-medidas",
  HISTORIAL: "historial"
};

export const CONTROL_CORPORAL_ROUTE_ITEMS = [
  {
    id: CONTROL_CORPORAL_ROUTES.ESTADISTICAS,
    label: "Progreso",
    shortLabel: "Progreso",
    description: "Resumen de peso y medidas"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.REGISTRO,
    label: "Registrar datos",
    shortLabel: "Registrar",
    description: "Agregar peso y medidas"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.GUIA_MEDIDAS,
    label: "Guía de medidas",
    shortLabel: "Guía",
    description: "Dónde y cómo medirte"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.HISTORIAL,
    label: "Historial",
    shortLabel: "Historial",
    description: "Ver registros guardados"
  }
];

export function esRutaControlCorporal(rutaId) {
  return Object.values(CONTROL_CORPORAL_ROUTES).includes(rutaId);
}
