/*
  Nombre completo: entrenamiento.routes.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.routes.js

  Función o funciones:
    - Definir las rutas internas del módulo Entrenamiento.
    - Evitar conflictos con rutas de otros módulos usando ids únicos.
    - Preparar Progreso, Diario, Rutinas, HIIT y Ajustes.

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
    label: "Progreso",
    shortLabel: "Progreso",
    description: "Resumen de rendimiento"
  },
  {
    id: ENTRENAMIENTO_ROUTES.DIARIO,
    label: "Diario de entrenamiento",
    shortLabel: "Diario",
    description: "Registrar rutina de hoy"
  },
  {
    id: ENTRENAMIENTO_ROUTES.RUTINAS,
    label: "Rutinas",
    shortLabel: "Rutinas",
    description: "Planes y ejercicios"
  },
  {
    id: ENTRENAMIENTO_ROUTES.HIT,
    label: "HIIT",
    shortLabel: "HIIT",
    description: "Intervalos y cardio"
  },
  {
    id: ENTRENAMIENTO_ROUTES.AJUSTES,
    label: "Ajustes",
    shortLabel: "Ajustes",
    description: "IA, voz y preferencias"
  }
];

export function esRutaEntrenamiento(rutaId) {
  return Object.values(ENTRENAMIENTO_ROUTES).includes(rutaId);
}
