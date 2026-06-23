/*
  Nombre completo: diagnostico.firebase.service.js
  Ruta o ubicación: src/diagnostico/diagnostico.firebase.service.js

  Función:
    - Revisar configuración local de Firebase.
    - Revisar si la app Firebase puede inicializarse.
    - No forzar sincronización ni escribir datos.

  Se conecta con:
    - src/firebase/firebase.config.js
    - src/firebase/firebase.app.js
    - src/diagnostico/diagnostico.schema.js
    - src/diagnostico/diagnostico.completo.service.js
*/

import { FIREBASE_CONFIG, FIREBASE_APP_INFO } from "../firebase/firebase.config.js";
import { inicializarFirebase, obtenerInfoFirebase } from "../firebase/firebase.app.js";
import { DIAGNOSTICO_AREAS, DIAGNOSTICO_NIVELES, crearResultadoDiagnostico } from "./diagnostico.schema.js";

export async function diagnosticarFirebase() {
  const resultados = [
    probarConfigFirebase(),
    await probarInicializacionFirebase()
  ];

  return resultados;
}

function probarConfigFirebase() {
  const campos = ["apiKey", "authDomain", "projectId", "appId"];
  const faltantes = campos.filter((campo) => !FIREBASE_CONFIG?.[campo]);

  return crearResultadoDiagnostico({
    id: "firebase-config",
    area: DIAGNOSTICO_AREAS.FIREBASE,
    ok: faltantes.length === 0,
    nivel: faltantes.length ? DIAGNOSTICO_NIVELES.WARNING : DIAGNOSTICO_NIVELES.OK,
    titulo: "Configuración Firebase",
    mensaje: faltantes.length
      ? `Faltan campos: ${faltantes.join(", ")}.`
      : `Firebase configurado para ${FIREBASE_APP_INFO?.projectId || FIREBASE_CONFIG.projectId}.`,
    detalle: {
      projectId: FIREBASE_CONFIG?.projectId || null,
      appInfo: FIREBASE_APP_INFO || null,
      faltantes
    },
    solucion: faltantes.length ? "Completar firebase.config.js." : ""
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
      titulo: "Inicialización Firebase",
      mensaje: "Firebase se inicializó sin escribir datos.",
      detalle: info
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: "firebase-app",
      area: DIAGNOSTICO_AREAS.FIREBASE,
      ok: false,
      nivel: DIAGNOSTICO_NIVELES.WARNING,
      titulo: "Inicialización Firebase",
      mensaje: error.message || "Firebase no se pudo inicializar.",
      solucion: "Revisar firebase.config.js, conexión y dependencias."
    });
  }
}
