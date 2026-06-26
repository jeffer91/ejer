/*
  Nombre completo: control-corporal.routes.js
  Ruta o ubicación: src/features/control-corporal/control-corporal.routes.js

  Función o funciones:
    - Definir las rutas internas de Control corporal.
    - Evitar rutas escritas manualmente en varios archivos.
    - Preparar el módulo para crecer sin tocar el shell global.

  Se conecta con:
    - src/features/control-corporal/control-corporal.menu.js
    - src/features/control-corporal/control-corporal.module.js
    - src/app/app-router.js
*/

export const CONTROL_CORPORAL_ROUTES = {
  ESTADISTICAS: "estadisticas",
  REGISTRO: "registro",
  HISTORIAL: "historial"
};

export const CONTROL_CORPORAL_ROUTE_ITEMS = [
  {
    id: CONTROL_CORPORAL_ROUTES.ESTADISTICAS,
    label: "Estadísticas",
    shortLabel: "Stats",
    description: "Resumen y progreso"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.REGISTRO,
    label: "Registro",
    shortLabel: "Registro",
    description: "Peso y medidas"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.HISTORIAL,
    label: "Historial",
    shortLabel: "Historial",
    description: "Cambios guardados"
  }
];

export function esRutaControlCorporal(rutaId) {
  return Object.values(CONTROL_CORPORAL_ROUTES).includes(rutaId);
}
