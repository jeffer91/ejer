/*
  Nombre completo: control-corporal.routes.js
  Ruta o ubicacion: src/features/control-corporal/control-corporal.routes.js

  Funcion o funciones:
    - Definir las rutas internas de Control corporal.
    - Evitar rutas escritas manualmente en varios archivos.
    - Preparar el modulo para crecer sin tocar el shell global.
    - Agregar Hoy como pantalla principal simple tipo entrenador.

  Se conecta con:
    - src/features/control-corporal/control-corporal.menu.js
    - src/features/control-corporal/control-corporal.module.js
    - src/app/app-router.js
*/

export const CONTROL_CORPORAL_ROUTES = {
  HOY: "hoy",
  ESTADISTICAS: "estadisticas",
  REGISTRO: "registro",
  GUIA_MEDIDAS: "guia-medidas",
  HISTORIAL: "historial"
};

export const CONTROL_CORPORAL_ROUTE_ITEMS = [
  {
    id: CONTROL_CORPORAL_ROUTES.HOY,
    label: "Hoy",
    shortLabel: "Hoy",
    description: "Qué debes hacer hoy"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.REGISTRO,
    label: "Registrar datos",
    shortLabel: "Registrar",
    description: "Agregar peso y medidas"
  },
  {
    id: CONTROL_CORPORAL_ROUTES.ESTADISTICAS,
    label: "Progreso",
    shortLabel: "Progreso",
    description: "Resumen de peso y medidas"
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
