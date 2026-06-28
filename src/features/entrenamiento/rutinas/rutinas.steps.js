export const RUTINAS_STEPS = Object.freeze([
  {
    id: "ia",
    numero: 1,
    titulo: "IA",
    descripcion: "Pega una rutina generada y revísala antes de guardar."
  },
  {
    id: "manual",
    numero: 2,
    titulo: "Manual",
    descripcion: "Crea una rutina simple o ajusta lo que cargaste desde IA."
  },
  {
    id: "guardadas",
    numero: 3,
    titulo: "Guardadas",
    descripcion: "Activa, edita, duplica o archiva tus rutinas."
  }
]);

export function obtenerRutinasStep(id) {
  return RUTINAS_STEPS.find((step) => step.id === id) || RUTINAS_STEPS[0];
}
