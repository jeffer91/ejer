/*
  Nombre completo: rutinas.ia.diagnostics.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.ia.diagnostics.js

  Función o funciones:
    - Ejecutar una prueba rápida del flujo IA de Rutinas sin guardar datos.
    - Validar que el parser detecte rutina, días, bloques, cardio, fútbol, tiempo y formulario.
    - Insertar un panel de diagnóstico dentro de la pantalla Rutinas.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.parser.js
*/

const RUTINA_IA_PRUEBA = `FITJEFF_RUTINA_V1

[RUTINA]
nombre=Diagnóstico FitJeff IA
objetivo=salud general
nivel=intermedio
lugar=gimnasio y cancha
equipo=mancuernas, máquinas, bicicleta y balón
dias=2
duracion_sesion=45min
notas_generales=Prueba interna de lectura. No guardar como rutina real.
[FIN_RUTINA_DATOS]

[DIA]
numero=1
nombre=Día 1 - Fuerza y cardio
enfoque=fuerza tren inferior con cardio final
calentamiento=Movilidad de cadera y activación suave

[BLOQUE]
tipo=calentamiento
nombre=Calentamiento por tiempo
- ejercicio=Bicicleta suave | tipo=cardio | medicion=tiempo | series=0 | repeticiones=0 | descanso= | duracion=10min | duracion_segundos=600 | distancia_km= | intensidad=suave | notas=calentamiento progresivo
[FIN_BLOQUE]

[BLOQUE]
tipo=fuerza
nombre=Fuerza tren inferior
- ejercicio=Sentadilla goblet | tipo=fuerza | medicion=repeticiones | series=3 | repeticiones=10 | descanso=60s | duracion= | duracion_segundos= | distancia_km= | intensidad=media | notas=técnica controlada
- ejercicio=Peso muerto rumano | tipo=fuerza | medicion=repeticiones | series=3 | repeticiones=10 | descanso=60s | duracion= | duracion_segundos= | distancia_km= | intensidad=media | notas=espalda neutra
[FIN_BLOQUE]

[BLOQUE]
tipo=cardio
nombre=Cardio final
- ejercicio=Caminata inclinada | tipo=cardio | medicion=tiempo | series=0 | repeticiones=0 | descanso= | duracion=12min | duracion_segundos=720 | distancia_km= | intensidad=suave | notas=ritmo cómodo
[FIN_BLOQUE]
[FIN_DIA]

[DIA]
numero=2
nombre=Día 2 - Técnica con balón
enfoque=fútbol técnico y movilidad
calentamiento=Movilidad general y conducción suave

[BLOQUE]
tipo=futbol
nombre=Técnica de fútbol
- ejercicio=Conducción de balón | tipo=futbol | medicion=tiempo | series=0 | repeticiones=0 | descanso=45s | duracion=3min | duracion_segundos=180 | distancia_km= | intensidad=media | notas=mantener control
- ejercicio=Pases contra pared | tipo=tecnica | medicion=repeticiones | series=3 | repeticiones=20 | descanso=45s | duracion= | duracion_segundos= | distancia_km= | intensidad=media | notas=usar ambos pies
[FIN_BLOQUE]

[BLOQUE]
tipo=movilidad
nombre=Movilidad final
- ejercicio=Estiramiento de cadera | tipo=movilidad | medicion=tiempo | series=0 | repeticiones=0 | descanso= | duracion=6min | duracion_segundos=360 | distancia_km= | intensidad=suave | notas=sin dolor
[FIN_BLOQUE]
[FIN_DIA]

FIN_RUTINA`;

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function limpiarNodo(nodo) {
  while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
}

function crearPasoDiagnostico(nombre, ok, detalle = "") {
  return {
    nombre,
    ok: Boolean(ok),
    detalle
  };
}

export function ejecutarDiagnosticoRutinaIA({ interpretarTextoRutinaIA, puedeGuardar = false } = {}) {
  const resultado = typeof interpretarTextoRutinaIA === "function"
    ? interpretarTextoRutinaIA(RUTINA_IA_PRUEBA)
    : null;
  const resumen = resultado?.resumen || {};
  const tipos = resumen.tipos || {};
  const mediciones = resumen.mediciones || {};
  const pasos = [
    crearPasoDiagnostico("Parser conectado", Boolean(resultado), "La función de interpretación responde."),
    crearPasoDiagnostico("Contrato FITJEFF_RUTINA_V1 leído", Boolean(resultado?.formatoVersion === "FITJEFF_RUTINA_V1"), resultado?.formatoVersion || "sin versión"),
    crearPasoDiagnostico("Días detectados", Number(resumen.dias || 0) >= 2, `${resumen.dias || 0} día(s)`),
    crearPasoDiagnostico("Bloques detectados", Number(resumen.bloques || 0) >= 5, `${resumen.bloques || 0} bloque(s)`),
    crearPasoDiagnostico("Ejercicios detectados", Number(resumen.ejercicios || 0) >= 6, `${resumen.ejercicios || 0} ejercicio(s)`),
    crearPasoDiagnostico("Cardio detectado", Number(tipos.cardio || 0) >= 1, `cardio: ${tipos.cardio || 0}`),
    crearPasoDiagnostico("Fútbol/técnica detectado", Number(tipos.futbol || 0) + Number(tipos.tecnica || 0) >= 1, `futbol: ${tipos.futbol || 0} · tecnica: ${tipos.tecnica || 0}`),
    crearPasoDiagnostico("Medición por tiempo detectada", Number(mediciones.tiempo || 0) >= 1, `tiempo: ${mediciones.tiempo || 0} · minutos: ${resumen.tiempoMinutos || 0}`),
    crearPasoDiagnostico("Formulario manual compatible", Boolean(resultado?.formulario?.ejerciciosTexto), "La rutina puede cargarse al formulario."),
    crearPasoDiagnostico("Guardado IA conectado", puedeGuardar, "La acción de guardar está disponible, pero el diagnóstico no guarda datos.")
  ];
  const ok = pasos.every((paso) => paso.ok) && Boolean(resultado?.ok);

  return {
    ok,
    mensaje: ok ? "Diagnóstico IA correcto." : "Hay puntos del flujo IA que revisar.",
    pasos,
    resultado,
    textoPrueba: RUTINA_IA_PRUEBA
  };
}

function crearVistaDiagnostico(diagnostico = {}) {
  const caja = crearElemento("div", diagnostico.ok ? "entreno-rutinas-ia-result entreno-rutinas-ia-result--ok" : "entreno-rutinas-ia-result entreno-rutinas-ia-result--error");
  const resumen = diagnostico.resultado?.resumen || {};
  const chips = crearElemento("div", "entreno-rutinas-ia-chips");

  caja.appendChild(crearElemento("strong", "", diagnostico.ok ? "Diagnóstico correcto" : "Diagnóstico con alertas"));
  caja.appendChild(crearElemento("span", "", `${resumen.dias || 0} día(s) · ${resumen.bloques || 0} bloque(s) · ${resumen.ejercicios || 0} ejercicio(s) · ${resumen.tiempoMinutos || 0} min`));

  Object.entries(resumen.tipos || {}).forEach(([tipo, total]) => {
    chips.appendChild(crearElemento("small", "", `${tipo}: ${total}`));
  });
  Object.entries(resumen.mediciones || {}).forEach(([medicion, total]) => {
    chips.appendChild(crearElemento("small", "", `${medicion}: ${total}`));
  });

  if (chips.childNodes.length) caja.appendChild(chips);

  diagnostico.pasos?.forEach((paso) => {
    const linea = crearElemento("small", "", `${paso.ok ? "OK" : "REVISAR"} · ${paso.nombre}${paso.detalle ? ` · ${paso.detalle}` : ""}`);
    caja.appendChild(linea);
  });

  (diagnostico.resultado?.errores || []).slice(0, 3).forEach((error) => {
    caja.appendChild(crearElemento("small", "", `Error: ${error}`));
  });

  (diagnostico.resultado?.advertencias || []).slice(0, 3).forEach((advertencia) => {
    caja.appendChild(crearElemento("small", "", `Aviso: ${advertencia}`));
  });

  return caja;
}

export function insertarPanelDiagnosticoRutinaIA(pantalla, { onEjecutar } = {}) {
  if (!pantalla || typeof onEjecutar !== "function") return;

  const panelIA = pantalla.querySelector(".entreno-rutinas-ia");
  if (!panelIA || pantalla.querySelector(".entreno-rutinas-ia-diagnostic")) return;

  const panel = crearElemento("section", "entreno-rutinas-ia entreno-rutinas-ia-diagnostic");
  const top = crearElemento("div", "entreno-rutinas-form__top");
  const textoTop = crearElemento("div", "");
  const acciones = crearElemento("div", "entreno-rutinas-actions entreno-rutinas-actions--ia");
  const salida = crearElemento("div", "entreno-rutinas-ia-output");
  const boton = crearElemento("button", "entreno-rutinas-button entreno-rutinas-button--ia", "Ejecutar diagnóstico IA");

  boton.type = "button";
  boton.addEventListener("click", () => {
    boton.disabled = true;
    boton.textContent = "Probando...";
    limpiarNodo(salida);
    salida.appendChild(crearVistaDiagnostico(onEjecutar()));
    boton.textContent = "Ejecutar diagnóstico IA";
    boton.disabled = false;
  });

  textoTop.appendChild(crearElemento("h3", "", "Diagnóstico rápido IA"));
  textoTop.appendChild(crearElemento("p", "", "Prueba el contrato, parser, bloques, cardio, fútbol, tiempo, formulario y guardado sin crear una rutina de prueba."));
  top.appendChild(textoTop);

  acciones.appendChild(boton);
  panel.appendChild(top);
  panel.appendChild(acciones);
  panel.appendChild(salida);

  panelIA.after(panel);
}
