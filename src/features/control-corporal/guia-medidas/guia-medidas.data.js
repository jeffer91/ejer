/*
  Nombre completo: guia-medidas.data.js
  Ruta o ubicación: src/features/control-corporal/guia-medidas/guia-medidas.data.js

  Función o funciones:
    - Centralizar las zonas corporales recomendadas para medición.
    - Definir instrucciones claras sobre dónde medir y cómo repetir el criterio.
    - Alimentar la guía visual de medidas corporales.

  Se conecta con:
    - src/features/control-corporal/guia-medidas/guia-medidas.view.js
*/

export const GUIA_MEDIDAS_TEXTOS = Object.freeze({
  TITULO: "Guía visual de medidas",
  SUBTITULO: "Aprende qué partes medir, dónde colocar la cinta y cómo mantener un criterio fijo para comparar bien.",
  REGLA_FIJA: "Usa siempre la misma cinta, la misma postura, una presión suave y el mismo punto de referencia.",
  FRECUENCIA: "Recomendación: registra medidas cada 2 semanas o cada 4 semanas. No hace falta medirse todos los días.",
  NOTA_SEGURA: "Las medidas son una herramienta de seguimiento, no una calificación de tu cuerpo. Compáralas con tu propio historial."
});

export const GUIA_MEDIDAS_ZONAS = Object.freeze([
  {
    id: "cuello",
    nombre: "Cuello",
    lado: "frontal",
    x: 50,
    y: 17,
    registrarComo: "Referencia opcional",
    donde: "Rodea el cuello en una línea cómoda, por debajo de la nuez o zona media del cuello.",
    postura: "Cabeza recta, hombros relajados y cinta sin apretar.",
    errorComun: "Medir muy arriba o apretar la cinta.",
    frecuencia: "Opcional, cada 4 semanas si decides usarla."
  },
  {
    id: "pecho",
    nombre: "Pecho / tórax",
    lado: "frontal",
    x: 50,
    y: 29,
    registrarComo: "pechoCm",
    donde: "Rodea el torso a la altura del pecho, manteniendo la cinta horizontal.",
    postura: "De pie, respiración normal, brazos relajados a los lados.",
    errorComun: "Medir después de inflar demasiado el pecho o con la cinta inclinada.",
    frecuencia: "Cada 2 a 4 semanas."
  },
  {
    id: "brazo",
    nombre: "Brazo",
    lado: "frontal",
    x: 29,
    y: 39,
    registrarComo: "brazoCm",
    donde: "Mide la parte media del brazo, entre hombro y codo. Elige si será relajado o flexionado y repite siempre igual.",
    postura: "Brazo relajado si quieres una medida estable; flexionado solo si decides usar ese criterio siempre.",
    errorComun: "Un día medir relajado y otro día flexionado.",
    frecuencia: "Cada 2 a 4 semanas."
  },
  {
    id: "cintura",
    nombre: "Cintura",
    lado: "frontal",
    x: 50,
    y: 44,
    registrarComo: "cinturaCm",
    donde: "Mide la zona más estrecha del torso o usa siempre la altura del ombligo si te resulta más fácil repetir el punto.",
    postura: "De pie, abdomen relajado, respiración normal y cinta horizontal.",
    errorComun: "Meter el abdomen, apretar la cinta o cambiar el punto cada medición.",
    frecuencia: "Cada 2 semanas."
  },
  {
    id: "abdomen",
    nombre: "Abdomen",
    lado: "frontal",
    x: 50,
    y: 51,
    registrarComo: "abdomenCm",
    donde: "Rodea el abdomen a la altura del ombligo, usando ese punto como referencia fija.",
    postura: "Relajado, sin contener la respiración.",
    errorComun: "Medir arriba o abajo del ombligo según el día.",
    frecuencia: "Cada 2 semanas."
  },
  {
    id: "cadera",
    nombre: "Cadera",
    lado: "frontal",
    x: 50,
    y: 61,
    registrarComo: "caderaCm",
    donde: "Rodea la zona más amplia de la cadera y glúteos, manteniendo la cinta horizontal.",
    postura: "Pies al ancho de cadera y peso distribuido en ambos lados.",
    errorComun: "Inclinar la cinta o medir demasiado arriba.",
    frecuencia: "Cada 2 a 4 semanas."
  },
  {
    id: "muslo",
    nombre: "Muslo / pierna",
    lado: "frontal",
    x: 42,
    y: 74,
    registrarComo: "piernaCm",
    donde: "Mide la parte media del muslo o el punto más amplio. Elige un punto y repítelo siempre.",
    postura: "De pie, pierna relajada, sin contraer.",
    errorComun: "Cambiar entre parte media y punto más ancho.",
    frecuencia: "Cada 2 a 4 semanas."
  },
  {
    id: "pantorrilla",
    nombre: "Pantorrilla",
    lado: "posterior",
    x: 61,
    y: 86,
    registrarComo: "Referencia opcional",
    donde: "Rodea la parte más amplia de la pantorrilla.",
    postura: "De pie y con el peso equilibrado.",
    errorComun: "Medir con la pierna contraída o en diferente punto.",
    frecuencia: "Opcional, cada 4 semanas."
  }
]);

export const GUIA_MEDIDAS_PASOS = Object.freeze([
  "Mide en un momento tranquilo, preferiblemente en condiciones parecidas.",
  "Coloca la cinta horizontal y suave; no debe hundirse en la piel.",
  "Anota la fecha y usa el mismo criterio la próxima vez.",
  "No saques conclusiones por una sola medida; mira la tendencia de varias semanas."
]);
