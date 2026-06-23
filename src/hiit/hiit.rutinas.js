/*
  Nombre completo: hiit.rutinas.js
  Ruta o ubicación: src/hiit/hiit.rutinas.js
*/

export const HIIT_RUTINAS = [
  {
    id: "bicicleta-basica",
    nombre: "HIIT bicicleta básica",
    categoria: "bicicleta",
    duracionTexto: "15 a 20 minutos",
    descripcion: "Intervalos simples para bicicleta estática o bicicleta normal en zona segura.",
    instrucciones: ["Calienta 5 minutos suave.", "Haz 10 intervalos.", "Finaliza 3 a 5 minutos suave."],
    pasos: [
      { tipo: "calentamiento", nombre: "Calentamiento suave", segundos: 300, voz: "Calentamiento suave, cinco minutos." },
      ...repetir([
        { tipo: "fuerte", nombre: "Pedaleo fuerte", segundos: 20, voz: "Fuerte, veinte segundos." },
        { tipo: "suave", nombre: "Pedaleo suave", segundos: 40, voz: "Suave, cuarenta segundos." }
      ], 10),
      { tipo: "final", nombre: "Vuelta a la calma", segundos: 240, voz: "Vuelta a la calma." }
    ]
  },
  {
    id: "bicicleta-exigente",
    nombre: "HIIT bicicleta más exigente",
    categoria: "bicicleta",
    duracionTexto: "20 minutos",
    descripcion: "Intervalos más largos, solo si te sientes bien y controlado.",
    instrucciones: ["Calienta 5 minutos.", "Haz 10 intervalos.", "Finaliza 5 minutos suave."],
    pasos: [
      { tipo: "calentamiento", nombre: "Calentamiento suave", segundos: 300, voz: "Calentamiento suave." },
      ...repetir([
        { tipo: "fuerte", nombre: "Pedaleo rápido y fuerte", segundos: 30, voz: "Fuerte, treinta segundos." },
        { tipo: "suave", nombre: "Pedaleo suave", segundos: 60, voz: "Suave, un minuto." }
      ], 10),
      { tipo: "final", nombre: "Vuelta a la calma", segundos: 300, voz: "Final suave, cinco minutos." }
    ]
  },
  {
    id: "caminando",
    nombre: "HIIT caminando",
    categoria: "caminata",
    duracionTexto: "25 minutos",
    descripcion: "Ideal para hacerlo caminando sin correr.",
    instrucciones: ["Calienta 5 minutos.", "Haz 7 intervalos.", "Termina caminando suave."],
    pasos: [
      { tipo: "calentamiento", nombre: "Caminar normal", segundos: 300, voz: "Camina normal para calentar." },
      ...repetir([
        { tipo: "fuerte", nombre: "Caminar muy rápido", segundos: 60, voz: "Camina rápido, un minuto." },
        { tipo: "suave", nombre: "Caminar suave", segundos: 120, voz: "Camina suave, dos minutos." }
      ], 7),
      { tipo: "final", nombre: "Caminar suave", segundos: 300, voz: "Finaliza caminando suave." }
    ]
  },
  {
    id: "caminando-subida",
    nombre: "HIIT caminando en subida",
    categoria: "caminata",
    duracionTexto: "20 minutos",
    descripcion: "Para subida, gradas suaves o inclinación moderada.",
    instrucciones: ["Calienta 5 minutos.", "Sube rápido 30 segundos.", "Recupera 90 segundos."],
    pasos: [
      { tipo: "calentamiento", nombre: "Caminar suave", segundos: 300, voz: "Calentamiento suave." },
      ...repetir([
        { tipo: "fuerte", nombre: "Subida rápida", segundos: 30, voz: "Subida rápida, treinta segundos." },
        { tipo: "suave", nombre: "Recuperación suave", segundos: 90, voz: "Recupera suave." }
      ], 8),
      { tipo: "final", nombre: "Caminar suave", segundos: 300, voz: "Final suave." }
    ]
  },
  {
    id: "sala-sin-saltos",
    nombre: "HIIT sala sin saltos",
    categoria: "casa",
    duracionTexto: "15 minutos",
    descripcion: "Opción de bajo impacto para casa.",
    instrucciones: ["Haz 3 rondas.", "Trabaja 30 segundos.", "Descansa 30 segundos."],
    pasos: [
      { tipo: "calentamiento", nombre: "Marcha en el sitio", segundos: 180, voz: "Marcha en el sitio para calentar." },
      ...repetir([
        { tipo: "fuerte", nombre: "Sentadilla a silla", segundos: 30, voz: "Sentadilla a silla." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Pasos laterales rápidos", segundos: 30, voz: "Pasos laterales rápidos." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Puente de glúteo", segundos: 30, voz: "Puente de glúteo." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Plancha con rodillas", segundos: 30, voz: "Plancha con rodillas apoyadas." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." }
      ], 3),
      { tipo: "final", nombre: "Respirar y caminar suave", segundos: 120, voz: "Respira y camina suave." }
    ]
  },
  {
    id: "sala-intensa",
    nombre: "HIIT sala con más intensidad",
    categoria: "casa",
    duracionTexto: "15 a 18 minutos",
    descripcion: "Más intenso, úsalo solo si estás con buena energía.",
    instrucciones: ["Haz movilidad previa.", "Haz 3 rondas.", "Controla técnica siempre."],
    pasos: [
      { tipo: "calentamiento", nombre: "Movilidad", segundos: 240, voz: "Movilidad suave antes de empezar." },
      ...repetir([
        { tipo: "fuerte", nombre: "Jumping jacks", segundos: 30, voz: "Jumping jacks." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Sentadillas", segundos: 30, voz: "Sentadillas." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Mountain climbers", segundos: 30, voz: "Mountain climbers." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Zancadas alternas", segundos: 30, voz: "Zancadas alternas." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Plancha", segundos: 30, voz: "Plancha." },
        { tipo: "descanso", nombre: "Descanso", segundos: 30, voz: "Descanso." }
      ], 3),
      { tipo: "final", nombre: "Vuelta a la calma", segundos: 180, voz: "Vuelta a la calma." }
    ]
  },
  {
    id: "cuerpo-completo",
    nombre: "HIIT cuerpo completo",
    categoria: "casa",
    duracionTexto: "20 minutos",
    descripcion: "Trabajo general con ejercicios básicos.",
    instrucciones: ["Calienta 5 minutos.", "Haz 4 rondas.", "Trabaja 40 y descansa 20."],
    pasos: [
      { tipo: "calentamiento", nombre: "Calentamiento suave", segundos: 300, voz: "Calentamiento suave." },
      ...repetir([
        { tipo: "fuerte", nombre: "Sentadillas", segundos: 40, voz: "Sentadillas, cuarenta segundos." },
        { tipo: "descanso", nombre: "Descanso", segundos: 20, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Flexiones apoyadas si hace falta", segundos: 40, voz: "Flexiones, apoya rodillas si hace falta." },
        { tipo: "descanso", nombre: "Descanso", segundos: 20, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Abdominales cortos", segundos: 40, voz: "Abdominales cortos." },
        { tipo: "descanso", nombre: "Descanso", segundos: 20, voz: "Descanso." },
        { tipo: "fuerte", nombre: "Marcha rápida en sitio", segundos: 40, voz: "Marcha rápida en el sitio." },
        { tipo: "descanso", nombre: "Descanso", segundos: 20, voz: "Descanso." }
      ], 4),
      { tipo: "final", nombre: "Final suave", segundos: 180, voz: "Final suave." }
    ]
  },
  {
    id: "rapido-10",
    nombre: "HIIT rápido 10 minutos",
    categoria: "casa",
    duracionTexto: "10 minutos",
    descripcion: "Rutina corta para días con poco tiempo.",
    instrucciones: ["Calienta 2 minutos.", "Haz 8 rondas.", "Termina respirando y caminando suave."],
    pasos: [
      { tipo: "calentamiento", nombre: "Calentamiento suave", segundos: 120, voz: "Calentamiento suave, dos minutos." },
      ...[
        "Sentadillas",
        "Jumping jacks",
        "Mountain climbers",
        "Plancha",
        "Zancadas",
        "Marcha rápida",
        "Puente de glúteo",
        "Abdominales cortos"
      ].flatMap((nombre) => [
        { tipo: "fuerte", nombre, segundos: 20, voz: `${nombre}, veinte segundos.` },
        { tipo: "descanso", nombre: "Descanso", segundos: 40, voz: "Descanso, cuarenta segundos." }
      ]),
      { tipo: "final", nombre: "Respirar y caminar suave", segundos: 120, voz: "Respira y camina suave." }
    ]
  }
];

export function obtenerRutinasHIIT() {
  return HIIT_RUTINAS.map((rutina) => ({
    ...rutina,
    totalSegundos: calcularDuracionHIIT(rutina)
  }));
}

export function obtenerRutinaHIITPorId(id) {
  return obtenerRutinasHIIT().find((rutina) => rutina.id === id) || obtenerRutinasHIIT()[0];
}

export function calcularDuracionHIIT(rutina) {
  return (rutina?.pasos || []).reduce((total, paso) => total + Number(paso.segundos || 0), 0);
}

function repetir(pasos, veces) {
  const salida = [];
  for (let i = 1; i <= veces; i += 1) {
    pasos.forEach((paso) => salida.push({ ...paso, ronda: i }));
  }
  return salida;
}
