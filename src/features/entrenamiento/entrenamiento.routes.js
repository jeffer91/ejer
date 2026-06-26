/*
  Nombre completo: entrenamiento.routes.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.routes.js

  Función o funciones:
    - Definir las rutas internas del módulo Entrenamiento.
    - Evitar conflictos con rutas de otros módulos usando ids únicos.
    - Preparar Stats, Diario, Rutinas, HIT y Ajustes.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.menu.js
    - src/features/entrenamiento/entrenamiento.module.js
    - src/features/features.registry.js
*/

export const ENTRENAMIENTO_ROUTES = {
  STATS: "entrenamiento-stats",
  DIARIO: "entrenamiento-diario",
  RUTINAS: "entrenamiento-rutinas",
  HIT: "entrenamiento-hit",
  AJUSTES: "entrenamiento-ajustes"
};

export const ENTRENAMIENTO_ROUTE_ITEMS = [
  {
    id: ENTRENAMIENTO_ROUTES.STATS,
    label: "Estadísticas",
    shortLabel: "Stats",
    description: "Dashboard de rendimiento"
  },
  {
    id: ENTRENAMIENTO_ROUTES.DIARIO,
    label: "Diario",
    shortLabel: "Diario",
    description: "Rutina del día"
  },
  {
    id: ENTRENAMIENTO_ROUTES.RUTINAS,
    label: "Rutinas",
    shortLabel: "Rutinas",
    description: "Planes activos e inactivos"
  },
  {
    id: ENTRENAMIENTO_ROUTES.HIT,
    label: "HIT",
    shortLabel: "HIT",
    description: "Intervalos, caminata y bicicleta"
  },
  {
    id: ENTRENAMIENTO_ROUTES.AJUSTES,
    label: "Ajustes",
    shortLabel: "Ajustes",
    description: "Gemini, voz y conexión"
  }
];

export function esRutaEntrenamiento(rutaId) {
  return Object.values(ENTRENAMIENTO_ROUTES).includes(rutaId);
}
