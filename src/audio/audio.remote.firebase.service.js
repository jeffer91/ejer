/*
  Nombre completo: audio.remote.firebase.service.js
  Ruta o ubicación: src/audio/audio.remote.firebase.service.js

  Función:
    - Enviar y escuchar comandos remotos por Firebase.
    - Cargar Firebase solo cuando se use esta función.
    - Mantener la app local funcionando aunque Firebase esté apagado.
*/

import { FIREBASE_CONFIG } from "../firebase/firebase.config.js";
import { AUDIO_REMOTO_CONFIG, crearOrdenAudioRemota } from "./audio.remote.schema.js";

let appCache = null;
let dbCache = null;

export async function enviarOrdenFirebaseAudio(ordenEntrada) {
  const firebase = await obtenerFirebaseDinamico();
  const orden = crearOrdenAudioRemota(ordenEntrada);

  await firebase.addDoc(
    firebase.collection(dbCache, AUDIO_REMOTO_CONFIG.firebaseColeccion),
    {
      ...orden,
      creadoEnServidor: firebase.serverTimestamp()
    }
  );

  return {
    ok: true,
    mensaje: "Orden enviada por Firebase.",
    orden
  };
}

export async function escucharOrdenesFirebaseAudio({ canalId, desdeISO, onOrden }) {
  const firebase = await obtenerFirebaseDinamico();

  const ref = firebase.collection(dbCache, AUDIO_REMOTO_CONFIG.firebaseColeccion);
  const q = firebase.query(ref, firebase.orderBy("creadoEn", "desc"), firebase.limit(30));

  return firebase.onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type !== "added") return;

      const data = change.doc.data();
      const orden = crearOrdenAudioRemota(data);

      if (orden.canalId !== canalId) return;
      if (desdeISO && String(orden.creadoEn) < String(desdeISO)) return;

      onOrden?.(orden);
    });
  });
}

async function obtenerFirebaseDinamico() {
  const [{ initializeApp, getApps }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);

  if (!appCache) {
    appCache = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  }

  if (!dbCache) {
    dbCache = firestore.getFirestore(appCache);
  }

  return firestore;
}
