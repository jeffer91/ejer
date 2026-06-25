/*
  Nombre completo: historial.service.js
  Ruta o ubicación: src/modules/registro/historial/historial.service.js

  Función o funciones:
    - Leer registros guardados del módulo Registro.
    - Ordenar el historial de forma compacta por fecha.
    - Editar peso o medidas usando el servicio central de Registro.
    - Enviar registros a papelera sin borrarlos definitivamente.
    - Consultar cambios guardados de cada registro.

  Se conecta con:
    - src/modules/registro/registro.service.js
    - src/modules/registro/historial/historial.formatter.js
    - src/modules/registro/ingreso/ingreso.parser.js
*/

import { crearRegistroService } from "../registro.service.js";
import { convertirACm, convertirAKg } from "../ingreso/ingreso.parser.js";
import { formatearResumenRegistro, formatearTituloRegistro } from "./historial.formatter.js";

function ordenarRegistrosDesc(registros) {
  return [...registros].sort((a, b) => {
    const fechaA = `${a.fecha || ""} ${a.creadoEn || ""}`;
    const fechaB = `${b.fecha || ""} ${b.creadoEn || ""}`;
    return fechaB.localeCompare(fechaA);
  });
}

function limpiarMedidas(datos) {
  const limpio = {};

  Object.entries(datos || {}).forEach(([campo, valor]) => {
    if (valor === "" || valor === null || valor === undefined) {
      return;
    }

    const numero = convertirACm(valor);

    if (numero !== null) {
      limpio[campo] = numero;
    }
  });

  return limpio;
}

export function crearHistorialService(registroService = crearRegistroService()) {
  function listarRegistros() {
    const estado = registroService.obtenerEstado();

    return ordenarRegistrosDesc(estado.registros || []).map((registro) => ({
      ...registro,
      titulo: formatearTituloRegistro(registro),
      resumen: formatearResumenRegistro(registro)
    }));
  }

  function obtenerRegistro(registroId) {
    return listarRegistros().find((registro) => registro.id === registroId) || null;
  }

  function editarPeso(registroId, nuevoPeso) {
    const pesoKg = convertirAKg(nuevoPeso);

    if (pesoKg === null || pesoKg < 30 || pesoKg > 250) {
      return {
        ok: false,
        mensaje: "Escribe un peso válido."
      };
    }

    return registroService.editarRegistro(registroId, { pesoKg });
  }

  function editarMedidas(registroId, nuevasMedidas) {
    const medidasLimpias = limpiarMedidas(nuevasMedidas);

    if (Object.keys(medidasLimpias).length === 0) {
      return {
        ok: false,
        mensaje: "No se ingresaron medidas para actualizar."
      };
    }

    return registroService.editarRegistro(registroId, medidasLimpias);
  }

  function enviarAPapelera(registroId) {
    return registroService.enviarAPapelera(registroId);
  }

  function obtenerCambios(registroId) {
    const estado = registroService.obtenerEstado();
    return (estado.historialCambios || []).filter((cambio) => cambio.registroId === registroId);
  }

  return {
    listarRegistros,
    obtenerRegistro,
    editarPeso,
    editarMedidas,
    enviarAPapelera,
    obtenerCambios
  };
}
