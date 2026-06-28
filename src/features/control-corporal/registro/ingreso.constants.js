/*
  Nombre completo: ingreso.constants.js
  Ruta o ubicacion: src/features/control-corporal/registro/ingreso.constants.js

  Funcion o funciones:
    - Centralizar campos, textos y limites de la pantalla Registro / Ingreso.
    - Separar peso diario de medidas semanales.
    - Incluir cuello para análisis corporal con más contexto que el IMC.
    - Mantener el modulo preparado para crecer sin mezclar estadisticas ni historial.
    - Usar textos simples para una experiencia compacta y visual.

  Se conecta con:
    - src/features/control-corporal/registro/ingreso.parser.js
    - src/features/control-corporal/registro/ingreso.validator.js
    - src/features/control-corporal/registro/ingreso.view.js
    - src/features/control-corporal/registro/registro.controller.js
*/

export const INGRESO_TIPOS = Object.freeze({
  PESO: "peso",
  MEDIDAS: "medidas"
});

export const INGRESO_CAMPOS_PESO = Object.freeze({
  PESO_KG: "pesoKg"
});

export const INGRESO_CAMPOS_MEDIDAS = Object.freeze({
  FECHA: "fecha",
  CUELLO_CM: "cuelloCm",
  CINTURA_CM: "cinturaCm",
  ABDOMEN_CM: "abdomenCm",
  PECHO_CM: "pechoCm",
  BRAZO_CM: "brazoCm",
  PIERNA_CM: "piernaCm",
  CADERA_CM: "caderaCm"
});

export const INGRESO_LIMITES = Object.freeze({
  pesoKg: { minimo: 30, maximo: 250, cambioRaro: 4 },
  cuelloCm: { minimo: 20, maximo: 70, cambioRaro: 4 },
  cinturaCm: { minimo: 40, maximo: 180, cambioRaro: 6 },
  abdomenCm: { minimo: 40, maximo: 190, cambioRaro: 6 },
  pechoCm: { minimo: 50, maximo: 180, cambioRaro: 6 },
  brazoCm: { minimo: 15, maximo: 80, cambioRaro: 4 },
  piernaCm: { minimo: 25, maximo: 110, cambioRaro: 5 },
  caderaCm: { minimo: 50, maximo: 190, cambioRaro: 6 }
});

export const INGRESO_LABELS = Object.freeze({
  pesoKg: "Peso",
  cuelloCm: "Cuello",
  cinturaCm: "Cintura",
  abdomenCm: "Abdomen",
  pechoCm: "Pecho",
  brazoCm: "Brazo",
  piernaCm: "Pierna",
  caderaCm: "Cadera",
  fecha: "Fecha"
});

export const INGRESO_TEXTOS = Object.freeze({
  TITULO: "Registro rápido",
  SUBTITULO: "Guarda lo importante sin salir de esta pantalla. Usa ? si necesitas una aclaración.",
  PESO_TITULO: "Peso de hoy",
  MEDIDAS_TITULO: "Medidas corporales",
  BOTON_PESO: "Guardar peso",
  BOTON_MEDIDAS: "Guardar medidas",
  DATOS_RAROS: "Hay un cambio poco común. Revisa antes de guardar.",
  SIN_DATOS: "Escribe al menos un dato para guardar."
});
