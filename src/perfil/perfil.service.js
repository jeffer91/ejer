/*
  Nombre completo: perfil.service.js
  Ruta o ubicación: src/perfil/perfil.service.js

  Función:
    - Administrar los datos personales de Jeff dentro de FitJeff.
    - Validar edad, altura, peso inicial, peso actual y objetivo.
    - Calcular indicadores simples como IMC solo como referencia de seguimiento.
    - Preparar el perfil para guardado local y sincronización con Firebase.

  Se conecta con:
    - src/data/usuario-base.js
    - src/firebase/firestore.service.js
    - src/sincronizacion/sincronizacion.service.js
    - src/app.js cuando se separe la lógica del perfil.
*/

import { clonarUsuarioBase } from "../data/usuario-base.js";
import { guardarPerfilFirestore, leerPerfilFirestore } from "../firebase/firestore.service.js";

export function crearPerfilBase() {
  return clonarUsuarioBase().perfil;
}

export function normalizarPerfil(perfil = {}) {
  const base = crearPerfilBase();

  const perfilNormalizado = {
    ...base,
    ...perfil,
    edad: convertirNumero(perfil.edad, base.edad),
    alturaCm: convertirNumero(perfil.alturaCm, base.alturaCm),
    pesoInicialKg: convertirNumero(perfil.pesoInicialKg, base.pesoInicialKg),
    pesoActualKg: convertirNumero(perfil.pesoActualKg, base.pesoActualKg),
    fechaInicio: perfil.fechaInicio || base.fechaInicio,
    objetivoPrincipal: limpiarTexto(
      perfil.objetivoPrincipal || base.objetivoPrincipal
    ),
    nivel: limpiarTexto(perfil.nivel || base.nivel),
    notas: limpiarTexto(perfil.notas || base.notas)
  };

  perfilNormalizado.imcReferencia = calcularIMC(
    perfilNormalizado.pesoActualKg,
    perfilNormalizado.alturaCm
  );

  perfilNormalizado.actualizadoEn = new Date().toISOString();

  return perfilNormalizado;
}

export function validarPerfil(perfil) {
  const errores = [];

  if (!perfil) {
    errores.push("El perfil está vacío.");
    return { ok: false, errores };
  }

  if (!perfil.edad || perfil.edad < 10 || perfil.edad > 100) {
    errores.push("La edad debe ser un número válido.");
  }

  if (!perfil.alturaCm || perfil.alturaCm < 100 || perfil.alturaCm > 230) {
    errores.push("La altura debe estar en centímetros y ser válida.");
  }

  if (!perfil.pesoActualKg || perfil.pesoActualKg < 30 || perfil.pesoActualKg > 250) {
    errores.push("El peso actual debe ser un número válido en kg.");
  }

  if (!perfil.pesoInicialKg || perfil.pesoInicialKg < 30 || perfil.pesoInicialKg > 250) {
    errores.push("El peso inicial debe ser un número válido en kg.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}

export function actualizarPerfilActual(usuario, cambios) {
  const copia = structuredClone(usuario || clonarUsuarioBase());
  const perfil = normalizarPerfil({
    ...copia.perfil,
    ...cambios
  });

  const validacion = validarPerfil(perfil);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores,
      usuario: copia
    };
  }

  copia.perfil = perfil;
  copia.actualizadoEn = new Date().toISOString();

  return {
    ok: true,
    errores: [],
    usuario: copia,
    perfil
  };
}

export function calcularIMC(pesoKg, alturaCm) {
  const peso = Number(pesoKg);
  const alturaM = Number(alturaCm) / 100;

  if (!peso || !alturaM) {
    return null;
  }

  return redondear(peso / (alturaM * alturaM), 1);
}

export function interpretarIMCReferencia(imc) {
  if (!imc) {
    return "sin datos";
  }

  if (imc < 18.5) {
    return "bajo peso";
  }

  if (imc < 25) {
    return "rango medio";
  }

  if (imc < 30) {
    return "sobrepeso";
  }

  return "obesidad";
}

export function crearResumenPerfil(perfil = crearPerfilBase()) {
  const normalizado = normalizarPerfil(perfil);
  const imc = normalizado.imcReferencia;

  return {
    nombre: "Jeff",
    edad: normalizado.edad,
    alturaCm: normalizado.alturaCm,
    pesoInicialKg: normalizado.pesoInicialKg,
    pesoActualKg: normalizado.pesoActualKg,
    cambioPesoKg: redondear(normalizado.pesoActualKg - normalizado.pesoInicialKg, 1),
    imcReferencia: imc,
    lecturaIMC: interpretarIMCReferencia(imc),
    objetivoPrincipal: normalizado.objetivoPrincipal,
    nota:
      "El IMC se usa solo como referencia general. El progreso real se analiza con peso, rendimiento, energía, constancia y medidas futuras."
  };
}

export async function guardarPerfilEnFirebase(perfil) {
  const normalizado = normalizarPerfil(perfil);
  const validacion = validarPerfil(normalizado);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores
    };
  }

  const respuesta = await guardarPerfilFirestore(normalizado);

  return {
    ok: true,
    perfil: normalizado,
    firebase: respuesta
  };
}

export async function cargarPerfilDesdeFirebase() {
  const perfil = await leerPerfilFirestore();

  if (!perfil) {
    return null;
  }

  return normalizarPerfil(perfil);
}

function convertirNumero(valor, defecto) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function redondear(numero, decimales) {
  const factor = 10 ** decimales;
  return Math.round(numero * factor) / factor;
}
