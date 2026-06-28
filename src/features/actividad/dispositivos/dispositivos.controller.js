import { crearDispositivosService } from "./dispositivos.service.js";
import { crearDispositivosView, leerDispositivosForm, pintarMensajeDispositivos } from "./dispositivos.view.js";

export function crearDispositivosController() {
  const service = crearDispositivosService();

  function renderizar(contenedor, estado = service.obtenerEstado(), resultado = null) {
    const vista = crearDispositivosView(estado);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    if (resultado) {
      pintarMensajeDispositivos(vista.mensaje, resultado);
    }

    vista.form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const guardado = service.guardarPreparacion(leerDispositivosForm(vista.form));
      renderizar(contenedor, guardado.estado || service.obtenerEstado(), guardado);
    });
  }

  function montar(contenedor) {
    renderizar(contenedor);
  }

  return { montar };
}
