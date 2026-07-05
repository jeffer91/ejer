/* =========================================================
Nombre completo: enho-main.js
Ruta o ubicación: src/pantallas/02-entrenamiento/01-hoy/enho-main.js
Función o funciones:
- Cargar rutina demo o sesión guardada localmente.
- Registrar series de entrenamiento de forma local.
- Mostrar resumen, ejercicios y tabla de series.
Con qué se conecta:
- enho-index.html
- enho.css
- data/enho-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-enho-sesion';
  var estado={rutina:null,series:[]};
  var demoFallback={rutinaHoy:{fecha:'2026-07-04',enfoque:'Tren superior',estado:'Pendiente',notaSeguridad:'Registra con calma y evita continuar si aparece molestia inusual.',ejercicios:[{id:'press-banca',nombre:'Press de banca',objetivo:'3 series de 8 a 12 repeticiones',zona:'Pecho y empuje',permitePeso:true,permiteFallo:true},{id:'remo-mancuerna',nombre:'Remo con mancuerna',objetivo:'3 series de 10 a 12 repeticiones',zona:'Espalda',permitePeso:true,permiteFallo:true},{id:'plancha',nombre:'Plancha',objetivo:'3 series controladas',zona:'Core',permitePeso:false,permiteFallo:false}]},series:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('enho-modo-datos');el.enfoque=document.getElementById('enho-enfoque');el.fecha=document.getElementById('enho-fecha');el.totalEjercicios=document.getElementById('enho-total-ejercicios');el.seriesHechas=document.getElementById('enho-series-hechas');el.estado=document.getElementById('enho-estado');el.lista=document.getElementById('enho-lista-ejercicios');el.form=document.getElementById('enho-form');el.inputEjercicio=document.getElementById('enho-input-ejercicio');el.inputSerie=document.getElementById('enho-input-serie');el.inputReps=document.getElementById('enho-input-reps');el.inputPeso=document.getElementById('enho-input-peso');el.inputEsfuerzo=document.getElementById('enho-input-esfuerzo');el.inputFallo=document.getElementById('enho-input-fallo');el.inputNota=document.getElementById('enho-input-nota');el.btnFinalizar=document.getElementById('enho-btn-finalizar');el.btnDemo=document.getElementById('enho-btn-restaurar-demo');el.mensaje=document.getElementById('enho-mensaje');el.tabla=document.getElementById('enho-tabla-body');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.rutina&&Array.isArray(guardado.series)){estado.rutina=guardado.rutina;estado.series=normalizarSeries(guardado.series);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/enho-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.rutina=data.rutinaHoy||demoFallback.rutinaHoy;estado.series=normalizarSeries(data.series||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.rutina=demoFallback.rutinaHoy;estado.series=normalizarSeries(demoFallback.series);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarSerie();});
    el.btnFinalizar.addEventListener('click',function(){estado.rutina.estado='Completado';guardarLocal();mostrarMensaje('Sesión finalizada correctamente.',false);renderizarTodo();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.rutina=demoFallback.rutinaHoy;estado.series=normalizarSeries(demoFallback.series);el.modo.textContent='Modo demo restaurado';mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
  }

  function guardarSerie(){
    var ejercicio=buscarEjercicio(el.inputEjercicio.value);
    if(!ejercicio){mostrarMensaje('Selecciona un ejercicio válido.',true);return;}
    var serie=numero(el.inputSerie.value);var reps=numero(el.inputReps.value);var peso=numero(el.inputPeso.value);var esfuerzo=numero(el.inputEsfuerzo.value);var fallo=Boolean(el.inputFallo.checked);var nota=el.inputNota.value.trim()||'Sin nota';
    if(!Number.isFinite(serie)||serie<1){mostrarMensaje('Ingresa el número de serie.',true);return;}
    if(!Number.isFinite(reps)||reps<1){mostrarMensaje('Ingresa las repeticiones.',true);return;}
    if(Number.isFinite(esfuerzo)&&(esfuerzo<1||esfuerzo>5)){mostrarMensaje('El esfuerzo debe estar entre 1 y 5.',true);return;}
    estado.series.push({ejercicioId:ejercicio.id,ejercicioNombre:ejercicio.nombre,serie:serie,repeticiones:reps,pesoUsado:Number.isFinite(peso)?peso:null,esfuerzo:Number.isFinite(esfuerzo)?esfuerzo:null,falloControlado:fallo,nota:nota});
    if(estado.rutina.estado==='Pendiente'){estado.rutina.estado='En progreso';}
    guardarLocal();limpiarFormularioSerie();mostrarMensaje('Serie guardada correctamente.',false);renderizarTodo();
  }

  function renderizarTodo(){renderizarResumen();renderizarOpciones();renderizarEjercicios();renderizarTabla();}

  function renderizarResumen(){
    el.enfoque.textContent=estado.rutina.enfoque||'Rutina';el.fecha.textContent=formatearFecha(estado.rutina.fecha||'');el.totalEjercicios.textContent=String((estado.rutina.ejercicios||[]).length);el.seriesHechas.textContent=String(estado.series.length);el.estado.textContent=estado.rutina.estado||'Pendiente';
  }

  function renderizarOpciones(){
    var valorActual=el.inputEjercicio.value;el.inputEjercicio.innerHTML='';(estado.rutina.ejercicios||[]).forEach(function(ejercicio){var option=document.createElement('option');option.value=ejercicio.id;option.textContent=ejercicio.nombre;el.inputEjercicio.appendChild(option);});if(valorActual){el.inputEjercicio.value=valorActual;}if(!el.inputSerie.value){el.inputSerie.value=sugerirSiguienteSerie(el.inputEjercicio.value);}
  }

  function renderizarEjercicios(){
    el.lista.innerHTML='';(estado.rutina.ejercicios||[]).forEach(function(ejercicio){var hechas=estado.series.filter(function(s){return s.ejercicioId===ejercicio.id;}).length;var card=document.createElement('article');card.className='enho-exercise';card.innerHTML='<h3>'+esc(ejercicio.nombre)+'</h3><p>'+esc(ejercicio.objetivo||'Sin objetivo cargado.')+'</p><div class="enho-exercise-footer"><span class="enho-pill">'+esc(ejercicio.zona||'General')+'</span><span class="enho-pill">Series: '+hechas+'</span></div>';el.lista.appendChild(card);});
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';estado.series.slice().reverse().forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(item.ejercicioNombre)+'</td><td>'+esc(item.serie)+'</td><td>'+esc(item.repeticiones)+'</td><td>'+esc(Number.isFinite(item.pesoUsado)?item.pesoUsado+' kg':'--')+'</td><td>'+esc(Number.isFinite(item.esfuerzo)?item.esfuerzo+'/5':'--')+'</td><td>'+esc(item.falloControlado?'Sí':'No')+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});
  }

  function buscarEjercicio(id){return(estado.rutina.ejercicios||[]).find(function(ejercicio){return ejercicio.id===id;});}
  function sugerirSiguienteSerie(id){var hechas=estado.series.filter(function(s){return s.ejercicioId===id;}).length;return hechas+1;}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({rutina:estado.rutina,series:estado.series}));el.modo.textContent='Datos locales';}
  function limpiarFormularioSerie(){el.inputSerie.value=sugerirSiguienteSerie(el.inputEjercicio.value);el.inputReps.value='';el.inputPeso.value='';el.inputEsfuerzo.value='';el.inputFallo.checked=false;el.inputNota.value='';}
  function normalizarSeries(series){return series.map(function(item){return{ejercicioId:item.ejercicioId,ejercicioNombre:item.ejercicioNombre||item.ejercicioId,serie:numero(item.serie),repeticiones:numero(item.repeticiones),pesoUsado:numero(item.pesoUsado),esfuerzo:numero(item.esfuerzo),falloControlado:Boolean(item.falloControlado),nota:item.nota||'Sin nota'};}).filter(function(item){return item.ejercicioId&&Number.isFinite(item.serie)&&Number.isFinite(item.repeticiones);});}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?n:null;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha||'Hoy';}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('enho-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
