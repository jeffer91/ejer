/*
  Nombre completo: registro.constants.js
  Ruta o ubicación: src/features/control-corporal/registro.constants.js

  Función o funciones:
    - Centralizar nombres, claves y reglas generales de Control corporal.
    - Definir datos de perfil, peso diario y medidas semanales.
    - Evitar textos y claves repetidas dentro del módulo.

  Se conecta con:
    - src/features/control-corporal/registro.state.js
    - src/features/control-corporal/registro.service.js
*/

export const REGISTRO_MODULO = Object.freeze({
  id: "registro-corporal",
  nombre: "Registro corporal",
  version: "0.1.0"
});

export const REGISTRO_STORAGE_KEYS = Object.freeze({
  PERFIL: "fitjeff:registro:perfil",
  OBJETIVO: "fitjeff:registro:objetivo",
  REGISTROS: "fitjeff:registro:registros",
  HISTORIAL_CAMBIOS: "fitjeff:registro:historial-cambios",
  PAPELERA: "fitjeff:registro:papelera"
});

export const CAMPOS_PERFIL = Object.freeze({
  ALTURA_CM: "alturaCm",
  FECHA_NACIMIENTO: "fechaNacimiento"
});

export const CAMPOS_OBJETIVO = Object.freeze({
  PESO_OBJETIVO_KG: "pesoObjetivoKg",
  RITMO_INTELIGENTE: "ritmoInteligente"
});

export const CAMPOS_PESO = Object.freeze({
  PESO_KG: "pesoKg",
  FECHA: "fecha",
  ORIGEN: "origen"
});

export const CAMPOS_MEDIDAS = Object.freeze({
  CINTURA_CM: "cinturaCm",
  ABDOMEN_CM: "abdomenCm",
  PECHO_CM: "pechoCm",
  BRAZO_CM: "brazoCm",
  PIERNA_CM: "piernaCm",
  CADERA_CM: "caderaCm"
});

export const FRECUENCIAS_REGISTRO = Object.freeze({
  PESO_MAXIMO_POR_DIA: 1,
  MEDIDAS_DIAS: 7
});

export const ESTADOS_DATO = Object.freeze({
  NORMAL: "normal",
  PENDIENTE: "pendiente",
  REVISAR: "revisar",
  ELIMINADO: "eliminado"
});
