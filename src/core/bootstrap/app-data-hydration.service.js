/*
  Nombre completo: app-data-hydration.service.js
  Ruta o ubicación: src/core/bootstrap/app-data-hydration.service.js

  Función o funciones:
    - Preparar datos locales antes de montar el router principal sin bloquear por Firebase.
    - Evitar que la app instalada vuelva a Inicio si ya existen datos locales.
    - Restaurar desde Firebase en segundo plano cuando el almacenamiento local esté vacío.
    - Registrar metadata de último pull Firebase sin bloquear la interfaz.
    - Aceptar respaldos remotos con estructura actual o estructuras anteriores.
    - No intentar conexión remota cuando la app está en modo local.
    - Marcar Inicio como completado solo cuando existan datos reales.
    - Proteger Firebase para no reemplazar respaldos con un estado local vacío.
    - Usar almacenamiento seguro para leer y marcar el estado de Inicio.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/core/config/firebase.config.js
    - src/features/control-corporal/registro.repository.js
    - src/features/control-corporal/inicio/inicio.constants.js
    - src/core/firebase/firebase-database.service.js
    - src/core/storage/safe-local-storage.service.js
    - src/core/sync/sync-metadata.service.js
*/

import { firebaseEstaConfigurado, obtenerEstadoFirebaseConexion } from "../config/firebase.config.js";
import { crearFirebaseDatabaseService } from "../firebase/firebase-database.service.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { crearSyncMetadataService, SYNC_MODULES } from "../sync/sync-metadata.service.js";
import { crearRegistroRepository } from "../../features/control-corporal/registro.repository.js";
import { INICIO_STORAGE_KEYS } from "../../features/control-corporal/inicio/inicio.constants.js";

function perfilTieneDatos(perfil = {}) {
  return Boolean(
    perfil.configurado ||
    Number(perfil.alturaCm || 0) > 0 ||
    perfil.fechaNacimiento ||
    perfil.nivelMuscular
  );
}

function objetivoTieneDatos(objetivo = {}) {
  return Boolean(Number(objetivo.pesoObjetivoKg || objetivo.pesoObjetivo || 0) > 0);
}

export function estadoRegistroTieneDatos(estado = {}) {
  return Boolean(
    perfilTieneDatos(estado.perfil) ||
    objetivoTieneDatos(estado.objetivo) ||
    (Array.isArray(estado.registros) && estado.registros.length > 0) ||
    (Array.isArray(estado.historialCambios) && estado.historialCambios.length > 0) ||
    (Array.isArray(estado.papelera) && estado.papelera.length > 0)
  );
}

function elegirObjeto(...opciones) {
  return opciones.find((opcion) => opcion && typeof opcion === "object" && !Array.isArray(opcion)) || {};
}

function elegirArray(...opciones) {
  return opciones.find((opcion) => Array.isArray(opcion)) || [];
}

function extraerRaizControlCorporal(data = {}) {
  return elegirObjeto(
    data.controlCorporal,
    data.registroCorporal,
    data.registro,
    data.control,
    data
  );
}

function normalizarPerfilRemoto(data = {}, raiz = {}) {
  const perfil = elegirObjeto(raiz.perfil, data.perfil);

  return {
    ...perfil,
    alturaCm: perfil.alturaCm || raiz.alturaCm || data.alturaCm || "",
    fechaNacimiento: perfil.fechaNacimiento || raiz.fechaNacimiento || data.fechaNacimiento || "",
    nivelMuscular: perfil.nivelMuscular || raiz.nivelMuscular || data.nivelMuscular || "",
    configurado: Boolean(perfil.configurado || perfil.alturaCm || raiz.alturaCm || data.alturaCm)
  };
}

function normalizarObjetivoRemoto(data = {}, raiz = {}) {
  const objetivo = elegirObjeto(raiz.objetivo, data.objetivo);
  const pesoObjetivoKg = objetivo.pesoObjetivoKg || objetivo.pesoObjetivo || raiz.pesoObjetivoKg || data.pesoObjetivoKg || "";

  return {
    ...objetivo,
    pesoObjetivoKg,
    ritmoInteligente: objetivo.ritmoInteligente ?? true
  };
}

function normalizarRegistrosRemotos(data = {}, raiz = {}) {
  return elegirArray(
    raiz.registros,
    data.registros,
    raiz.historialRegistros,
    data.historialRegistros
  );
}

function normalizarEstadoRemoto(data = {}) {
  const raiz = extraerRaizControlCorporal(data);

  return {
    perfil: normalizarPerfilRemoto(data, raiz),
    objetivo: normalizarObjetivoRemoto(data, raiz),
    registros: normalizarRegistrosRemotos(data, raiz),
    historialCambios: elegirArray(raiz.historialCambios, data.historialCambios),
    papelera: elegirArray(raiz.papelera, data.papelera)
  };
}

function crearControlInicio(storage) {
  return {
    marcarInicioCompletado() {
      storage.guardarTexto(INICIO_STORAGE_KEYS.COMPLETADO, "true");
    },
    inicioFueCompletado() {
      return storage.leerTexto(INICIO_STORAGE_KEYS.COMPLETADO, "") === "true";
    }
  };
}

export function prepararDatosAntesDeRouter({
  repository = crearRegistroRepository(),
  storage = crearSafeLocalStorageService()
} = {}) {
  const inicio = crearControlInicio(storage);
  const estadoLocal = repository.obtenerEstado();

  if (estadoRegistroTieneDatos(estadoLocal)) {
    inicio.marcarInicioCompletado();
    return {
      perfilInicialCompletado: true,
      origen: "local",
      restaurado: false,
      firebasePendienteSegundoPlano: false
    };
  }

  return {
    perfilInicialCompletado: false,
    origen: inicio.inicioFueCompletado() ? "local-vacio-con-marca" : "local-vacio",
    restaurado: false,
    firebasePendienteSegundoPlano: firebaseEstaConfigurado()
  };
}

export async function restaurarFirebaseEnSegundoPlano({
  repository = crearRegistroRepository(),
  firebaseDatabase = crearFirebaseDatabaseService(),
  storage = crearSafeLocalStorageService(),
  syncMetadata = crearSyncMetadataService(),
  soloSiLocalVacio = true
} = {}) {
  const inicio = crearControlInicio(storage);
  const estadoLocal = repository.obtenerEstado();

  if (soloSiLocalVacio && estadoRegistroTieneDatos(estadoLocal)) {
    inicio.marcarInicioCompletado();
    return {
      ok: true,
      restaurado: false,
      origen: "local",
      mensaje: "La app abrió con datos locales. No fue necesario consultar Firebase para restaurar."
    };
  }

  if (!firebaseEstaConfigurado()) {
    const conexion = obtenerEstadoFirebaseConexion();
    console.info("[FitJeff] Firebase no se consulta en segundo plano:", conexion.mensaje);

    return {
      ok: true,
      restaurado: false,
      origen: "modo-local",
      mensaje: conexion.mensaje
    };
  }

  try {
    const remoto = await firebaseDatabase.leerEstadoCompleto();
    syncMetadata.marcarPullFirebase();

    if (remoto.ok && remoto.existe) {
      const estadoRemoto = normalizarEstadoRemoto(remoto.data);

      if (estadoRegistroTieneDatos(estadoRemoto)) {
        repository.guardarEstado(estadoRemoto);
        inicio.marcarInicioCompletado();
        syncMetadata.marcarModuloSincronizado(SYNC_MODULES.CONTROL_CORPORAL);

        return {
          ok: true,
          restaurado: true,
          origen: "firebase",
          mensaje: "Datos restaurados desde Firebase en segundo plano."
        };
      }
    }

    return {
      ok: true,
      restaurado: false,
      origen: "firebase-sin-datos",
      mensaje: "Firebase no tiene datos suficientes para restaurar el perfil."
    };
  } catch (error) {
    syncMetadata.marcarError(SYNC_MODULES.CONTROL_CORPORAL, "No se pudo restaurar Firebase en segundo plano.");
    console.warn("[FitJeff] No se pudo restaurar desde Firebase en segundo plano:", error);

    return {
      ok: false,
      restaurado: false,
      origen: "firebase-error",
      mensaje: "No se pudo restaurar Firebase en segundo plano."
    };
  }
}
