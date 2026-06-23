/*
  Nombre completo: diagnostico.firebase.service.js
  Ruta o ubicación: src/diagnostico/diagnostico.firebase.service.js

  Función:
    - Revisar configuración local de Firebase.
    - Revisar si Firebase puede inicializarse.
    - Mostrar la estructura Firestore usada por FitJeff sin escribir datos.
*/

import { FIREBASE_CONFIG, FIREBASE_APP_INFO } from "../firebase/firebase.config.js";
import { inicializarFirebase, obtenerInfoFirebase } from "../firebase/firebase.app.js";
import { FIRESTORE_RUTAS } from "../firebase/firestore.service.js";
import { DIAGNOSTICO_AREAS, DIAGNOSTICO_NIVELES, crearResultadoDiagnostico } from "./diagnostico.schema.js";

export async function diagnosticarFirebase() {
  return [
    probarConfigFirebase(),
    probarRutasFirestore(),
    await probarInicializacionFirebase()
  ];
}

function probarConfigFirebase() {
  const campos = ["apiKey", "authDomain", "projectId", "appId"];
  const faltantes = campos.filter((campo) => !FIREBASE_CONFIG?.[campo]);

  return crearResultadoDiagnostico({
    id: "firebase-config",
    area: DIAGNOSTICO_AREAS.FIREBASE,
    ok: faltantes.length === 0,
    nivel: faltantes.length ? DIAGNOSTICO_NIVELES.WARNING : DIAGNOSTICO_NIVELES.OK,
    titulo: "Configuracion Firebase",
    mensaje: faltantes.length
      ? `Faltan campos: ${faltantes.join(", ")}.`
      : `Firebase configurado para ${FIREBASE_APP_INFO?.idProyecto || FIREBASE_CONFIG.projectId}.`,
    detalle: {
      projectId: FIREBASE_CONFIG?.projectId || null,
      appInfo: FIREBASE_APP_INFO || null,
      faltantes
    },
    solucion: faltantes.length ? "Completar firebase.config.js." : ""
  });
}

function probarRutasFirestore() {
  return crearResultadoDiagnostico({
    id: "firebase-firestore-rutas",
    area: DIAGNOSTICO_AREAS.FIREBASE,
    ok: FIRESTORE_RUTAS.usuario === "fitjeff/jeff",
    nivel: FIRESTORE_RUTAS.usuario === "fitjeff/jeff" ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.WARNING,
    titulo: "Rutas Firestore",
    mensaje: `Ruta base activa: ${FIRESTORE_RUTAS.usuario}.`,
    detalle: FIRESTORE_RUTAS,
    solucion: FIRESTORE_RUTAS.usuario === "fitjeff/jeff" ? "" : "Revisar firestore.paths.js y firestore.service.js."
  });
}

async function probarInicializacionFirebase() {
  try {
    const instancia = inicializarFirebase();
    const info = obtenerInfoFirebase();

    return crearResultadoDiagnostico({
      id: "firebase-app",
      area: DIAGNOSTICO_AREAS.FIREBASE,
      ok: Boolean(instancia.app && instancia.db),
      titulo: "Inicializacion Firebase",
      mensaje: "Firebase se inicializo sin escribir datos.",
      detalle: info
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: "firebase-app",
      area: DIAGNOSTICO_AREAS.FIREBASE,
      ok: false,
      nivel: DIAGNOSTICO_NIVELES.WARNING,
      titulo: "Inicializacion Firebase",
      mensaje: error.message || "Firebase no se pudo inicializar.",
      solucion: "Revisar firebase.config.js, conexion y dependencias."
    });
  }
}
