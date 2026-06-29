/*
  Nombre completo: dispositivos.controller.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.controller.js

  Función o funciones:
    - Montar la pantalla Dispositivos.
    - Guardar preparación local de Cubitt CT4, Google Fit y Puente FitJeff.
    - Anexar Cubitt CT4 por Bluetooth cuando el usuario lo aprueba.
    - Probar conexión básica Bluetooth/GATT del reloj.
    - Explorar servicios privados del reloj.
    - Tomar lectura 1, tomar lectura 2 y comparar cambios HEX.
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

  async function ejecutarAccionBluetooth({ boton, textoTemporal, accion, contenedor }) {
    bloquearBoton(boton, true, textoTemporal);
    const resultado = await accion();
    bloquearBoton(boton, false);
    renderizar(contenedor, resultado.estado || service.obtenerEstado(), resultado);
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

    vista.cubittEscanearBoton.addEventListener("click", () => ejecutarAccionBluetooth({
      boton: vista.cubittEscanearBoton,
      textoTemporal: "Escaneando...",
      accion: () => service.anexarCubittBluetooth(),
      contenedor
    }));

    vista.cubittProbarBoton.addEventListener("click", () => ejecutarAccionBluetooth({
      boton: vista.cubittProbarBoton,
      textoTemporal: "Conectando...",
      accion: () => service.probarConexionCubittBluetooth(),
      contenedor
    }));

    vista.cubittExplorarBoton.addEventListener("click", () => ejecutarAccionBluetooth({
      boton: vista.cubittExplorarBoton,
      textoTemporal: "Explorando...",
      accion: () => service.explorarCubittPrivado(),
      contenedor
    }));

    vista.cubittLectura1Boton.addEventListener("click", () => ejecutarAccionBluetooth({
      boton: vista.cubittLectura1Boton,
      textoTemporal: "Leyendo 1...",
      accion: () => service.tomarLecturaCubittPrivada(1),
      contenedor
    }));

    vista.cubittLectura2Boton.addEventListener("click", () => ejecutarAccionBluetooth({
      boton: vista.cubittLectura2Boton,
      textoTemporal: "Leyendo 2...",
      accion: () => service.tomarLecturaCubittPrivada(2),
      contenedor
    }));

    vista.cubittCompararBoton.addEventListener("click", () => {
      const resultadoComparacion = service.compararLecturasCubittPrivadas();
      renderizar(contenedor, resultadoComparacion.estado || service.obtenerEstado(), resultadoComparacion);
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
