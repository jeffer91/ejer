/*
  Nombre completo: registro.schema.js
  Ruta o ubicación: src/features/control-corporal/registro.schema.js

  Función o funciones:
    - Describir la forma base de los datos de Control corporal.
    - Mantener consistente el perfil, objetivo, peso, medidas e historial.
    - Servir como guía para validaciones, Firebase y migraciones futuras.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/registro.repository.js
    - src/features/control-corporal/registro.constants.js
*/

export const REGISTRO_SCHEMA_VERSION = "0.1.0";

export function crearPerfilSchema() {
  return {
    alturaCm: null,
    fechaNacimiento: "",
    configurado: false,
    actualizadoEn: ""
  };
}

export function crearObjetivoSchema() {
  return {
    pesoObjetivoKg: null,
    ritmoInteligente: true,
    actualizadoEn: ""
  };
}

export function crearPesoSchema() {
  return {
    pesoKg: null,
    fecha: "",
    origen: "fitjeff"
  };
}

export function crearMedidasSchema() {
  return {
    cinturaCm: null,
    abdomenCm: null,
    pechoCm: null,
    brazoCm: null,
    piernaCm: null,
    caderaCm: null,
    fecha: "",
    origen: "fitjeff"
  };
}

export function crearHistorialCambioSchema() {
  return {
    id: "",
    registroId: "",
    accion: "",
    antes: null,
    despues: null,
    creadoEn: ""
  };
}
