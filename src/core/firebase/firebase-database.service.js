/*
  Nombre completo: firebase-database.service.js
  Ruta o ubicación: src/core/firebase/firebase-database.service.js

  Función o funciones:
    - Leer y escribir datos de FitJeff en Firestore.
    - Guardar perfil, objetivo, registros y estado de sincronización.
    - Leer un respaldo completo para restaurar la app instalada.
    - Conservar registros guardados dentro del documento principal si la subcolección está vacía.
    - Mantener Firebase como respaldo oculto, no como pantalla visible.

  Se conecta con:
    - src/core/firebase/firebase-app.service.js
    - src/core/config/firebase.config.js
    - src/core/firebase/firebase-error.service.js
    - src/core/sync/sync.service.js
    - src/core/bootstrap/app-data-hydration.service.js
*/

import { FIREBASE_APP_OPTIONS } from "../config/firebase.config.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearFirebaseAppService } from "./firebase-app.service.js";
import { crearFirebaseErrorService } from "./firebase-error.service.js";

export function crearFirebaseDatabaseService(firebaseAppService = crearFirebaseAppService()) {
  const errorService = crearFirebaseErrorService();

  async function obtenerRefs() {
    const resultado = await firebaseAppService.inicializar();

    if (!resultado.ok) {
      return resultado;
    }

    const { db, firestore } = resultado;
    const usuarioRef = firestore.doc(db, FIREBASE_APP_OPTIONS.collection, FIREBASE_APP_OPTIONS.userDocument);
    const registrosRef = firestore.collection(usuarioRef, FIREBASE_APP_OPTIONS.registrosSubcollection);

    return {
      ok: true,
      db,
      firestore,
      usuarioRef,
      registrosRef
    };
  }

  async function guardarEstadoGeneral(estado) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      await refs.firestore.setDoc(refs.usuarioRef, {
        ...estado,
        actualizadoEn: obtenerFechaHoraISO()
      }, { merge: true });

      return { ok: true, mensaje: "Datos al día" };
    } catch (error) {
      return errorService.registrar(error, "guardar-estado-general");
    }
  }

  async function guardarRegistro(registro) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      if (!registro?.id) {
        return { ok: false, mensaje: "Registro sin ID. No se puede sincronizar." };
      }

      const registroRef = refs.firestore.doc(refs.registrosRef, registro.id);
      await refs.firestore.setDoc(registroRef, {
        ...registro,
        actualizadoEnFirebase: obtenerFechaHoraISO()
      }, { merge: true });

      return { ok: true, mensaje: "Datos al día" };
    } catch (error) {
      return errorService.registrar(error, "guardar-registro");
    }
  }

  async function guardarRegistros(registros = []) {
    const resultados = [];

    for (const registro of registros) {
      resultados.push(await guardarRegistro(registro));
    }

    const fallos = resultados.filter((resultado) => !resultado.ok);

    return {
      ok: fallos.length === 0,
      mensaje: fallos.length === 0 ? "Datos al día" : "Algunos datos quedaron pendientes.",
      resultados
    };
  }

  async function leerEstadoGeneral() {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      const snapshot = await refs.firestore.getDoc(refs.usuarioRef);

      return {
        ok: true,
        existe: snapshot.exists(),
        data: snapshot.exists() ? snapshot.data() : null
      };
    } catch (error) {
      return errorService.registrar(error, "leer-estado-general");
    }
  }

  async function leerRegistros() {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      const snapshot = await refs.firestore.getDocs(refs.registrosRef);
      const registros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        ok: true,
        registros
      };
    } catch (error) {
      return errorService.registrar(error, "leer-registros");
    }
  }

  function obtenerRegistrosDesdeDocumento(data = {}) {
    if (Array.isArray(data.registros)) return data.registros;
    if (Array.isArray(data.controlCorporal?.registros)) return data.controlCorporal.registros;
    if (Array.isArray(data.registroCorporal?.registros)) return data.registroCorporal.registros;
    if (Array.isArray(data.registro?.registros)) return data.registro.registros;
    return [];
  }

  async function leerEstadoCompleto() {
    const estadoGeneral = await leerEstadoGeneral();

    if (!estadoGeneral.ok) {
      return estadoGeneral;
    }

    if (!estadoGeneral.existe) {
      return {
        ok: true,
        existe: false,
        data: null
      };
    }

    const registros = await leerRegistros();

    if (!registros.ok) {
      return registros;
    }

    const registrosDocumento = obtenerRegistrosDesdeDocumento(estadoGeneral.data || {});
    const registrosSubcoleccion = registros.registros || [];
    const registrosFinales = registrosSubcoleccion.length > 0 ? registrosSubcoleccion : registrosDocumento;

    return {
      ok: true,
      existe: true,
      data: {
        ...(estadoGeneral.data || {}),
        registros: registrosFinales
      }
    };
  }

  return {
    guardarEstadoGeneral,
    guardarRegistro,
    guardarRegistros,
    leerEstadoGeneral,
    leerRegistros,
    leerEstadoCompleto
  };
}
