/*
  Nombre completo: dispositivos.constants.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.constants.js

  Función o funciones:
    - Definir textos, fuentes, estados y estructura base de Dispositivos.
    - Mantener Cubitt CT4, Google Fit y puente de importación separados.
    - Evitar textos que prometan lectura real cuando solo existe importación manual/puente.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/features/actividad/dispositivos/dispositivos.view.js
    - src/features/actividad/dispositivos/dispositivos-import-bridge.service.js
*/

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
  SUBTITULO: "FitJeff todavía no lee datos reales del reloj o Google Fit automáticamente. Por ahora usa un puente claro de importación CSV/JSON.",
  CUBITT_TITULO: "Cubitt CT4",
  GOOGLE_FIT_TITULO: "Google Fit",
  PUENTE_TITULO: "Puente FitJeff",
  IMPORTAR_TITULO: "Importar actividad",
  BOTON_GUARDAR: "Guardar preparación",
  BOTON_IMPORTAR: "Importar datos pegados",
  EXITO: "Preparación guardada localmente.",
  AVISO_PRIVADO: "El identificador del reloj se guarda solo en tu PC cuando lo escribes en la app. No queda fijo en el código.",
  IMPORTAR_AYUDA: "Pega datos exportados con columnas: fecha, pasos, bicicletaMin, bicicletaKm, fuente, nota. También acepta JSON con esos campos."
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
    version: "0.2.0",
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
      nota: "Preparado para conectar cuando se implemente OAuth/API real."
    },
    puente: {
      fuentePreferida: DISPOSITIVOS_FUENTES.MANUAL,
      importarPasos: true,
      importarBicicleta: true,
      evitarDuplicados: true,
      estado: DISPOSITIVOS_ESTADOS.PREPARADO,
      ultimoImportadoEn: "",
      ultimoResultadoImportacion: ""
    },
    historial: []
  };
}
