/*
  Nombre completo: dispositivos.controller.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.controller.js

  Función o funciones:
    - Montar la pantalla Dispositivos.
    - Navegar subpáginas independientes: Cubitt CT4, Google Fit, Puente FitJeff e Historial.
    - Guardar preparación local sin afectar configuraciones de otras subpáginas.
    - Anexar Cubitt CT4 por Bluetooth cuando el usuario lo aprueba.
    - Probar conexión básica Bluetooth/GATT del reloj.
    - Explorar servicios privados del reloj.
    - Tomar lectura 1, tomar lectura 2 y comparar cambios HEX.
    - Navegar el asistente de verificaciones por paginación.
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

  function agregarClick(boton, handler) {
    if (!boton || typeof handler !== "function") return;
    boton.addEventListener("click", handler);
  }

  async function ejecutarAccionBluetooth({ boton, textoTemporal, accion, contenedor }) {
    bloquearBoton(boton, true, textoTemporal);
    const resultado = await accion();
    bloquearBoton(boton, false);
    renderizar(contenedor, resultado.estado || service.obtenerEstado(), resultado);
  }

  function cambiarPagina(contenedor, pagina) {
    const resultado = service.cambiarPaginaVerificacionCubitt(pagina);
    renderizar(contenedor, resultado.estado || service.obtenerEstado(), resultado);
  }

  function cambiarSubpagina(contenedor, pagina) {
    const resultado = service.cambiarPaginaDispositivos(pagina);
    renderizar(contenedor, resultado.estado || service.obtenerEstado());
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

    vista.paginaBotones.forEach((boton) => {
      agregarClick(boton, () => cambiarSubpagina(contenedor, boton.dataset.pagina));
    });

    if (vista.form) {
      vista.form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const guardado = service.guardarPreparacion(leerDispositivosForm(vista.form));
        renderizar(contenedor, guardado.estado || service.obtenerEstado(), guardado);
      });
    }

    agregarClick(vista.cubittEscanearBoton, () => ejecutarAccionBluetooth({
      boton: vista.cubittEscanearBoton,
      textoTemporal: "Escaneando...",
      accion: () => service.anexarCubittBluetooth(),
      contenedor
    }));

    agregarClick(vista.cubittProbarBoton, () => ejecutarAccionBluetooth({
      boton: vista.cubittProbarBoton,
      textoTemporal: "Conectando...",
      accion: () => service.probarConexionCubittBluetooth(),
      contenedor
    }));

    agregarClick(vista.cubittExplorarBoton, () => ejecutarAccionBluetooth({
      boton: vista.cubittExplorarBoton,
      textoTemporal: "Explorando...",
      accion: () => service.explorarCubittPrivado(),
      contenedor
    }));

    agregarClick(vista.cubittLectura1Boton, () => ejecutarAccionBluetooth({
      boton: vista.cubittLectura1Boton,
      textoTemporal: "Leyendo 1...",
      accion: () => service.tomarLecturaCubittPrivada(1),
      contenedor
    }));

    agregarClick(vista.cubittLectura2Boton, () => ejecutarAccionBluetooth({
      boton: vista.cubittLectura2Boton,
      textoTemporal: "Leyendo 2...",
      accion: () => service.tomarLecturaCubittPrivada(2),
      contenedor
    }));

    agregarClick(vista.cubittCompararBoton, () => {
      const resultadoComparacion = service.compararLecturasCubittPrivadas();
      renderizar(contenedor, resultadoComparacion.estado || service.obtenerEstado(), resultadoComparacion);
    });

    agregarClick(vista.cubittPaginaAnteriorBoton, () => cambiarPagina(contenedor, vista.cubittPaginaActual - 1));
    agregarClick(vista.cubittPaginaSiguienteBoton, () => cambiarPagina(contenedor, vista.cubittPaginaActual + 1));
    vista.cubittPaginaBotones.forEach((boton) => {
      agregarClick(boton, () => cambiarPagina(contenedor, Number(boton.dataset.pagina || 1)));
    });

    if (vista.importForm) {
      vista.importForm.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const resultadoImportar = service.importarDatosPegados(vista.importTextarea?.value || "");
        renderizar(contenedor, resultadoImportar.estado || service.obtenerEstado(), null, resultadoImportar);
      });
    }

    agregarClick(vista.ejemploBoton, () => {
      if (!vista.importTextarea) return;
      vista.importTextarea.value = vista.ejemploImportacion;
      vista.importTextarea.focus();
    });
  }

  function montar(contenedor) {
    renderizar(contenedor);
  }

  return { montar };
}
