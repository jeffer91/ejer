/*
  Nombre completo: app-data-hydration.service.js
  Ruta o ubicación: src/core/bootstrap/app-data-hydration.service.js

  Función o funciones:
    - Preparar los datos antes de montar el router principal.
    - Evitar que la app instalada vuelva a Inicio si ya existen datos locales.
    - Restaurar desde Firebase cuando el almacenamiento local esté vacío.
    - Marcar Inicio como completado solo cuando existan datos reales.
    - Proteger Firebase para no reemplazar respaldos con un estado local vacío.
    - Usar almacenamiento seguro para leer y marcar el estado de Inicio.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/features/control-corporal/registro.repository.js
    - src/features/control-corporal/inicio/inicio.constants.js
    - src/core/firebase/firebase-database.service.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearFirebaseDatabaseService } from "../firebase/firebase-database.service.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";
import { crearRegistroRepository } from "../../features/control-corporal/registro.repository.js";
import { INICIO_STORAGE_KEYS } from "../../features/control-corporal/inicio/inicio.constants.js";

function perfilTieneDatos(perfil = {}) {
  return Boolean(
    perfil.configurado ||
    Number(perfil.alturaCm || 0) > 0 ||
    perfil.fechaNacimiento
  );
}

function objetivoTieneDatos(objetivo = {}) {
  return Boolean(Number(objetivo.pesoObjetivoKg || 0) > 0);
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

function normalizarEstadoRemoto(data = {}) {
  return {
    perfil: data.perfil || {},
    objetivo: data.objetivo || {},
    registros: Array.isArray(data.registros) ? data.registros : [],
    historialCambios: Array.isArray(data.historialCambios) ? data.historialCambios : [],
    papelera: Array.isArray(data.papelera) ? data.papelera : []
  };
}

export async function prepararDatosAntesDeRouter({
  repository = crearRegistroRepository(),
  firebaseDatabase = crearFirebaseDatabaseService(),
  storage = crearSafeLocalStorageService()
} = {}) {
  function marcarInicioCompletado() {
    storage.guardarTexto(INICIO_STORAGE_KEYS.COMPLETADO, "true");
  }

  function inicioFueCompletado() {
    return storage.leerTexto(INICIO_STORAGE_KEYS.COMPLETADO, "") === "true";
  }

  const estadoLocal = repository.obtenerEstado();

  if (estadoRegistroTieneDatos(estadoLocal)) {
    marcarInicioCompletado();
    return {
      perfilInicialCompletado: true,
      origen: "local",
      restaurado: false
    };
  }

  try {
    const remoto = await firebaseDatabase.leerEstadoCompleto();

    if (remoto.ok && remoto.existe) {
      const estadoRemoto = normalizarEstadoRemoto(remoto.data);

      if (estadoRegistroTieneDatos(estadoRemoto)) {
        repository.guardarEstado(estadoRemoto);
        marcarInicioCompletado();

        return {
          perfilInicialCompletado: true,
          origen: "firebase",
          restaurado: true
        };
      }
    }
  } catch (error) {
    console.warn("[FitJeff] No se pudo restaurar desde Firebase antes del inicio:", error);
  }

  return {
    perfilInicialCompletado: inicioFueCompletado(),
    origen: "sin-datos",
    restaurado: false
  };
}
