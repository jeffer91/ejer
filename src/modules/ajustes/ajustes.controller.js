/*
  Nombre completo: ajustes.controller.js
  Ruta o ubicación: src/modules/ajustes/ajustes.controller.js

  Función o funciones:
    - Montar la pantalla Ajustes.
    - Guardar cambios de perfil y objetivo.
    - Reabrir Inicio cuando el usuario lo confirme.
    - Exportar e importar copias de seguridad locales.
    - Mantener Ajustes simple, sin mostrar datos técnicos.

  Se conecta con:
    - src/modules/ajustes/ajustes.service.js
    - src/modules/ajustes/ajustes.view.js
    - src/modules/ajustes/ajustes.constants.js
    - src/core/backup/backup.service.js
    - src/app/app-router.js
*/

import { crearBackupService } from "../../core/backup/backup.service.js";
import { AJUSTES_TEXTOS } from "./ajustes.constants.js";
import { crearAjustesService } from "./ajustes.service.js";
import { crearAjustesView, leerFormularioAjustes, mostrarErroresAjustes, mostrarMensajeAjustes } from "./ajustes.view.js";

export function crearAjustesController({ alReabrirInicio } = {}) {
  const service = crearAjustesService();
  const backupService = crearBackupService();

  function guardarPerfil(vista) {
    const datos = leerFormularioAjustes(vista.perfilForm);
    const resultado = service.guardarPerfil(datos);

    if (resultado.ok) {
      backupService.crearBackupAutomatico("guardar-perfil");
    }

    mostrarErroresAjustes(vista.perfilForm, resultado.errores || {});
    mostrarMensajeAjustes(vista.perfilMensaje, resultado.mensaje, resultado.ok);
  }

  function guardarObjetivo(vista) {
    const datos = leerFormularioAjustes(vista.objetivoForm);
    const resultado = service.guardarObjetivo(datos);

    if (resultado.ok) {
      backupService.crearBackupAutomatico("guardar-objetivo");
    }

    mostrarErroresAjustes(vista.objetivoForm, resultado.errores || {});
    mostrarMensajeAjustes(vista.objetivoMensaje, resultado.mensaje, resultado.ok);
  }

  function reabrirInicio() {
    const confirmado = window.confirm(AJUSTES_TEXTOS.CONFIRMAR_INICIO);

    if (!confirmado) {
      return;
    }

    backupService.crearBackupAutomatico("antes-de-reabrir-inicio");
    service.reabrirInicio();

    if (typeof alReabrirInicio === "function") {
      alReabrirInicio();
    }
  }

  function exportarBackup(vista) {
    const resultado = backupService.exportarArchivo();
    mostrarMensajeAjustes(vista.backupMensaje, resultado.mensaje, resultado.ok);
  }

  async function importarBackup(vista, file) {
    const confirmado = window.confirm("Antes de restaurar se creará una copia local de seguridad. ¿Quieres continuar?");

    if (!confirmado) {
      mostrarMensajeAjustes(vista.backupMensaje, "Restauración cancelada.", false);
      return;
    }

    const resultado = await backupService.importarYRestaurar(file);
    mostrarMensajeAjustes(vista.backupMensaje, resultado.mensaje, resultado.ok);

    if (resultado.ok) {
      window.setTimeout(() => window.location.reload(), 600);
    }
  }

  function montar(contenedor) {
    const datos = service.obtenerDatos();
    const vista = crearAjustesView(datos);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.perfilForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarPerfil(vista);
    });

    vista.objetivoForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarObjetivo(vista);
    });

    vista.reabrirInicioBoton.addEventListener("click", reabrirInicio);
    vista.backupExportarBoton.addEventListener("click", () => exportarBackup(vista));
    vista.backupImportarBoton.addEventListener("click", () => vista.backupInputArchivo.click());
    vista.backupInputArchivo.addEventListener("change", () => {
      const file = vista.backupInputArchivo.files?.[0];
      if (file) importarBackup(vista, file);
    });
  }

  return {
    montar
  };
}
