/*
  Nombre completo: ayudas-medidas.constants.js
  Ruta o ubicacion: src/features/control-corporal/registro/ayudas-medidas.constants.js

  Funcion o funciones:
    - Centralizar explicaciones cortas de peso y medidas.
    - Alimentar el texto breve de los botones de ayuda ? dentro de Registro.
    - Complementar el popup visual de medidas sin duplicar toda la explicación.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.view.js
    - src/features/control-corporal/registro/mapa-corporal.view.js
    - src/features/control-corporal/registro/medidas-modal/medidas-modal.constants.js
*/

export const AYUDAS_MEDIDAS = Object.freeze({
  pesoKg: {
    titulo: "Peso",
    texto: "Usa condiciones parecidas cada vez. El botón ? abre una guía visual y consejos."
  },
  cuelloCm: {
    titulo: "Cuello",
    texto: "Mide alrededor del cuello, sin apretar. Ayuda a mejorar el análisis corporal."
  },
  cinturaCm: {
    titulo: "Cintura",
    texto: "Cerca del ombligo, cinta horizontal, sin apretar. Abre ? para ver el punto exacto."
  },
  abdomenCm: {
    titulo: "Abdomen",
    texto: "Parte más sobresaliente del abdomen. Abre ? para diferenciarlo de cintura."
  },
  pechoCm: {
    titulo: "Pecho",
    texto: "Contorno del pecho con postura natural. Abre ? para ver altura y postura."
  },
  brazoCm: {
    titulo: "Brazo",
    texto: "Parte media del brazo y siempre el mismo lado. Abre ? para verlo en el muñeco."
  },
  piernaCm: {
    titulo: "Pierna",
    texto: "Muslo a media altura, misma pierna y cinta sin apretar. Abre ? para guía visual."
  },
  caderaCm: {
    titulo: "Cadera",
    texto: "Parte más ancha de la cadera, cinta nivelada. Abre ? para ver referencia."
  },
  fecha: {
    titulo: "Fecha",
    texto: "Usa la fecha real de la medición para que el historial sea confiable."
  }
});

export function obtenerAyudaMedida(campo) {
  return AYUDAS_MEDIDAS[campo] || null;
}
