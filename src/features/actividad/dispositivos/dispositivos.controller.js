/*
  Nombre completo: dispositivos.controller.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.controller.js

  Función o funciones:
    - Montar la pantalla Dispositivos.
    - Guardar preparación local de Cubitt CT4, Google Fit y Puente FitJeff.
    - Anexar Cubitt CT4 por Bluetooth cuando el usuario lo aprueba.
    - Probar conexión básica Bluetooth/GATT del reloj.
    - Ejecutar importación CSV/JSON pegada por el usuario.
    - Pegar ejemplo de importación para facilitar pruebas.
    - Re-renderizar estado, resumen e historial después de cada acción.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/features/actividad/dispositivos/dispositivos.view.js
*/

import { crearDispositivosService } from "./dispositivos.service.js";
import { crearDispositivosView, leerDispositivosForm, pintarMensajeDispositivos } from "./dispositivos.view.js";

export function crearDispositivosController() {
  const service = crearDispositivosService();

  function bloquearBoton(boton, bloqueado, textoTemporal = "Procesando...") {
    if (!boton) return;

    if (bloqueado) {
      boton.dataset.textoOriginal = boton.textContent;
      boton.textContent = textoTemporal;
      boton.disabled = true;
      return;
    }

    boton.textContent = boton.dataset.textoOriginal || boton.textContent;
    boton.disabled = false;
  }

  function renderizar(contenedor, estado = service.obtenerEstado(), resultado = null, resultadoImportacion = null) {
    const vista = crearDispositivosView(estado);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    if (resultado) {
      pintarMensajeDispositivos(vista.mensaje, resultado);
    }

    if (resultadoImportacion) {
      pintarMensajeDispositivos(vista.importMensaje, resultadoImportacion);
    }

    vista.form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const guardado = service.guardarPreparacion(leerDispositivosForm(vista.form));
      renderizar(contenedor, guardado.estado || service.obtenerEstado(), guardado);
    });

    vista.cubittEscanearBoton.addEventListener("click", async () => {
      bloquearBoton(vista.cubittEscanearBoton, true, "Escaneando...");
      const resultadoBluetooth = await service.anexarCubittBluetooth();
      bloquearBoton(vista.cubittEscanearBoton, false);
      renderizar(contenedor, resultadoBluetooth.estado || service.obtenerEstado(), resultadoBluetooth);
    });

    vista.cubittProbarBoton.addEventListener("click", async () => {
      bloquearBoton(vista.cubittProbarBoton, true, "Conectando...");
      const resultadoConexion = await service.probarConexionCubittBluetooth();
      bloquearBoton(vista.cubittProbarBoton, false);
      renderizar(contenedor, resultadoConexion.estado || service.obtenerEstado(), resultadoConexion);
    });

    vista.importForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const resultadoImportar = service.importarDatosPegados(vista.importTextarea.value);
      renderizar(contenedor, resultadoImportar.estado || service.obtenerEstado(), null, resultadoImportar);
    });

    vista.ejemploBoton.addEventListener("click", () => {
      vista.importTextarea.value = vista.ejemploImportacion;
      vista.importTextarea.focus();
    });
  }

  function montar(contenedor) {
    renderizar(contenedor);
  }

  return { montar };
}
