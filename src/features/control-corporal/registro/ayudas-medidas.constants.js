/*
  Nombre completo: ayudas-medidas.constants.js
  Ruta o ubicacion: src/features/control-corporal/registro/ayudas-medidas.constants.js

  Funcion o funciones:
    - Centralizar las explicaciones cortas de peso y medidas.
    - Alimentar los botones de ayuda ? dentro de Registro.
    - Evitar una pantalla extra para aclaraciones basicas de medicion.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.view.js
    - src/features/control-corporal/registro/mapa-corporal.view.js
*/

export const AYUDAS_MEDIDAS = Object.freeze({
  pesoKg: {
    titulo: "Peso",
    texto: "Pésate en una condición parecida cada vez: de preferencia en la mañana y con ropa ligera."
  },
  cinturaCm: {
    titulo: "Cintura",
    texto: "Mide alrededor de la cintura, cerca del ombligo, sin apretar la cinta."
  },
  abdomenCm: {
    titulo: "Abdomen",
    texto: "Mide la zona más sobresaliente del abdomen, manteniendo la cinta recta."
  },
  pechoCm: {
    titulo: "Pecho",
    texto: "Pasa la cinta alrededor del pecho, a la altura media, con postura natural."
  },
  brazoCm: {
    titulo: "Brazo",
    texto: "Mide el contorno del brazo en la parte media, siempre del mismo lado."
  },
  piernaCm: {
    titulo: "Pierna",
    texto: "Mide el contorno del muslo en su parte media, sin apretar la cinta."
  },
  caderaCm: {
    titulo: "Cadera",
    texto: "Mide alrededor de la parte más ancha de la cadera, con la cinta nivelada."
  },
  fecha: {
    titulo: "Fecha",
    texto: "Usa la fecha real en que tomaste las medidas para que el historial sea confiable."
  }
});

export function obtenerAyudaMedida(campo) {
  return AYUDAS_MEDIDAS[campo] || null;
}
