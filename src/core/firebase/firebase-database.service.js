/*
  Nombre completo: firebase-database.service.js
  Ruta o ubicación: src/core/firebase/firebase-database.service.js

  Función o funciones:
    - Leer y escribir datos de FitJeff en Firestore.
    - Guardar en el documento principal solo un resumen liviano de usuario.
    - Guardar registros pesados en la subcolección registros.
    - Guardar estado de sincronización en una subcolección sync.
    - Leer primero el resumen para evitar descargas grandes innecesarias.
    - Leer un respaldo completo solo cuando la app local está vacía y necesita restauración.
    - Conservar compatibilidad con documentos antiguos que tenían registros dentro del documento principal.
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

const SYNC_SUBCOLLECTION = "sync";
const FIREBASE_STRUCTURE_VERSION = "fitjeff-v2-resumen-subcolecciones";

function numeroSeguro(valor, defecto = 0) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
}

function obtenerUltimoRegistroEn(registros = []) {
  return registros
    .map((registro) => registro?.actualizadoEnFirebase || registro?.actualizadoEn || registro?.creadoEn || registro?.fecha || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}

function crearResumenLocal(estado = {}, registros = []) {
  const resumenPrevio = estado.resumenLocal || estado.controlCorporal?.resumen || {};
  const totalRegistros = numeroSeguro(resumenPrevio.totalRegistros, registros.length || 0);
  const totalCambios = numeroSeguro(resumenPrevio.totalCambios, Array.isArray(estado.historialCambios) ? estado.historialCambios.length : 0);
  const totalPapelera = numeroSeguro(resumenPrevio.totalPapelera, Array.isArray(estado.papelera) ? estado.papelera.length : 0);

  return {
    totalRegistros,
    totalCambios,
    totalPapelera,
    ultimoRegistroEn: resumenPrevio.ultimoRegistroEn || obtenerUltimoRegistroEn(registros),
    actualizadoEn: obtenerFechaHoraISO()
  };
}

function crearResumenUsuario(estado = {}) {
  const registros = Array.isArray(estado.registros) ? estado.registros : [];
  const perfil = estado.perfil || estado.controlCorporal?.perfil || {};
  const objetivo = estado.objetivo || estado.controlCorporal?.objetivo || {};
  const resumen = crearResumenLocal(estado, registros);
  const ahora = obtenerFechaHoraISO();

  return {
    activo: true,
    app: "FitJeff",
    estructura: FIREBASE_STRUCTURE_VERSION,
    nombre: FIREBASE_APP_OPTIONS.userDocument,
    perfil,
    objetivo,
    resumenLocal: resumen,
    controlCorporal: {
      perfil,
      objetivo,
      resumen
    },
    sync: {
      version: 2,
      registrosSubcollection: FIREBASE_APP_OPTIONS.registrosSubcollection,
      resumenLiviano: true,
      actualizadoEn: ahora
    },
    actualizadoEn: ahora
  };
}

function crearCamposPesadosParaEliminar(firestore) {
  if (typeof firestore.deleteField !== "function") {
    return {};
  }

  return {
    registros: firestore.deleteField(),
    historialRegistros: firestore.deleteField(),
    historialCambios: firestore.deleteField(),
    papelera: firestore.deleteField()
  };
}

function resumenTieneDatos(data = {}) {
  return Boolean(
    data.perfil?.configurado ||
    numeroSeguro(data.perfil?.alturaCm) > 0 ||
    data.perfil?.fechaNacimiento ||
    numeroSeguro(data.objetivo?.pesoObjetivoKg || data.objetivo?.pesoObjetivo) > 0 ||
    numeroSeguro(data.resumenLocal?.totalRegistros || data.controlCorporal?.resumen?.totalRegistros) > 0 ||
    Array.isArray(data.registros) ||
    Array.isArray(data.controlCorporal?.registros)
  );
}

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
    const syncRef = firestore.collection(usuarioRef, SYNC_SUBCOLLECTION);
    const statusRef = firestore.doc(syncRef, FIREBASE_APP_OPTIONS.statusDocument);

    return {
      ok: true,
      db,
      firestore,
      usuarioRef,
      registrosRef,
      syncRef,
      statusRef
    };
  }

  async function guardarSyncStatus(status = {}) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      await refs.firestore.setDoc(refs.statusRef, {
        ...status,
        estructura: FIREBASE_STRUCTURE_VERSION,
        actualizadoEn: obtenerFechaHoraISO()
      }, { merge: true });

      return { ok: true, mensaje: "Estado de sincronización actualizado" };
    } catch (error) {
      return errorService.registrar(error, "guardar-sync-status");
    }
  }

  async function guardarResumenUsuario(estado) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      const resumen = crearResumenUsuario(estado);

      await refs.firestore.setDoc(refs.usuarioRef, {
        ...resumen,
        ...crearCamposPesadosParaEliminar(refs.firestore)
      }, { merge: true });

      await guardarSyncStatus({
        ultimoResumenEn: resumen.actualizadoEn,
        totalRegistros: resumen.resumenLocal.totalRegistros,
        resumenLiviano: true
      });

      return { ok: true, mensaje: "Resumen de usuario al día", resumen };
    } catch (error) {
      return errorService.registrar(error, "guardar-resumen-usuario");
    }
  }

  async function guardarEstadoGeneral(estado) {
    return guardarResumenUsuario(estado);
  }

  async function guardarRegistro(registro) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      if (!registro?.id) {
        return { ok: false, mensaje: "Registro sin ID. No se puede sincronizar." };
      }

      const ahora = obtenerFechaHoraISO();
      const registroRef = refs.firestore.doc(refs.registrosRef, registro.id);

      await refs.firestore.setDoc(registroRef, {
        ...registro,
        modulo: "controlCorporal",
        entidad: "registro",
        actualizadoEnFirebase: ahora
      }, { merge: true });

      await guardarSyncStatus({
        ultimoRegistroEn: ahora,
        ultimoRegistroId: registro.id,
        registrosSubcollection: FIREBASE_APP_OPTIONS.registrosSubcollection
      });

      return { ok: true, mensaje: "Registro al día" };
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
      mensaje: fallos.length === 0 ? "Registros al día" : "Algunos datos quedaron pendientes.",
      resultados
    };
  }

  async function leerResumenUsuario() {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      const snapshot = await refs.firestore.getDoc(refs.usuarioRef);

      return {
        ok: true,
        existe: snapshot.exists(),
        data: snapshot.exists() ? snapshot.data() : null,
        tieneDatos: snapshot.exists() ? resumenTieneDatos(snapshot.data()) : false
      };
    } catch (error) {
      return errorService.registrar(error, "leer-resumen-usuario");
    }
  }

  async function leerEstadoGeneral() {
    return leerResumenUsuario();
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

  async function leerCambiosDesde(fechaISO) {
    try {
      const refs = await obtenerRefs();
      if (!refs.ok) return refs;

      if (!fechaISO) {
        return leerRegistros();
      }

      const consulta = refs.firestore.query(
        refs.registrosRef,
        refs.firestore.where("actualizadoEnFirebase", ">", fechaISO),
        refs.firestore.orderBy("actualizadoEnFirebase", "asc")
      );
      const snapshot = await refs.firestore.getDocs(consulta);
      const registros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        ok: true,
        registros
      };
    } catch (error) {
      return errorService.registrar(error, "leer-cambios-desde");
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
    const resumen = await leerResumenUsuario();

    if (!resumen.ok) {
      return resumen;
    }

    if (!resumen.existe) {
      return {
        ok: true,
        existe: false,
        data: null
      };
    }

    const dataResumen = resumen.data || {};
    const registrosDocumento = obtenerRegistrosDesdeDocumento(dataResumen);
    const totalResumen = numeroSeguro(dataResumen.resumenLocal?.totalRegistros || dataResumen.controlCorporal?.resumen?.totalRegistros, registrosDocumento.length);
    let registrosFinales = registrosDocumento;

    if (totalResumen > 0 || registrosDocumento.length > 0) {
      const registros = await leerRegistros();

      if (!registros.ok) {
        return registros;
      }

      const registrosSubcoleccion = registros.registros || [];
      registrosFinales = registrosSubcoleccion.length > 0 ? registrosSubcoleccion : registrosDocumento;
    }

    return {
      ok: true,
      existe: true,
      data: {
        ...dataResumen,
        perfil: dataResumen.perfil || dataResumen.controlCorporal?.perfil || {},
        objetivo: dataResumen.objetivo || dataResumen.controlCorporal?.objetivo || {},
        registros: registrosFinales
      }
    };
  }

  return {
    guardarEstadoGeneral,
    guardarResumenUsuario,
    guardarRegistro,
    guardarRegistros,
    guardarSyncStatus,
    leerEstadoGeneral,
    leerResumenUsuario,
    leerRegistros,
    leerCambiosDesde,
    leerEstadoCompleto
  };
}
