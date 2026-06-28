function valor(valor, sufijo = "") {
  if (valor === null || valor === undefined || valor === "") return "Sin dato";
  return `${valor}${sufijo}`;
}

function estadoMetrica(estado) {
  if (["success", "info", "pending", "alert", "empty"].includes(estado)) return estado;
  return "info";
}

export function prepararAnalisisCorporalVista(analisis = {}) {
  const datos = analisis.datos || {};
  const faltantes = analisis.faltantes || [];

  return {
    estado: analisis.estado || "pending",
    titulo: analisis.titulo || "Análisis corporal",
    resumen: analisis.resumen || "Registra más datos para mejorar la lectura corporal.",
    aviso: analisis.aviso || "Lectura orientativa.",
    faltantes,
    avatar: analisis.avatar || { estado: "pending", imcNivel: "sin-dato", cinturaNivel: "sin-dato", muscular: false },
    metricas: [
      {
        id: "imc-contextual",
        titulo: "IMC contextual",
        valor: valor(datos.imc),
        detalle: datos.imcTexto || "Sin dato",
        estado: estadoMetrica(analisis.estado)
      },
      {
        id: "cintura-altura",
        titulo: "Cintura / altura",
        valor: valor(datos.relacionCinturaAltura),
        detalle: datos.cinturaAlturaTexto || "Sin dato",
        estado: datos.relacionCinturaAltura ? estadoMetrica(analisis.estado) : "empty"
      },
      {
        id: "grasa-estimada",
        titulo: "Grasa estimada",
        valor: datos.grasaEstimada ? valor(datos.grasaEstimada, "%") : "Sin dato",
        detalle: datos.grasaEstimada ? "Estimación técnica orientativa" : "Requiere sexo, cuello y medidas",
        estado: datos.grasaEstimada ? "info" : "empty"
      },
      {
        id: "nivel-muscular",
        titulo: "Contexto muscular",
        valor: datos.nivelMuscular || "Sin dato",
        detalle: "Ayuda a no juzgar solo por peso",
        estado: datos.nivelMuscular && datos.nivelMuscular !== "sin-dato" ? "success" : "empty"
      }
    ]
  };
}
