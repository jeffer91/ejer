function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : null;
}

function redondear(valor, decimales = 1) {
  if (!Number.isFinite(valor)) return null;
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function clasificarCinturaAltura(relacion) {
  if (!Number.isFinite(relacion)) return { estado: "empty", texto: "Sin dato", nivel: "sin-dato" };
  if (relacion < 0.5) return { estado: "success", texto: "Rango central saludable", nivel: "saludable" };
  if (relacion < 0.6) return { estado: "pending", texto: "Revisar zona central", nivel: "revisar" };
  return { estado: "alert", texto: "Zona central alta", nivel: "alto" };
}

function clasificarImc(valor) {
  if (!Number.isFinite(valor)) return { estado: "empty", texto: "Sin dato", nivel: "sin-dato" };
  if (valor < 18.5) return { estado: "pending", texto: "IMC bajo", nivel: "bajo" };
  if (valor < 25) return { estado: "success", texto: "IMC en rango habitual", nivel: "saludable" };
  if (valor < 30) return { estado: "info", texto: "IMC elevado", nivel: "elevado" };
  return { estado: "alert", texto: "IMC muy alto", nivel: "alto" };
}

function interpretarCombinado({ imcClasificacion, cinturaClasificacion, nivelMuscular }) {
  const muscular = ["medio", "alto"].includes(String(nivelMuscular || "").toLowerCase());

  if (imcClasificacion.nivel === "alto" && cinturaClasificacion.nivel === "saludable" && muscular) {
    return {
      estado: "info",
      titulo: "Peso alto, lectura por confirmar",
      resumen: "El IMC sale alto, pero la cintura/altura no confirma acumulación central. Para personas fuertes conviene mirar medidas, fuerza y tendencia, no solo la báscula."
    };
  }

  if (cinturaClasificacion.nivel === "alto") {
    return {
      estado: "alert",
      titulo: "Zona central alta",
      resumen: "La relación cintura/altura está alta. Es una señal útil para revisar hábitos, descanso, actividad y seguimiento, sin depender solo del peso."
    };
  }

  if (imcClasificacion.nivel === "elevado" || imcClasificacion.nivel === "alto") {
    return {
      estado: "info",
      titulo: "IMC elevado, falta contexto",
      resumen: "El peso en relación con la altura está elevado. La lectura mejora con cuello, cintura y contexto muscular."
    };
  }

  if (imcClasificacion.nivel === "saludable" && cinturaClasificacion.nivel === "saludable") {
    return {
      estado: "success",
      titulo: "Lectura corporal equilibrada",
      resumen: "IMC y cintura/altura están en rangos favorables. Mantén registros constantes para ver tendencia real."
    };
  }

  return {
    estado: "pending",
    titulo: "Faltan datos para una lectura completa",
    resumen: "Registra peso, altura, cintura y cuello para que FitJeff compare más que el IMC."
  };
}

function construirFaltantes({ perfil, pesoActualKg, medidas }) {
  const faltantes = [];
  if (!pesoActualKg) faltantes.push("peso actual");
  if (!perfil?.alturaCm) faltantes.push("altura");
  if (!perfil?.nivelMuscular) faltantes.push("contexto muscular");
  if (!medidas?.cinturaCm) faltantes.push("cintura");
  if (!medidas?.cuelloCm) faltantes.push("cuello");
  return faltantes;
}

export function construirAnalisisCorporal({ perfil = {}, pesoActualKg = null, medidas = {}, imc = {} } = {}) {
  const alturaCm = numero(perfil.alturaCm);
  const cinturaCm = numero(medidas.cinturaCm);
  const cuelloCm = numero(medidas.cuelloCm);
  const relacionCinturaAltura = alturaCm && cinturaCm ? redondear(cinturaCm / alturaCm, 2) : null;
  const imcValor = numero(imc?.valor);
  const imcClasificacion = clasificarImc(imcValor);
  const cinturaClasificacion = clasificarCinturaAltura(relacionCinturaAltura);
  const lectura = interpretarCombinado({
    imcClasificacion,
    cinturaClasificacion,
    nivelMuscular: perfil.nivelMuscular
  });
  const faltantes = construirFaltantes({ perfil, pesoActualKg, medidas });

  return {
    disponible: faltantes.length <= 2,
    estado: lectura.estado,
    titulo: lectura.titulo,
    resumen: lectura.resumen,
    aviso: "Lectura orientativa: no reemplaza una valoración profesional ni debe usarse para etiquetar cuerpos.",
    faltantes,
    datos: {
      pesoActualKg: numero(pesoActualKg),
      alturaCm,
      nivelMuscular: perfil.nivelMuscular || "sin-dato",
      imc: imcValor,
      imcTexto: imcClasificacion.texto,
      relacionCinturaAltura,
      cinturaAlturaTexto: cinturaClasificacion.texto,
      cuelloCm,
      cinturaCm,
      caderaCm: numero(medidas.caderaCm)
    },
    avatar: {
      estado: lectura.estado,
      imcNivel: imcClasificacion.nivel,
      cinturaNivel: cinturaClasificacion.nivel,
      muscular: ["medio", "alto"].includes(String(perfil.nivelMuscular || "").toLowerCase())
    }
  };
}
