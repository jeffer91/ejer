/*
  Nombre completo: firestore.service.js
  Ruta o ubicación: src/firebase/firestore.service.js

  Función:
    - Centralizar lecturas y escrituras de Firestore para FitJeff.
    - Usar una estructura exclusiva: fitjeff / jeff.
    - Mantener compatibilidad con los servicios existentes de sincronización.
*/

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { obtenerFirestore, inicializarFirebase } from "./firebase.app.js";
import { FIREBASE_APP_INFO } from "./firebase.config.js";
import {
  FITJEFF_FIRESTORE,
  crearRutasFitJeff,
  obtenerUsuarioFitJeffId
} from "./firestore.paths.js";
import {
  limpiarUndefined,
  prepararDocumentoFijoFitJeff,
  prepararItemSubcoleccionFitJeff
} from "./firestore.schema.js";

const DOCUMENTOS = FITJEFF_FIRESTORE.documentos;
const SUBCOLECCIONES = FITJEFF_FIRESTORE.subcolecciones;

export function obtenerUsuarioIdPorDefecto() {
  return obtenerUsuarioFitJeffId(FIREBASE_APP_INFO.usuarioPrincipalId || "jeff");
}

export function obtenerReferenciaUsuario(usuarioId = obtenerUsuarioIdPorDefecto()) {
  const db = obtenerFirestore();
  return doc(db, FITJEFF_FIRESTORE.coleccionRaiz, obtenerUsuarioFitJeffId(usuarioId));
}

export async function prepararFirestore() {
  inicializarFirebase();

  return {
    ok: true,
    usuarioId: obtenerUsuarioIdPorDefecto(),
    proyecto: FIREBASE_APP_INFO.idProyecto,
    coleccionRaiz: FITJEFF_FIRESTORE.coleccionRaiz,
    rutaBase: crearRutasFitJeff().usuario
  };
}

export async function guardarUsuarioBaseFirestore(usuario, usuarioId = obtenerUsuarioIdPorDefecto()) {
  const ref = obtenerReferenciaUsuario(usuarioId);

  await setDoc(
    ref,
    limpiarUndefined({
      nombre: usuario?.nombre || "Jeff",
      app: usuario?.app || "FitJeff",
      activo: true,
      creadoEn: usuario?.creadoEn || new Date().toISOString(),
      actualizadoEn: serverTimestamp(),
      estructura: "fitjeff-v1"
    }),
    { merge: true }
  );

  return { ok: true, usuarioId, ruta: crearRutasFitJeff(usuarioId).usuario };
}

export async function guardarPerfilFirestore(perfil, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, DOCUMENTOS.perfil, perfil, "perfil");
}

export async function leerPerfilFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, DOCUMENTOS.perfil);
}

export async function guardarRutinaFirestore(rutina, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, DOCUMENTOS.rutina, rutina, "rutina");
}

export async function leerRutinaFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, DOCUMENTOS.rutina);
}

export async function guardarAjustesFirestore(ajustes, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, DOCUMENTOS.ajustes, ajustes, "ajustes");
}

export async function leerAjustesFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, DOCUMENTOS.ajustes);
}

export async function guardarResumenEstadisticasFirestore(resumen, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, DOCUMENTOS.estadisticas, resumen, "estadisticas");
}

export async function leerResumenEstadisticasFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, DOCUMENTOS.estadisticas);
}

export async function guardarSincronizacionFirestore(resumen, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, DOCUMENTOS.sincronizacion, resumen, "sincronizacion");
}

export async function leerSincronizacionFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, DOCUMENTOS.sincronizacion);
}

export async function guardarEntrenamientoFirestore(entrenamiento, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, SUBCOLECCIONES.entrenamientos, entrenamiento, "entrenamiento");
}

export async function listarEntrenamientosFirestore(cantidad = 50, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, SUBCOLECCIONES.entrenamientos, cantidad);
}

export async function guardarPesoFirestore(peso, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, SUBCOLECCIONES.pesos, peso, "peso");
}

export async function listarPesosFirestore(cantidad = 50, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, SUBCOLECCIONES.pesos, cantidad);
}

export async function guardarRecomendacionFirestore(recomendacion, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, SUBCOLECCIONES.recomendaciones, recomendacion, "recomendacion");
}

export async function listarRecomendacionesFirestore(cantidad = 20, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, SUBCOLECCIONES.recomendaciones, cantidad);
}

export async function sincronizarBaseFirestore({ usuario, rutina, ajustes }) {
  const usuarioId = obtenerUsuarioIdPorDefecto();

  await guardarUsuarioBaseFirestore(usuario, usuarioId);

  if (usuario?.perfil) {
    await guardarPerfilFirestore(usuario.perfil, usuarioId);
  }

  if (rutina) {
    await guardarRutinaFirestore(rutina, usuarioId);
  }

  if (ajustes) {
    await guardarAjustesFirestore(ajustes, usuarioId);
  }

  return {
    ok: true,
    usuarioId,
    ruta: crearRutasFitJeff(usuarioId).usuario,
    sincronizadoEn: new Date().toISOString()
  };
}

async function guardarDocumentoFijo(usuarioId, documentoId, data, tipo) {
  const db = obtenerFirestore();
  const id = obtenerUsuarioFitJeffId(usuarioId);
  const ref = doc(db, FITJEFF_FIRESTORE.coleccionRaiz, id, documentoId);

  await setDoc(
    ref,
    limpiarUndefined({
      ...prepararDocumentoFijoFitJeff(data || {}, tipo),
      actualizadoEn: serverTimestamp()
    }),
    { merge: true }
  );

  return {
    ok: true,
    usuarioId: id,
    ruta: `${FITJEFF_FIRESTORE.coleccionRaiz}/${id}/${documentoId}`
  };
}

async function leerDocumentoFijo(usuarioId, documentoId) {
  const db = obtenerFirestore();
  const id = obtenerUsuarioFitJeffId(usuarioId);
  const ref = doc(db, FITJEFF_FIRESTORE.coleccionRaiz, id, documentoId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return mapearDocumento(snap);
}

async function crearDocumentoEnSubcoleccion(usuarioId, nombreSubcoleccion, data, tipo) {
  const db = obtenerFirestore();
  const id = obtenerUsuarioFitJeffId(usuarioId);
  const ref = collection(db, FITJEFF_FIRESTORE.coleccionRaiz, id, nombreSubcoleccion);

  const docRef = await addDoc(
    ref,
    limpiarUndefined({
      ...prepararItemSubcoleccionFitJeff(data || {}, tipo),
      actualizadoEn: serverTimestamp()
    })
  );

  return {
    ok: true,
    id: docRef.id,
    usuarioId: id,
    ruta: `${FITJEFF_FIRESTORE.coleccionRaiz}/${id}/${nombreSubcoleccion}/${docRef.id}`
  };
}

async function listarSubcoleccionOrdenada(usuarioId, nombreSubcoleccion, cantidad) {
  const db = obtenerFirestore();
  const id = obtenerUsuarioFitJeffId(usuarioId);
  const ref = collection(db, FITJEFF_FIRESTORE.coleccionRaiz, id, nombreSubcoleccion);
  const consulta = query(ref, orderBy("creadoEn", "desc"), limit(Number(cantidad) || 50));
  const snap = await getDocs(consulta);

  return snap.docs.map(mapearDocumento);
}

function mapearDocumento(snapshot) {
  return {
    idFirestore: snapshot.id,
    ...snapshot.data()
  };
}

export const FIRESTORE_RUTAS = crearRutasFitJeff(obtenerUsuarioIdPorDefecto());
