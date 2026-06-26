/*
  Nombre completo: registro.service.js
  Ruta o ubicación: src/features/control-corporal/registro.service.js

  Función o funciones:
    - Coordinar las operaciones principales de Control corporal.
    - Guardar perfil, objetivo, peso y medidas usando el repository.
    - Registrar cambios para que el Historial pueda mostrar correcciones.
    - No mezclar lógica visual con guardado de datos.

  Se conecta con:
    - src/features/control-corporal/registro.repository.js
    - src/features/control-corporal/registro.state.js
    - src/features/control-corporal/registro.constants.js
*/

import { crearRegistroRepository } from "./registro.repository.js";
import { crearCambioRegistro, crearRegistroBase } from "./registro.state.js";

function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

function existePesoEnFecha(registros, fecha) {
  return registros.some((registro) => {
    return registro.tipo === "peso" && registro.fecha === fecha && registro.estado !== "eliminado";
  });
}

export function crearRegistroService(repository = crearRegistroRepository()) {
  function obtenerEstado() {
    return repository.obtenerEstado();
  }

  function guardarPerfil(datosPerfil) {
    const estado = obtenerEstado();
    const perfil = {
      ...estado.perfil,
      ...datosPerfil,
      configurado: true,
      actualizadoEn: new Date().toISOString()
    };

    repository.guardarPerfil(perfil);
    return perfil;
  }

  function guardarObjetivo(datosObjetivo) {
    const estado = obtenerEstado();
    const objetivo = {
      ...estado.objetivo,
      ...datosObjetivo,
      actualizadoEn: new Date().toISOString()
    };

    repository.guardarObjetivo(objetivo);
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

    return {
      ok: true,
      mensaje: "Peso guardado.",
      registro
    };
  }

  function guardarMedidas(datosMedidas) {
    const estado = obtenerEstado();
    const registro = crearRegistroBase("medidas", {
      ...datosMedidas,
      fecha: datosMedidas?.fecha || fechaHoy()
    });

    const registros = [registro, ...estado.registros];
    repository.guardarRegistros(registros);

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
        actualizadoEn: new Date().toISOString()
      };
    });

    const antes = estado.registros.find((registro) => registro.id === registroId) || null;
    const despues = registros.find((registro) => registro.id === registroId) || null;
    const cambio = crearCambioRegistro({ registroId, accion: "editar", antes, despues });

    repository.guardarRegistros(registros);
    repository.guardarHistorialCambios([cambio, ...estado.historialCambios]);

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

    const registros = estado.registros.filter((item) => item.id !== registroId);
    const papelera = [{ ...registro, estado: "eliminado", eliminadoEn: new Date().toISOString() }, ...estado.papelera];
    const cambio = crearCambioRegistro({ registroId, accion: "enviar-a-papelera", antes: registro, despues: null });

    repository.guardarRegistros(registros);
    repository.guardarPapelera(papelera);
    repository.guardarHistorialCambios([cambio, ...estado.historialCambios]);

    return {
      ok: true,
      mensaje: "Registro enviado a papelera."
    };
  }

  return {
    obtenerEstado,
    guardarPerfil,
    guardarObjetivo,
    guardarPeso,
    guardarMedidas,
    editarRegistro,
    enviarAPapelera
  };
}
