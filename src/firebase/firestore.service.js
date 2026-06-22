/*
  Nombre completo: firestore.service.js
  Ruta o ubicación: src/firebase/firestore.service.js

  Función:
    - Centralizar todas las lecturas y escrituras de Firestore.
    - Guardar perfil, rutina, entrenamientos, peso, estadísticas, recomendaciones y ajustes.
    - Mantener una estructura simple para la app personal de Jeff.
    - Preparar la sincronización entre datos locales y Firebase sin romper la app si Firestore falla.

  Se conecta con:
    - src/firebase/firebase.app.js
    - src/firebase/firebase.config.js
    - src/sincronizacion/sincronizacion.service.js
    - src/perfil/perfil.service.js
    - src/peso/peso.service.js
    - src/entrenamiento/entrenamiento.service.js
    - src/estadisticas/estadisticas.service.js
    - src/recomendaciones/recomendaciones.service.js
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

const COLECCIONES = {
  USUARIOS: "usuarios",
  PERFIL: "perfil",
  RUTINA: "rutina",
  ENTRENAMIENTOS: "entrenamientos",
  PESOS: "pesos",
  ESTADISTICAS: "estadisticas",
  RECOMENDACIONES: "recomendaciones",
  AJUSTES: "ajustes"
};

const DOCUMENTOS = {
  DATOS: "datos",
  ACTUAL: "actual",
  RESUMEN: "resumen",
  CONFIGURACION: "configuracion"
};

export function obtenerUsuarioIdPorDefecto() {
  return FIREBASE_APP_INFO.usuarioPrincipalId || "jeff";
}

export function obtenerReferenciaUsuario(usuarioId = obtenerUsuarioIdPorDefecto()) {
  const db = obtenerFirestore();
  return doc(db, COLECCIONES.USUARIOS, usuarioId);
}

export async function prepararFirestore() {
  inicializarFirebase();

  return {
    ok: true,
    usuarioId: obtenerUsuarioIdPorDefecto(),
    proyecto: FIREBASE_APP_INFO.idProyecto
  };
}

export async function guardarUsuarioBaseFirestore(usuario, usuarioId = obtenerUsuarioIdPorDefecto()) {
  const db = obtenerFirestore();
  const ref = doc(db, COLECCIONES.USUARIOS, usuarioId);

  await setDoc(
    ref,
    prepararPayload({
      nombre: usuario?.nombre || "Jeff",
      app: usuario?.app || "FitJeff",
      activo: true,
      creadoEn: usuario?.creadoEn || new Date().toISOString(),
      actualizadoEn: serverTimestamp()
    }),
    { merge: true }
  );

  return { ok: true, usuarioId, ruta: `${COLECCIONES.USUARIOS}/${usuarioId}` };
}

export async function guardarPerfilFirestore(perfil, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, COLECCIONES.PERFIL, DOCUMENTOS.DATOS, perfil);
}

export async function leerPerfilFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, COLECCIONES.PERFIL, DOCUMENTOS.DATOS);
}

export async function guardarRutinaFirestore(rutina, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, COLECCIONES.RUTINA, DOCUMENTOS.ACTUAL, rutina);
}

export async function leerRutinaFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, COLECCIONES.RUTINA, DOCUMENTOS.ACTUAL);
}

export async function guardarAjustesFirestore(ajustes, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, COLECCIONES.AJUSTES, DOCUMENTOS.CONFIGURACION, ajustes);
}

export async function leerAjustesFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, COLECCIONES.AJUSTES, DOCUMENTOS.CONFIGURACION);
}

export async function guardarResumenEstadisticasFirestore(resumen, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return guardarDocumentoFijo(usuarioId, COLECCIONES.ESTADISTICAS, DOCUMENTOS.RESUMEN, resumen);
}

export async function leerResumenEstadisticasFirestore(usuarioId = obtenerUsuarioIdPorDefecto()) {
  return leerDocumentoFijo(usuarioId, COLECCIONES.ESTADISTICAS, DOCUMENTOS.RESUMEN);
}

export async function guardarEntrenamientoFirestore(entrenamiento, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, COLECCIONES.ENTRENAMIENTOS, entrenamiento);
}

export async function listarEntrenamientosFirestore(cantidad = 50, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, COLECCIONES.ENTRENAMIENTOS, cantidad);
}

export async function guardarPesoFirestore(peso, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, COLECCIONES.PESOS, peso);
}

export async function listarPesosFirestore(cantidad = 50, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, COLECCIONES.PESOS, cantidad);
}

export async function guardarRecomendacionFirestore(recomendacion, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return crearDocumentoEnSubcoleccion(usuarioId, COLECCIONES.RECOMENDACIONES, recomendacion);
}

export async function listarRecomendacionesFirestore(cantidad = 20, usuarioId = obtenerUsuarioIdPorDefecto()) {
  return listarSubcoleccionOrdenada(usuarioId, COLECCIONES.RECOMENDACIONES, cantidad);
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
    sincronizadoEn: new Date().toISOString()
  };
}

async function guardarDocumentoFijo(usuarioId, nombreColeccion, documentoId, data) {
  const db = obtenerFirestore();
  const ref = doc(db, COLECCIONES.USUARIOS, usuarioId, nombreColeccion, documentoId);

  await setDoc(
    ref,
    prepararPayload({
      ...data,
      actualizadoEn: serverTimestamp()
    }),
    { merge: true }
  );

  return {
    ok: true,
    usuarioId,
    ruta: `${COLECCIONES.USUARIOS}/${usuarioId}/${nombreColeccion}/${documentoId}`
  };
}

async function leerDocumentoFijo(usuarioId, nombreColeccion, documentoId) {
  const db = obtenerFirestore();
  const ref = doc(db, COLECCIONES.USUARIOS, usuarioId, nombreColeccion, documentoId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return mapearDocumento(snap);
}

async function crearDocumentoEnSubcoleccion(usuarioId, nombreColeccion, data) {
  const db = obtenerFirestore();
  const ref = collection(db, COLECCIONES.USUARIOS, usuarioId, nombreColeccion);

  const docRef = await addDoc(
    ref,
    prepararPayload({
      ...data,
      creadoEn: data?.creadoEn || new Date().toISOString(),
      actualizadoEn: serverTimestamp()
    })
  );

  return {
    ok: true,
    id: docRef.id,
    usuarioId,
    ruta: `${COLECCIONES.USUARIOS}/${usuarioId}/${nombreColeccion}/${docRef.id}`
  };
}

async function listarSubcoleccionOrdenada(usuarioId, nombreColeccion, cantidad) {
  const db = obtenerFirestore();
  const ref = collection(db, COLECCIONES.USUARIOS, usuarioId, nombreColeccion);
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

function prepararPayload(data) {
  return limpiarUndefined(data);
}

function limpiarUndefined(valor) {
  if (valor === undefined) {
    return null;
  }

  if (valor === null) {
    return null;
  }

  if (Array.isArray(valor)) {
    return valor.map(limpiarUndefined);
  }

  if (esObjetoPlano(valor)) {
    const salida = {};

    Object.entries(valor).forEach(([clave, item]) => {
      salida[clave] = limpiarUndefined(item);
    });

    return salida;
  }

  return valor;
}

function esObjetoPlano(valor) {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  return Object.getPrototypeOf(valor) === Object.prototype;
}

export const FIRESTORE_RUTAS = {
  usuario: `usuarios/${obtenerUsuarioIdPorDefecto()}`,
  perfil: `usuarios/${obtenerUsuarioIdPorDefecto()}/perfil/datos`,
  rutina: `usuarios/${obtenerUsuarioIdPorDefecto()}/rutina/actual`,
  entrenamientos: `usuarios/${obtenerUsuarioIdPorDefecto()}/entrenamientos`,
  pesos: `usuarios/${obtenerUsuarioIdPorDefecto()}/pesos`,
  estadisticas: `usuarios/${obtenerUsuarioIdPorDefecto()}/estadisticas/resumen`,
  recomendaciones: `usuarios/${obtenerUsuarioIdPorDefecto()}/recomendaciones`,
  ajustes: `usuarios/${obtenerUsuarioIdPorDefecto()}/ajustes/configuracion`
};
