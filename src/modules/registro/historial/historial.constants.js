/*
  Nombre completo: historial.constants.js
  Ruta o ubicación: src/modules/registro/historial/historial.constants.js

  Función o funciones:
    - Centralizar textos, etiquetas y acciones del Historial.
    - Mantener nombres claros para registros de peso, medidas y cambios.
    - Evitar textos repetidos en servicio, vista y controlador.

  Se conecta con:
    - src/modules/registro/historial/historial.service.js
    - src/modules/registro/historial/historial.view.js
    - src/modules/registro/historial/historial.controller.js
*/

export const HISTORIAL_TEXTOS = Object.freeze({
  TITULO: "Historial",
  SUBTITULO: "Revisa tus registros guardados, corrige datos y envía registros a papelera.",
  VACIO: "Todavía no hay registros guardados.",
  EDITAR: "Editar",
  BORRAR: "Borrar",
  CAMBIOS: "Cambios",
  CONFIRMAR_BORRAR: "¿Seguro que quieres enviar este registro a papelera?",
  BORRADO_OK: "Registro enviado a papelera.",
  EDITADO_OK: "Registro actualizado.",
  SIN_CAMBIOS: "Este registro aún no tiene cambios guardados."
});

export const HISTORIAL_ACCIONES = Object.freeze({
  EDITAR: "editar",
  BORRAR: "borrar",
  CAMBIOS: "cambios"
});

export const HISTORIAL_TIPOS = Object.freeze({
  PESO: "peso",
  MEDIDAS: "medidas"
});

export const HISTORIAL_LABELS = Object.freeze({
  pesoKg: "Peso",
  cinturaCm: "Cintura",
  abdomenCm: "Abdomen",
  pechoCm: "Pecho",
  brazoCm: "Brazo",
  piernaCm: "Pierna",
  caderaCm: "Cadera"
});
