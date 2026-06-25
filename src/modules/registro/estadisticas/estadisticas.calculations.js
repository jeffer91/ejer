/*
  Nombre completo: estadisticas.calculations.js
  Ruta o ubicación: src/modules/registro/estadisticas/estadisticas.calculations.js

  Función o funciones:
    - Calcular peso actual, cambios, tendencia, IMC y próxima medición.
    - Preparar datos simples para tarjetas y gráfico de peso.
    - Evitar conclusiones falsas cuando hay pocos registros.

  Se conecta con:
    - src/modules/registro/estadisticas/estadisticas.service.js
    - src/modules/registro/estadisticas/estadisticas.constants.js
*/

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
  if (valor < 30) return { valor, categoria: "Sobrepeso" };
  return { valor, categoria: "Alto" };
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

  const avance = pesoInicialKg - pesoActualKg;
  const meta = pesoInicialKg - pesoObjetivoKg;
  const porcentaje = (avance / meta) * 100;

  return Math.max(0, Math.min(100, Math.round(porcentaje)));
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
    texto: pendiente ? "Pendiente" : fecha.toISOString().slice(0, 10),
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
  const primerPeso = pesos[0]?.datos?.pesoKg || null;
  const pesoAnterior = pesos.length > 1 ? pesos[pesos.length - 2].datos.pesoKg : null;
  const pesoActual = pesos[pesos.length - 1]?.datos?.pesoKg || null;
  const pesoObjetivo = estado.objetivo?.pesoObjetivoKg || null;
  const cambioKg = pesoAnterior && pesoActual ? redondear(pesoActual - pesoAnterior, 1) : null;
  const imc = calcularImc(pesoActual, estado.perfil?.alturaCm);

  return {
    pesoActualKg: pesoActual,
    pesoObjetivoKg: pesoObjetivo,
    cambioKg,
    tendencia: calcularTendencia(pesos),
    edad: calcularEdad(estado.perfil?.fechaNacimiento),
    imc,
    progresoObjetivo: calcularProgresoObjetivo(primerPeso, pesoActual, pesoObjetivo),
    proximaMedicion: calcularProximaMedicion(medidas),
    ultimasMedidas: obtenerUltimasMedidas(medidas),
    graficoPeso: prepararGraficoPeso(pesos),
    cantidadPesos: pesos.length,
    cantidadMedidas: medidas.length
  };
}
