/*
  Nombre completo: firestore.paths.js
  Ruta o ubicación: src/firebase/firestore.paths.js

  Función:
    - Centralizar rutas válidas de Firestore para FitJeff.
    - Mantener la raíz fitjeff/{usuarioId} y guardar documentos fijos en una subcolección válida.
    - Evitar rutas inválidas con número impar de segmentos como fitjeff/jeff/perfil.
*/

import { FIREBASE_APP_INFO } from "./firebase.config.js";

export const FITJEFF_FIRESTORE = {
  coleccionRaiz: "fitjeff",
  usuarioPrincipalId: FIREBASE_APP_INFO.usuarioPrincipalId || "jeff",
  coleccionDocumentos: "documentos",
  documentos: {
    perfil: "perfil",
    rutina: "rutina",
    ajustes: "ajustes",
    estadisticas: "estadisticas",
    sincronizacion: "sincronizacion"
  },
  subcolecciones: {
    entrenamientos: "entrenamientos",
    pesos: "pesos",
    recomendaciones: "recomendaciones",
    medidas: "medidas",
    reportes: "reportes",
    asistente: "asistente"
  }
};

export function obtenerUsuarioFitJeffId(usuarioId = FITJEFF_FIRESTORE.usuarioPrincipalId) {
  return usuarioId || FITJEFF_FIRESTORE.usuarioPrincipalId;
}

export function crearRutaUsuarioFitJeff(usuarioId = obtenerUsuarioFitJeffId()) {
  return `${FITJEFF_FIRESTORE.coleccionRaiz}/${obtenerUsuarioFitJeffId(usuarioId)}`;
}

export function crearRutaDocumentosFijosFitJeff(usuarioId = obtenerUsuarioFitJeffId()) {
  return `${crearRutaUsuarioFitJeff(usuarioId)}/${FITJEFF_FIRESTORE.coleccionDocumentos}`;
}

export function crearRutaDocumentoFitJeff(nombreDocumento, usuarioId = obtenerUsuarioFitJeffId()) {
  return `${crearRutaDocumentosFijosFitJeff(usuarioId)}/${nombreDocumento}`;
}

export function crearRutaSubcoleccionFitJeff(nombreSubcoleccion, usuarioId = obtenerUsuarioFitJeffId()) {
  return `${crearRutaUsuarioFitJeff(usuarioId)}/${nombreSubcoleccion}`;
}

export function crearRutasFitJeff(usuarioId = obtenerUsuarioFitJeffId()) {
  const documentos = FITJEFF_FIRESTORE.documentos;
  const subcolecciones = FITJEFF_FIRESTORE.subcolecciones;

  return {
    usuario: crearRutaUsuarioFitJeff(usuarioId),
    documentos: crearRutaDocumentosFijosFitJeff(usuarioId),
    perfil: crearRutaDocumentoFitJeff(documentos.perfil, usuarioId),
    rutina: crearRutaDocumentoFitJeff(documentos.rutina, usuarioId),
    ajustes: crearRutaDocumentoFitJeff(documentos.ajustes, usuarioId),
    estadisticas: crearRutaDocumentoFitJeff(documentos.estadisticas, usuarioId),
    sincronizacion: crearRutaDocumentoFitJeff(documentos.sincronizacion, usuarioId),
    entrenamientos: crearRutaSubcoleccionFitJeff(subcolecciones.entrenamientos, usuarioId),
    pesos: crearRutaSubcoleccionFitJeff(subcolecciones.pesos, usuarioId),
    recomendaciones: crearRutaSubcoleccionFitJeff(subcolecciones.recomendaciones, usuarioId),
    medidas: crearRutaSubcoleccionFitJeff(subcolecciones.medidas, usuarioId),
    reportes: crearRutaSubcoleccionFitJeff(subcolecciones.reportes, usuarioId),
    asistente: crearRutaSubcoleccionFitJeff(subcolecciones.asistente, usuarioId)
  };
}
