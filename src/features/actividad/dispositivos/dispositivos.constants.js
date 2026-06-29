/*
  Nombre completo: dispositivos.constants.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.constants.js

  Función o funciones:
    - Definir textos, fuentes, estados y estructura base de Dispositivos.
    - Mantener Cubitt CT4, Google Fit y puente de importación separados.
    - Preparar anexado Bluetooth local de Cubitt CT4 sin prometer lectura automática de pasos.
    - Preparar estructura para exploración privada GATT y comparación de lecturas HEX.
    - Guardar la página actual del asistente de verificaciones Bluetooth.

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
  TITULO: "Dispositivos y Bluetooth",
  SUBTITULO: "Anexa tu Cubitt CT4 por Bluetooth desde esta PC. Primero se guarda el reloj; luego se exploran servicios privados para encontrar pasos.",
  CUBITT_TITULO: "Cubitt CT4",
  GOOGLE_FIT_TITULO: "Google Fit",
  PUENTE_TITULO: "Puente FitJeff",
  IMPORTAR_TITULO: "Importar actividad",
  EXPLORADOR_TITULO: "Verificaciones privadas Cubitt CT4",
  BOTON_GUARDAR: "Guardar preparación",
  BOTON_IMPORTAR: "Importar datos pegados",
  BOTON_BLUETOOTH_ANEXAR: "Escanear y anexar reloj",
  BOTON_BLUETOOTH_PROBAR: "Probar conexión",
  BOTON_EXPLORAR_PRIVADO: "Explorar servicios privados",
  BOTON_LECTURA_1: "Tomar lectura 1",
  BOTON_LECTURA_2: "Tomar lectura 2",
  BOTON_COMPARAR: "Comparar cambios",
  BOTON_ANTERIOR: "Anterior",
  BOTON_SIGUIENTE: "Siguiente",
  EXITO: "Preparación guardada localmente.",
  BLUETOOTH_EXITO: "Reloj anexado localmente.",
  AVISO_PRIVADO: "El identificador Bluetooth y las lecturas HEX se guardan solo en tu PC. No se suben al código.",
  IMPORTAR_AYUDA: "Pega datos exportados con columnas: fecha, pasos, bicicletaMin, bicicletaKm, fuente, nota. También acepta JSON con esos campos."
});

export const CUBITT_BASE = Object.freeze({
  marca: "Cubitt",
  modelo: "CT4",
  variante: "v59",
  alias: "Cubitt CT4",
  identificadorLocal: "",
  bluetoothNombre: "",
  bluetoothId: "",
  bluetoothAnexadoEn: "",
  bluetoothUltimaConexionEn: "",
  bluetoothUltimoDiagnostico: "",
  bluetoothBateria: null,
  bluetoothFabricante: "",
  bluetoothModeloDetectado: "",
  bluetoothServiciosLeidos: [],
  bluetoothExploracion: null,
  bluetoothLectura1: null,
  bluetoothLectura2: null,
  bluetoothComparacion: null,
  bluetoothVerificacionPagina: 1
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
    version: "0.4.1",
    actualizadoEn: "",
    cubitt: {
      ...CUBITT_BASE,
      activo: false,
      estado: DISPOSITIVOS_ESTADOS.PENDIENTE,
      ultimoIntento: "",
      nota: "Pendiente de anexar por Bluetooth desde esta PC."
    },
    googleFit: {
      ...GOOGLE_FIT_BASE,
      activo: false,
      estado: DISPOSITIVOS_ESTADOS.PREPARADO,
      ultimoIntento: "",
      nota: "Opcional. Para este reloj viejo, el camino principal será Bluetooth directo en FitJeff."
    },
    puente: {
      fuentePreferida: DISPOSITIVOS_FUENTES.CUBITT,
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
