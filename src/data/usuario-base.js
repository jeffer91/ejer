/*
  Nombre completo: usuario-base.js
  Ruta o ubicación: src/data/usuario-base.js

  Función:
    - Definir el usuario principal de FitJeff.
    - Guardar perfil inicial, control de sincronización y preferencias base.
    - Entregar copias limpias para evitar mutar el objeto original.

  Se conecta con:
    - src/storage/local-storage.service.js
    - src/perfil/perfil.service.js
    - src/app-controller.js
    - src/firebase/firestore.service.js
*/

export const USUARIO_BASE = {
  id: "jeff",
  nombre: "Jeff",
  app: "FitJeff",
  creadoEn: "2026-06-22T00:00:00.000Z",
  perfil: {
    nombre: "Jeff",
    edad: 35,
    alturaCm: 174,
    pesoInicialKg: 91,
    pesoActualKg: 91,
    fechaInicio: "2026-06-22",
    objetivoPrincipal: "Mejorar rendimiento, constancia y técnica.",
    nivel: "inicial-retomando",
    notas: "Rutina personal de 4 días."
  },
  control: {
    usuarioPrincipalId: "jeff",
    versionDatos: 1,
    ultimaSincronizacion: null,
    ultimoEntrenamientoId: null,
    ultimoPesoId: null
  },
  preferencias: {
    idioma: "es-EC",
    unidadPeso: "kg",
    unidadAltura: "cm",
    usarFalloTecnico: true,
    recordarSeguridad: true
  }
};

export function clonarUsuarioBase() {
  return structuredCloneSeguro(USUARIO_BASE);
}

export function obtenerPerfilBase() {
  return clonarUsuarioBase().perfil;
}

export function crearUsuarioConPerfil(perfil = {}) {
  const usuario = clonarUsuarioBase();
  usuario.perfil = {
    ...usuario.perfil,
    ...perfil
  };
  return usuario;
}

export function normalizarUsuarioBase(usuario = {}) {
  const base = clonarUsuarioBase();

  return {
    ...base,
    ...usuario,
    perfil: {
      ...base.perfil,
      ...(usuario.perfil || {})
    },
    control: {
      ...base.control,
      ...(usuario.control || {})
    },
    preferencias: {
      ...base.preferencias,
      ...(usuario.preferencias || {})
    }
  };
}

function structuredCloneSeguro(valor) {
  if (typeof structuredClone === "function") {
    return structuredClone(valor);
  }

  return JSON.parse(JSON.stringify(valor));
}
