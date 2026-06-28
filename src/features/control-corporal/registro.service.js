/*
  Nombre completo: registro.service.js
  Ruta o ubicacion: src/features/control-corporal/registro.service.js

  Funcion o funciones:
    - Coordinar las operaciones principales de Control corporal.
    - Guardar perfil, objetivo, peso y medidas usando el repository.
    - Guardar local primero para que la interfaz responda rapido.
    - Guardar la configuracion inicial en una sola operacion local.
    - Marcar Inicio como completado cuando ya existen datos reales.
    - Encolar cambios locales aunque Firebase todavia no este listo.
    - Encolar operaciones diferenciales para no duplicar cambios pendientes.
    - Marcar Control corporal como modulo sucio en metadata de sincronizacion.
    - Registrar cambios para que el Historial pueda mostrar correcciones.
    - Usar fecha local para registros diarios y evitar desfases por UTC.
    - Limitar medidas a una medicion principal por semana para evitar duplicados.
    - No mezclar logica visual con guardado de datos.

  Se conecta con:
    - src/features/control-corporal/registro.repository.js
    - src/features/control-corporal/registro.state.js
    - src/features/control-corporal/registro.constants.js
    - src/features/control-corporal/inicio/inicio.constants.js
    - src/core/sync/sync-queue.service.js
    - src/core/sync/sync-metadata.service.js
    - src/core/utils/date.util.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../core/storage/safe-local-storage.service.js";
import { crearSyncMetadataService, SYNC_MODULES } from "../../core/sync/sync-metadata.service.js";
import { crearSyncQueueService } from "../../core/sync/sync-queue.service.js";
import { convertirAFechaSegura, formatearFechaLocalISO, obtenerFechaHoraISO, obtenerFechaHoyISO } from "../../core/utils/date.util.js";
import { INICIO_STORAGE_KEYS } from "./inicio/inicio.constants.js";
import { crearRegistroRepository } from "./registro.repository.js";
import { crearCambioRegistro, crearRegistroBase } from "./registro.state.js";

function fechaHoy() {
  return obtenerFechaHoyISO();
}

function estaActivo(registro) {
  return registro && registro.estado !== "eliminado";
}

function existePesoEnFecha(registros, fecha) {
  return registros.some((registro) => {
    return estaActivo(registro) && registro.tipo === "peso" && registro.fecha === fecha;
  });
}

function obtenerInicioSemanaISO(fecha) {
  const base = convertirAFechaSegura(fecha || fechaHoy());

  if (!base) {
    return "";
  }

  const dia = base.getDay();
  const diferenciaLunes = dia === 0 ? -6 : 1 - dia;
  base.setDate(base.getDate() + diferenciaLunes);
  return formatearFechaLocalISO(base);
}

function existeMedidasEnSemana(registros, fecha) {
  const semana = obtenerInicioSemanaISO(fecha);

  if (!semana) {
    return false;
  }

  return registros.some((registro) => {
    return estaActivo(registro)
      && registro.tipo === "medidas"
      && obtenerInicioSemanaISO(registro.fecha) === semana;
  });
}

export function crearRegistroService(
  repository = crearRegistroRepository(),
  queue = crearSyncQueueService(),
  storage = crearSafeLocalStorageService(),
  syncMetadata = crearSyncMetadataService()
) {
  function obtenerEstado() {
    return repository.obtenerEstado();
  }

  function marcarInicioCompletadoSiHayDatos() {
    storage.guardarTexto(INICIO_STORAGE_KEYS.COMPLETADO, "true");
  }

  function marcarCambioLocal(descripcion) {
    syncMetadata.marcarModuloSucio(SYNC_MODULES.CONTROL_CORPORAL, descripcion);
  }

  function puedeEncolarSync() {
    return true;
  }

  function encolarEstadoGeneral(estado = obtenerEstado()) {
    if (!puedeEncolarSync()) {
      return null;
    }

    return queue.agregar({
      tipo: "estado-general",
      modulo: SYNC_MODULES.CONTROL_CORPORAL,
      entidad: "estado-general",
      entidadId: "general",
      accion: "upsert",
      payload: {
        perfil: estado.perfil,
        objetivo: estado.objetivo,
        historialCambios: estado.historialCambios || [],
        papelera: estado.papelera || [],
        resumenLocal: {
          totalRegistros: estado.registros.length,
          totalCambios: estado.historialCambios.length,
          totalPapelera: estado.papelera.length
        }
      }
    });
  }

  function encolarRegistro(registro) {
    if (!puedeEncolarSync() || !registro?.id) {
      return null;
    }

    return queue.agregar({
      tipo: "registro",
      modulo: SYNC_MODULES.CONTROL_CORPORAL,
      entidad: "registro",
      entidadId: registro.id,
      accion: "upsert",
      payload: registro
    });
  }

  function guardarConfiguracionInicial(datosIniciales) {
    const estado = obtenerEstado();
    const actualizadoEn = obtenerFechaHoraISO();
    const fecha = datosIniciales?.fecha || fechaHoy();
    const perfil = {
      ...estado.perfil,
      alturaCm: datosIniciales.alturaCm,
      fechaNacimiento: datosIniciales.fechaNacimiento,
      nivelMuscular: datosIniciales.nivelMuscular,
      configurado: true,
      actualizadoEn
    };
    const objetivo = {
      ...estado.objetivo,
      pesoObjetivoKg: datosIniciales.pesoObjetivoKg,
      ritmoInteligente: true,
      actualizadoEn
    };
    let registroPeso = null;
    let registros = estado.registros;

    if (!existePesoEnFecha(estado.registros, fecha)) {
      registroPeso = crearRegistroBase("peso", {
        pesoKg: datosIniciales.pesoInicialKg,
        fecha,
        origen: "inicio"
      });
      registros = [registroPeso, ...estado.registros];
    }

    repository.guardarEstado({
      ...estado,
      perfil,
      objetivo,
      registros
    });

    marcarInicioCompletadoSiHayDatos();
    marcarCambioLocal("Configuración inicial de Control corporal");

    if (registroPeso) {
      encolarRegistro(registroPeso);
    }

    encolarEstadoGeneral(obtenerEstado());

    return {
      ok: true,
      mensaje: registroPeso
        ? "Perfil inicial guardado. Abriendo Hoy."
        : "Perfil actualizado. Ya existía un peso para esta fecha.",
      pesoGuardado: {
        ok: true,
        mensaje: registroPeso ? "Peso inicial guardado." : "Peso no duplicado porque ya existía en esa fecha.",
        registro: registroPeso
      }
    };
  }

  function guardarPerfil(datosPerfil) {
    const estado = obtenerEstado();
    const perfil = {
      ...estado.perfil,
      ...datosPerfil,
      configurado: true,
      actualizadoEn: obtenerFechaHoraISO()
    };

    repository.guardarPerfil(perfil);
    marcarInicioCompletadoSiHayDatos();
    marcarCambioLocal("Perfil corporal actualizado");
    encolarEstadoGeneral(obtenerEstado());
    return perfil;
  }

  function guardarObjetivo(datosObjetivo) {
    const estado = obtenerEstado();
    const objetivo = {
      ...estado.objetivo,
      ...datosObjetivo,
      actualizadoEn: obtenerFechaHoraISO()
    };

    repository.guardarObjetivo(objetivo);
    marcarInicioCompletadoSiHayDatos();
    marcarCambioLocal("Objetivo corporal actualizado");
    encolarEstadoGeneral(obtenerEstado());
    return objetivo;
  }

  function guardarPeso(datosPeso) {
    const estado = obtenerEstado();
    const fecha = datosPeso?.fecha || fechaHoy();

    if (existePesoEnFecha(estado.registros, fecha)) {
      return {
        ok: false,
        mensaje: "Ya existe un peso registrado para este día."
      };
    }

    const registro = crearRegistroBase("peso", {
      ...datosPeso,
      fecha
    });

    const registros = [registro, ...estado.registros];
    repository.guardarRegistros(registros);
    marcarInicioCompletadoSiHayDatos();
    marcarCambioLocal("Peso corporal guardado");
    encolarRegistro(registro);
    encolarEstadoGeneral(obtenerEstado());

    return {
      ok: true,
      mensaje: "Peso guardado.",
      registro
    };
  }

  function guardarMedidas(datosMedidas) {
    const estado = obtenerEstado();
    const fecha = datosMedidas?.fecha || fechaHoy();

    if (existeMedidasEnSemana(estado.registros, fecha)) {
      return {
        ok: false,
        mensaje: "Ya existe una medición principal para esta semana. Edita la anterior o registra la próxima semana."
      };
    }

    const registro = crearRegistroBase("medidas", {
      ...datosMedidas,
      fecha
    });

    const registros = [registro, ...estado.registros];
    repository.guardarRegistros(registros);
    marcarInicioCompletadoSiHayDatos();
    marcarCambioLocal("Medidas corporales guardadas");
    encolarRegistro(registro);
    encolarEstadoGeneral(obtenerEstado());

    return {
      ok: true,
      mensaje: "Medidas guardadas.",
      registro
    };
  }

  function editarRegistro(registroId, nuevosDatos) {
    const estado = obtenerEstado();
    const registros = estado.registros.map((registro) => {
      if (registro.id !== registroId) {
        return registro;
      }

      return {
        ...registro,
        datos: {
          ...registro.datos,
          ...nuevosDatos
        },
        actualizadoEn: obtenerFechaHoraISO()
      };
    });

    const antes = estado.registros.find((registro) => registro.id === registroId) || null;
    const despues = registros.find((registro) => registro.id === registroId) || null;
    const cambio = crearCambioRegistro({ registroId, accion: "editar", antes, despues });

    repository.guardarRegistros(registros);
    repository.guardarHistorialCambios([cambio, ...estado.historialCambios]);
    marcarCambioLocal("Registro corporal editado");
    encolarRegistro(despues);
    encolarEstadoGeneral(obtenerEstado());

    return {
      ok: true,
      mensaje: "Registro actualizado.",
      registro: despues
    };
  }

  function enviarAPapelera(registroId) {
    const estado = obtenerEstado();
    const registro = estado.registros.find((item) => item.id === registroId);

    if (!registro) {
      return { ok: false, mensaje: "No se encontró el registro." };
    }

    const eliminadoEn = obtenerFechaHoraISO();
    const registros = estado.registros.filter((item) => item.id !== registroId);
    const registroEliminado = { ...registro, estado: "eliminado", eliminadoEn };
    const papelera = [registroEliminado, ...estado.papelera];
    const cambio = crearCambioRegistro({ registroId, accion: "enviar-a-papelera", antes: registro, despues: null });

    repository.guardarRegistros(registros);
    repository.guardarPapelera(papelera);
    repository.guardarHistorialCambios([cambio, ...estado.historialCambios]);
    marcarCambioLocal("Registro corporal enviado a papelera");
    encolarRegistro(registroEliminado);
    encolarEstadoGeneral(obtenerEstado());

    return {
      ok: true,
      mensaje: "Registro enviado a papelera."
    };
  }

  return {
    obtenerEstado,
    guardarConfiguracionInicial,
    guardarPerfil,
    guardarObjetivo,
    guardarPeso,
    guardarMedidas,
    editarRegistro,
    enviarAPapelera
  };
}
