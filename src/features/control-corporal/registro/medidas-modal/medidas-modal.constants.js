export const MEDIDAS_MODAL_TEXTOS = Object.freeze({
  TITULO: "Guía visual de medición",
  SUBTITULO: "Mira el punto exacto, coloca la cinta nivelada y repite siempre igual.",
  CERRAR: "Cerrar guía"
});

export const MEDIDAS_MODAL_INFO = Object.freeze({
  pesoKg: {
    titulo: "Peso",
    zona: "bascula",
    resumen: "Pésate en condiciones parecidas para comparar mejor tus cambios.",
    donde: "Usa una balanza firme, en el mismo lugar y, si puedes, en la mañana.",
    como: "Párate quieto, con ropa ligera y sin sostener objetos.",
    cinta: "No aplica cinta métrica.",
    evitar: "Evita compararte en horarios distintos si comiste, entrenaste o bebiste mucha agua antes.",
    consejo: "Lo más útil no es un peso aislado, sino la tendencia de varios registros."
  },
  cuelloCm: {
    titulo: "Cuello",
    zona: "cuello",
    resumen: "Mide alrededor del cuello, con la cinta recta y sin apretar.",
    donde: "Coloca la cinta alrededor de la parte media del cuello, por debajo de la nuez o zona más prominente.",
    como: "Mira al frente, hombros relajados y cuello en posición natural.",
    cinta: "La cinta debe tocar la piel o ropa fina, sin hundirse ni quedar floja.",
    evitar: "No inclines la cabeza ni midas justo debajo de la mandíbula.",
    consejo: "Cuello junto con cintura ayuda a que el análisis no dependa solo del IMC."
  },
  cinturaCm: {
    titulo: "Cintura",
    zona: "cintura",
    resumen: "Mide alrededor del abdomen cerca del ombligo, sin apretar.",
    donde: "Coloca la cinta alrededor del cuerpo a la altura del ombligo o apenas por encima, siempre en el mismo punto.",
    como: "Párate relajado, respira normal y no metas el abdomen.",
    cinta: "La cinta debe quedar horizontal, pegada a la piel o ropa fina, pero sin hundirse.",
    evitar: "No subas la cinta a las costillas ni la bajes a la cadera.",
    consejo: "Esta medida ayuda más que el peso para ver cambios en grasa abdominal."
  },
  abdomenCm: {
    titulo: "Abdomen",
    zona: "abdomen",
    resumen: "Mide la parte más sobresaliente del abdomen con la cinta recta.",
    donde: "Ubica el punto donde el abdomen sobresale más de perfil y rodea esa zona.",
    como: "Mantén postura natural, abdomen relajado y mirada al frente.",
    cinta: "La cinta debe rodear el abdomen como una línea horizontal, sin inclinarse hacia arriba o abajo.",
    evitar: "No aprietes la cinta para bajar centímetros artificialmente.",
    consejo: "Si dudas entre cintura y abdomen: cintura va cerca del ombligo; abdomen va en la parte más sobresaliente."
  },
  pechoCm: {
    titulo: "Pecho",
    zona: "pecho",
    resumen: "Mide el contorno del pecho a la altura media, con postura natural.",
    donde: "Pasa la cinta alrededor del pecho, aproximadamente por la zona media del torso.",
    como: "Mantén hombros relajados, brazos abajo y respiración normal.",
    cinta: "La cinta debe quedar recta en la espalda y al frente, sin comprimir el pecho.",
    evitar: "No infles el pecho ni levantes los hombros durante la medición.",
    consejo: "Hazlo siempre con la misma postura para que el progreso sea comparable."
  },
  brazoCm: {
    titulo: "Brazo",
    zona: "brazo",
    resumen: "Mide el contorno del brazo en la parte media y siempre del mismo lado.",
    donde: "Elige un brazo y mide la zona media entre hombro y codo.",
    como: "Puedes medir relajado. Si alguna vez mides contraído, usa siempre esa misma forma.",
    cinta: "La cinta debe rodear el brazo sin dejar espacio y sin apretar la piel.",
    evitar: "No cambies de brazo cada semana porque puede alterar el seguimiento.",
    consejo: "Anota mentalmente si mediste relajado o contraído y repite igual."
  },
  piernaCm: {
    titulo: "Pierna",
    zona: "pierna",
    resumen: "Mide el muslo en la parte media, sin apretar la cinta.",
    donde: "Mide el contorno del muslo a media altura entre cadera y rodilla.",
    como: "Párate con el peso repartido en ambas piernas y la pierna relajada.",
    cinta: "La cinta debe rodear el muslo en línea horizontal.",
    evitar: "No midas muy cerca de la rodilla ni en la parte más alta del muslo si no lo harás siempre igual.",
    consejo: "Usa siempre la misma pierna y el mismo punto de referencia."
  },
  caderaCm: {
    titulo: "Cadera",
    zona: "cadera",
    resumen: "Mide la parte más ancha de la cadera con la cinta nivelada.",
    donde: "Rodea la cadera por la zona más ancha, normalmente pasando por glúteos.",
    como: "Párate recto, pies separados de forma natural y sin tensionar la postura.",
    cinta: "La cinta debe estar nivelada al frente y atrás, sin subirse por un lado.",
    evitar: "No midas solo la cintura baja; busca la parte más ancha de la cadera.",
    consejo: "Mide frente a un espejo si puedes para comprobar que la cinta esté recta."
  },
  fecha: {
    titulo: "Fecha",
    zona: "fecha",
    resumen: "Usa la fecha real en que tomaste las medidas.",
    donde: "Selecciona el día exacto del registro.",
    como: "Si mediste hoy, deja la fecha de hoy. Si copias una medición anterior, cambia la fecha.",
    cinta: "No aplica cinta métrica.",
    evitar: "No guardes medidas antiguas con fecha actual porque puede alterar el progreso.",
    consejo: "La fecha correcta hace que el historial y la tendencia sean más confiables."
  }
});

export function obtenerMedidaModalInfo(campo) {
  return MEDIDAS_MODAL_INFO[campo] || MEDIDAS_MODAL_INFO.cinturaCm;
}
