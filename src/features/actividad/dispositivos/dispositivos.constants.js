export const DISPOSITIVOS_STORAGE_KEY = "fitjeff:actividad:dispositivos:v1";

export const DISPOSITIVOS_ESTADOS = Object.freeze({
  PREPARADO: "preparado",
  PENDIENTE: "pendiente",
  CONECTADO: "conectado",
  ERROR: "error"
});

export const DISPOSITIVOS_FUENTES = Object.freeze({
  MANUAL: "manual",
  CUBITT: "cubitt",
  GOOGLE_FIT: "google-fit"
});

export const DISPOSITIVOS_TEXTOS = Object.freeze({
  TITULO: "Dispositivos y Google Fit",
  SUBTITULO: "Deja preparado tu reloj, Google Fit y el puente de datos. Este bloque no lee datos reales todavía.",
  CUBITT_TITULO: "Cubitt CT4",
  GOOGLE_FIT_TITULO: "Google Fit",
  PUENTE_TITULO: "Puente FitJeff",
  BOTON_GUARDAR: "Guardar preparación",
  EXITO: "Preparación guardada localmente.",
  AVISO_PRIVADO: "El identificador del reloj se guarda solo en tu PC cuando lo escribes en la app. No queda fijo en el código."
});

export const CUBITT_BASE = Object.freeze({
  marca: "Cubitt",
  modelo: "CT4",
  variante: "v59",
  alias: "Cubitt CT4",
  identificadorLocal: ""
});

export const GOOGLE_FIT_BASE = Object.freeze({
  proveedor: "Google Fit",
  cuenta: "",
  lecturaPasos: true,
  lecturaBicicleta: true,
  sincronizacionAutomatica: false
});

export function crearEstadoDispositivosBase() {
  return {
    version: "0.1.0",
    actualizadoEn: "",
    cubitt: {
      ...CUBITT_BASE,
      activo: false,
      estado: DISPOSITIVOS_ESTADOS.PREPARADO,
      ultimoIntento: "",
      nota: "Preparado para guardar el identificador local del reloj desde la app."
    },
    googleFit: {
      ...GOOGLE_FIT_BASE,
      activo: false,
      estado: DISPOSITIVOS_ESTADOS.PREPARADO,
      ultimoIntento: "",
      nota: "Preparado para conectar cuando se implemente el conector real."
    },
    puente: {
      fuentePreferida: DISPOSITIVOS_FUENTES.MANUAL,
      importarPasos: true,
      importarBicicleta: true,
      evitarDuplicados: true,
      estado: DISPOSITIVOS_ESTADOS.PREPARADO
    },
    historial: []
  };
}
