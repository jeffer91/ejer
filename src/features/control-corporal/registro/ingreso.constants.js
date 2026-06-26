/*
  Nombre completo: ingreso.constants.js
  Ruta o ubicación: src/features/control-corporal/registro/ingreso.constants.js

  Función o funciones:
    - Centralizar campos, textos y límites de la pantalla Registro / Ingreso.
    - Separar peso diario de medidas semanales.
    - Mantener el módulo preparado para crecer sin mezclar estadísticas ni historial.

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
  CINTURA_CM: "cinturaCm",
  ABDOMEN_CM: "abdomenCm",
  PECHO_CM: "pechoCm",
  BRAZO_CM: "brazoCm",
  PIERNA_CM: "piernaCm",
  CADERA_CM: "caderaCm"
});

export const INGRESO_LIMITES = Object.freeze({
  pesoKg: { minimo: 30, maximo: 250, cambioRaro: 4 },
  cinturaCm: { minimo: 40, maximo: 180, cambioRaro: 6 },
  abdomenCm: { minimo: 40, maximo: 190, cambioRaro: 6 },
  pechoCm: { minimo: 50, maximo: 180, cambioRaro: 6 },
  brazoCm: { minimo: 15, maximo: 80, cambioRaro: 4 },
  piernaCm: { minimo: 25, maximo: 110, cambioRaro: 5 },
  caderaCm: { minimo: 50, maximo: 190, cambioRaro: 6 }
});

export const INGRESO_LABELS = Object.freeze({
  pesoKg: "Peso",
  cinturaCm: "Cintura",
  abdomenCm: "Abdomen",
  pechoCm: "Pecho",
  brazoCm: "Brazo",
  piernaCm: "Pierna",
  caderaCm: "Cadera",
  fecha: "Fecha de medición"
});

export const INGRESO_TEXTOS = Object.freeze({
  TITULO: "Registro",
  SUBTITULO: "Guarda tu peso diario y tus medidas semanales en una pantalla compacta.",
  PESO_TITULO: "Peso de hoy",
  MEDIDAS_TITULO: "Medidas semanales",
  BOTON_PESO: "Guardar peso",
  BOTON_MEDIDAS: "Guardar medidas",
  DATOS_RAROS: "Hay un cambio poco común. Revisa antes de guardar.",
  SIN_DATOS: "Escribe al menos un dato para guardar."
});
