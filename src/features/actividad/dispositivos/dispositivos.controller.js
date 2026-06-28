import { crearDispositivosService } from "./dispositivos.service.js";
import { crearDispositivosView, leerDispositivosForm, pintarMensajeDispositivos } from "./dispositivos.view.js";

export function crearDispositivosController() {
  const service = crearDispositivosService();

  function montar(contenedor) {
    const estado = service.obtenerEstado();
    const vista = crearDispositivosView(estado);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const resultado = service.guardarPreparacion(leerDispositivosForm(vista.form));
      pintarMensajeDispositivos(vista.mensaje, resultado);
    });
  }

  return { montar };
}
