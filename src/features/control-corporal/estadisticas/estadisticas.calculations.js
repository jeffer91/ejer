/*
  Nombre completo: estadisticas.calculations.js
  Ruta o ubicacion: src/features/control-corporal/estadisticas/estadisticas.calculations.js

  Funcion o funciones:
    - Calcular peso actual, peso inicial, cambio total, tendencia, IMC y proxima medicion.
    - Preparar datos visuales para tarjetas, grafico, barra de progreso y mensaje inteligente.
    - Integrar análisis corporal inteligente con cintura/altura y contexto muscular.
    - Evitar conclusiones falsas cuando hay pocos registros.
    - Interpretar progreso de peso sin promover cambios extremos.
    - Usar fecha local en proxima medicion para evitar desfases por UTC.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.service.js
    - src/features/control-corporal/estadisticas/estadisticas.constants.js
    - src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js
    - src/core/utils/date.util.js
*/

import { formatearFechaLocalISO } from "../../../core/utils/date.util.js";
import { construirAnalisisCorporal } from "../analisis-corporal/analisis-corporal.calculations.js";
import { ESTADISTICAS_TENDENCIAS } from "./estadisticas.constants.js";

function ordenarPorFechaAsc(registros) {
  return [...registros].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
}

function redondear(valor, decimales = 1) {
  if (!Number.isFinite(valor)) {
    return null;
  }

  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function diasEntre(fechaInicio, fechaFin) {
  const inicio = new Date(`${fechaInicio}T12:00:00`);
  const fin = new Date(`${fechaFin}T12:00:00`);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null;
  return Math.max(Math.round((fin - inicio) / 86400000), 0);
}

function buscarPesoDesde(pesos, diasAtras) {
  if (!pesos.length) return null;

  const ultimo = pesos[pesos.length - 1];
  const fechaUltima = new Date(`${ultimo.fecha}T12:00:00`);

  if (Number.isNaN(fechaUltima.getTime())) return null;

  const fechaLimite = new Date(fechaUltima);
  fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

  const candidatos = pesos.filter((registro) => {
    const fecha = new Date(`${registro.fecha}T12:00:00`);
    return !Number.isNaN(fecha.getTime()) && fecha <= fechaLimite;
  });

  return candidatos[candidatos.length - 1] || pesos[0] || null;
}

function calcularCambioContra(pesoActual, registroReferencia) {
  if (!pesoActual || !registroReferencia?.datos?.pesoKg) return null;
  return redondear(Number(pesoActual) - Number(registroReferencia.datos.pesoKg), 1);
}

export function obtenerRegistrosPeso(registros) {
  return ordenarPorFechaAsc(
    registros.filter((registro) => registro.tipo === "peso" && registro.estado !== "eliminado" && registro.datos?.pesoKg)
  );
}

export function obtenerRegistrosMedidas(registros) {
  return ordenarPorFechaAsc(
    registros.filter((registro) => registro.tipo === "medidas" && registro.estado !== "eliminado")
  );
}

export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) {
    return null;
  }

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  if (Number.isNaN(nacimiento.getTime())) {
    return null;
  }

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad;
}

export function calcularImc(pesoKg, alturaCm) {
  if (!pesoKg || !alturaCm) {
    return { valor: null, categoria: "Faltan datos" };
  }

  const alturaM = alturaCm / 100;
  const valor = redondear(pesoKg / (alturaM * alturaM), 1);

  if (valor < 18.5) return { valor, categoria: "Bajo" };
  if (valor < 25) return { valor, categoria: "Normal" };
  if (valor < 30) return { valor, categoria: "Elevado" };
  return { valor, categoria: "Muy alto" };
}

export function calcularTendencia(pesos) {
  if (pesos.length < 3) {
    return ESTADISTICAS_TENDENCIAS.INSUFICIENTE;
  }

  const ultimos = pesos.slice(-3);
  const primero = Number(ultimos[0].datos.pesoKg);
  const ultimo = Number(ultimos[ultimos.length - 1].datos.pesoKg);
  const diferencia = redondear(ultimo - primero, 1);

  if (diferencia <= -0.3) return ESTADISTICAS_TENDENCIAS.BAJANDO;
  if (diferencia >= 0.3) return ESTADISTICAS_TENDENCIAS.SUBIENDO;
  return ESTADISTICAS_TENDENCIAS.ESTABLE;
}

export function calcularProgresoObjetivo(pesoInicialKg, pesoActualKg, pesoObjetivoKg) {
  if (!pesoInicialKg || !pesoActualKg || !pesoObjetivoKg || pesoInicialKg === pesoObjetivoKg) {
    return 0;
  }

  const distanciaTotal = Math.abs(pesoInicialKg - pesoObjetivoKg);
  const distanciaPendiente = Math.abs(pesoActualKg - pesoObjetivoKg);
  const porcentaje = ((distanciaTotal - distanciaPendiente) / distanciaTotal) * 100;

  return Math.max(0, Math.min(100, Math.round(porcentaje)));
}

function calcularFaltanteObjetivo(pesoActualKg, pesoObjetivoKg) {
  if (!pesoActualKg || !pesoObjetivoKg) return null;
  return redondear(Math.abs(Number(pesoActualKg) - Number(pesoObjetivoKg)), 1);
}

function obtenerDireccionObjetivo(pesoInicialKg, pesoObjetivoKg) {
  if (!pesoInicialKg || !pesoObjetivoKg || pesoInicialKg === pesoObjetivoKg) return "mantener";
  return pesoObjetivoKg < pesoInicialKg ? "bajar" : "subir";
}

function construirMensajeInteligente({ pesos, pesoInicial, pesoActual, pesoObjetivo, cambioTotalKg, faltanteObjetivoKg, progresoObjetivo, tendencia }) {
  if (!pesoActual) return "Registra tu primer peso para activar el panel visual de progreso.";
  if (pesos.length < 2) return "Ya tienes tu primer registro. Agrega otro peso en unos días para ver tendencia.";
  if (!pesoObjetivo) return "Agrega una meta de peso para ver la barra de avance y el faltante.";

  const direccion = obtenerDireccionObjetivo(pesoInicial, pesoObjetivo);
  const partes = [];

  if (cambioTotalKg !== null) {
    const cambioTexto = cambioTotalKg > 0 ? `subido ${Math.abs(cambioTotalKg)} kg` : `bajado ${Math.abs(cambioTotalKg)} kg`;
    partes.push(`Desde el inicio has ${cambioTexto}.`);
  }

  if (progresoObjetivo >= 100) {
    partes.push("Llegaste a tu meta registrada; ahora conviene mantener registros constantes.");
  } else if (faltanteObjetivoKg !== null) {
    partes.push(`Te faltan ${faltanteObjetivoKg} kg para tu meta de ${pesoObjetivo} kg.`);
  }

  if (tendencia === ESTADISTICAS_TENDENCIAS.BAJANDO && direccion === "bajar") partes.push("La tendencia reciente va alineada con tu objetivo." );
  if (tendencia === ESTADISTICAS_TENDENCIAS.SUBIENDO && direccion === "subir") partes.push("La tendencia reciente va alineada con tu objetivo." );
  if (tendencia === ESTADISTICAS_TENDENCIAS.ESTABLE) partes.push("Tu peso está estable; revisa también medidas y energía, no solo la báscula.");
  if (tendencia === ESTADISTICAS_TENDENCIAS.INSUFICIENTE) partes.push("Aún faltan registros para una tendencia confiable.");

  return partes.filter(Boolean).join(" ");
}

export function calcularProximaMedicion(medidas) {
  if (medidas.length === 0) {
    return {
      texto: "Pendiente",
      pendiente: true
    };
  }

  const ultima = medidas[medidas.length - 1];
  const fecha = new Date(`${ultima.fecha}T12:00:00`);
  fecha.setDate(fecha.getDate() + 7);

  const hoy = new Date();
  const pendiente = fecha < hoy;

  return {
    texto: pendiente ? "Pendiente" : formatearFechaLocalISO(fecha),
    pendiente
  };
}

export function obtenerUltimasMedidas(medidas) {
  const ultima = medidas[medidas.length - 1];
  return ultima?.datos || {};
}

export function prepararGraficoPeso(pesos) {
  return pesos.map((registro) => ({
    fecha: registro.fecha,
    valor: Number(registro.datos.pesoKg)
  }));
}

export function construirResumenEstadisticas(estado) {
  const pesos = obtenerRegistrosPeso(estado.registros || []);
  const medidas = obtenerRegistrosMedidas(estado.registros || []);
  const primerRegistroPeso = pesos[0] || null;
  const registroSemana = buscarPesoDesde(pesos, 7);
  const registroMes = buscarPesoDesde(pesos, 30);
  const primerPeso = primerRegistroPeso?.datos?.pesoKg || null;
  const pesoAnterior = pesos.length > 1 ? pesos[pesos.length - 2].datos.pesoKg : null;
  const pesoActual = pesos[pesos.length - 1]?.datos?.pesoKg || null;
  const pesoObjetivo = estado.objetivo?.pesoObjetivoKg || null;
  const ultimasMedidas = obtenerUltimasMedidas(medidas);
  const cambioKg = pesoAnterior && pesoActual ? redondear(pesoActual - pesoAnterior, 1) : null;
  const cambioTotalKg = pesoActual && primerPeso ? redondear(pesoActual - primerPeso, 1) : null;
  const cambioSemanaKg = calcularCambioContra(pesoActual, registroSemana);
  const cambioMesKg = calcularCambioContra(pesoActual, registroMes);
  const imc = calcularImc(pesoActual, estado.perfil?.alturaCm);
  const progresoObjetivo = calcularProgresoObjetivo(primerPeso, pesoActual, pesoObjetivo);
  const tendencia = calcularTendencia(pesos);
  const faltanteObjetivoKg = calcularFaltanteObjetivo(pesoActual, pesoObjetivo);
  const diasRegistro = primerRegistroPeso && pesos[pesos.length - 1] ? diasEntre(primerRegistroPeso.fecha, pesos[pesos.length - 1].fecha) : null;
  const analisisCorporal = construirAnalisisCorporal({
    perfil: estado.perfil || {},
    pesoActualKg: pesoActual,
    medidas: ultimasMedidas,
    imc
  });

  return {
    pesoInicialKg: primerPeso,
    pesoActualKg: pesoActual,
    pesoObjetivoKg: pesoObjetivo,
    cambioKg,
    cambioTotalKg,
    cambioSemanaKg,
    cambioMesKg,
    faltanteObjetivoKg,
    direccionObjetivo: obtenerDireccionObjetivo(primerPeso, pesoObjetivo),
    diasRegistro,
    tendencia,
    edad: calcularEdad(estado.perfil?.fechaNacimiento),
    imc,
    analisisCorporal,
    progresoObjetivo,
    mensajeInteligente: construirMensajeInteligente({
      pesos,
      pesoInicial: primerPeso,
      pesoActual,
      pesoObjetivo,
      cambioTotalKg,
      faltanteObjetivoKg,
      progresoObjetivo,
      tendencia
    }),
    proximaMedicion: calcularProximaMedicion(medidas),
    ultimasMedidas,
    graficoPeso: prepararGraficoPeso(pesos),
    cantidadPesos: pesos.length,
    cantidadMedidas: medidas.length
  };
}
