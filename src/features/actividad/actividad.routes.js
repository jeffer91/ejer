export const ACTIVIDAD_ROUTES = {
  RESUMEN: "actividad-resumen",
  REGISTRO: "actividad-registro",
  DISPOSITIVOS: "actividad-dispositivos"
};

export const ACTIVIDAD_ROUTE_ITEMS = [
  {
    id: ACTIVIDAD_ROUTES.RESUMEN,
    label: "Resumen",
    shortLabel: "Resumen",
    description: "Pasos y bicicleta"
  },
  {
    id: ACTIVIDAD_ROUTES.REGISTRO,
    label: "Registrar",
    shortLabel: "Registrar",
    description: "Agregar actividad manual"
  },
  {
    id: ACTIVIDAD_ROUTES.DISPOSITIVOS,
    label: "Dispositivos",
    shortLabel: "Dispositivos",
    description: "Cubitt CT4 y Google Fit"
  }
];

export function esRutaActividad(rutaId) {
  return Object.values(ACTIVIDAD_ROUTES).includes(rutaId);
}
