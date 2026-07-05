/* =========================================================
Nombre completo: ayay-main.js
Ruta o ubicación: src/pantallas/03-ayuno/01-ayuno/ayay-main.js
Función o funciones:
- Cargar configuración demo o datos guardados localmente.
- Manejar inicio, finalización y cancelación de registros de ayuno.
- Mostrar temporizador circular, resumen e historial.
Con qué se conecta:
- ayay-index.html
- ayay.css
- data/ayay-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ayay-datos';
  var estado={config:null,actual:null,historial:[],intervalo:null};
  var demoFallback={configuracion:{tipo:'16:8',objetivoHoras:16,estado:'Activo',energia:4,nota:'Registro demo.'},actual:{inicio:'2026-07-04T20:00',finPrevisto:'2026-07-05T12:00'},historial:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();estado.intervalo=setInterval(renderizarTodo,30000);});}

  function capturarElementos(){
    el.modo=document.getElementById('ayay-modo-datos');el.estado=document.getElementById('ayay-estado');el.tipoActual=document.getElementById('ayay-tipo-actual');el.transcurrido=document.getElementById('ayay-transcurrido');el.restante=document.getElementById('ayay-restante');el.total=document.getElementById('ayay-total-registros');el.ring=document.getElementById('ayay-ring');el.porcentaje=document.getElementById('ayay-porcentaje');el.ringText=document.getElementById('ayay-ring-text');el.btnIniciar=document.getElementById('ayay-btn-iniciar');el.btnFinalizar=document.getElementById('ayay-btn-finalizar');el.btnCancelar=document.getElementById('ayay-btn-cancelar');el.form=document.getElementById('ayay-form');el.inputTipo=document.getElementById('ayay-input-tipo');el.inputInicio=document.getElementById('ayay-input-inicio');el.inputFin=document.getElementById('ayay-input-fin');el.inputObjetivo=document.getElementById('ayay-input-objetivo');el.inputEnergia=document.getElementById('ayay-input-energia');el.inputNota=document.getElementById('ayay-input-nota');el.btnDemo=document.getElementById('ayay-btn-restaurar-demo');el.mensaje=document.getElementById('ayay-mensaje');el.tabla=document.getElementById('ayay-tabla-body');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion){estado.config=normalizarConfig(guardado.configuracion);estado.actual=guardado.actual||null;estado.historial=normalizarHistorial(guardado.historial||[]);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ayay-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.actual=data.actual||demoFallback.actual;estado.historial=normalizarHistorial(data.historial||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.actual=demoFallback.actual;estado.historial=normalizarHistorial(demoFallback.historial);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.btnIniciar.addEventListener('click',iniciarAhora);
    el.btnFinalizar.addEventListener('click',finalizarAyuno);
    el.btnCancelar.addEventListener('click',cancelarAyuno);
    el.inputTipo.addEventListener('change',ajustarObjetivoPorTipo);
    el.inputInicio.addEventListener('change',calcularFinDesdeInicio);
    el.inputObjetivo.addEventListener('change',calcularFinDesdeInicio);
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarConfiguracion();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.actual=demoFallback.actual;estado.historial=normalizarHistorial(demoFallback.historial);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
  }

  function iniciarAhora(){
    var ahora=new Date();var objetivo=Number(el.inputObjetivo.value)||estado.config.objetivoHoras||12;var fin=new Date(ahora.getTime()+objetivo*60*60*1000);
    estado.config.tipo=el.inputTipo.value||estado.config.tipo;estado.config.objetivoHoras=objetivo;estado.config.estado='Activo';estado.config.energia=numero(el.inputEnergia.value);estado.config.nota=el.inputNota.value.trim()||'Sin nota';estado.actual={inicio:aLocalInput(ahora),finPrevisto:aLocalInput(fin)};llenarFormulario();guardarLocal();mostrarMensaje('Ayuno iniciado.',false);renderizarTodo();
  }

  function finalizarAyuno(){
    if(!estado.actual){mostrarMensaje('No hay un ayuno activo para finalizar.',true);return;}
    var ahora=new Date();var inicio=new Date(estado.actual.inicio);estado.historial.push({fecha:aFechaLocal(ahora),tipo:estado.config.tipo,inicio:estado.actual.inicio,fin:aLocalInput(ahora),estado:'Completado',energia:estado.config.energia,nota:estado.config.nota||'Sin nota'});estado.actual=null;estado.config.estado='Completado';guardarLocal();mostrarMensaje('Registro finalizado y guardado.',false);renderizarTodo();
  }

  function cancelarAyuno(){
    estado.actual=null;estado.config.estado='Cancelado';guardarLocal();mostrarMensaje('Registro activo cancelado.',false);renderizarTodo();
  }

  function guardarConfiguracion(){
    estado.config=normalizarConfig({tipo:el.inputTipo.value,objetivoHoras:el.inputObjetivo.value,estado:estado.actual?'Activo':'Configurado',energia:el.inputEnergia.value,nota:el.inputNota.value.trim()});
    estado.actual={inicio:el.inputInicio.value,finPrevisto:el.inputFin.value};
    if(!estado.actual.inicio||!estado.actual.finPrevisto){mostrarMensaje('Completa inicio y fin previsto.',true);return;}
    guardarLocal();mostrarMensaje('Configuración guardada.',false);renderizarTodo();
  }

  function ajustarObjetivoPorTipo(){
    var tipo=el.inputTipo.value;var horas={ '12:12':12,'14:10':14,'16:8':16 }[tipo];if(horas){el.inputObjetivo.value=horas;}calcularFinDesdeInicio();
  }

  function calcularFinDesdeInicio(){
    if(!el.inputInicio.value){return;}var inicio=new Date(el.inputInicio.value);var objetivo=Number(el.inputObjetivo.value)||12;var fin=new Date(inicio.getTime()+objetivo*60*60*1000);el.inputFin.value=aLocalInput(fin);
  }

  function llenarFormulario(){
    el.inputTipo.value=estado.config.tipo||'12:12';el.inputObjetivo.value=estado.config.objetivoHoras||12;el.inputEnergia.value=estado.config.energia||'';el.inputNota.value=estado.config.nota||'';
    if(estado.actual){el.inputInicio.value=estado.actual.inicio;el.inputFin.value=estado.actual.finPrevisto;}else{var ahora=new Date();el.inputInicio.value=aLocalInput(ahora);calcularFinDesdeInicio();}
  }

  function renderizarTodo(){
    var ahora=new Date();var activo=Boolean(estado.actual&&estado.config.estado==='Activo');var inicio=activo?new Date(estado.actual.inicio):null;var fin=activo?new Date(estado.actual.finPrevisto):null;var trans=activo?Math.max(0,ahora-inicio):0;var total=activo?Math.max(1,fin-inicio):1;var rest=activo?Math.max(0,fin-ahora):0;var progreso=Math.max(0,Math.min(1,trans/total));
    el.estado.textContent=estado.config.estado||'Configurado';el.tipoActual.textContent=estado.config.tipo||'Tipo';el.transcurrido.textContent=formatoDuracion(trans);el.restante.textContent=formatoDuracion(rest);el.total.textContent=String(estado.historial.length);el.porcentaje.textContent=Math.round(progreso*100)+'%';el.ringText.textContent=activo?'Ayuno activo':'Sin ayuno activo';el.ring.style.background='conic-gradient(#2563eb '+Math.round(progreso*360)+'deg,#e5e7eb '+Math.round(progreso*360)+'deg)';renderizarTabla();
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';estado.historial.slice().reverse().slice(0,10).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td>'+esc(item.tipo)+'</td><td>'+esc(formatearFechaHora(item.inicio))+'</td><td>'+esc(formatearFechaHora(item.fin))+'</td><td>'+esc(item.estado)+'</td><td>'+esc(item.energia?item.energia+'/5':'--')+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});
  }

  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,actual:estado.actual,historial:estado.historial}));el.modo.textContent='Datos locales';}
  function normalizarConfig(c){return{tipo:c.tipo||'12:12',objetivoHoras:numero(c.objetivoHoras)||12,estado:c.estado||'Configurado',energia:numero(c.energia),nota:c.nota||'Sin nota'};}
  function normalizarHistorial(lista){return lista.map(function(i){return{fecha:i.fecha,tipo:i.tipo||'--',inicio:i.inicio,fin:i.fin,estado:i.estado||'Guardado',energia:numero(i.energia),nota:i.nota||'Sin nota'};}).filter(function(i){return i.fecha;});}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?n:null;}
  function formatoDuracion(ms){var min=Math.floor(ms/60000);var h=Math.floor(min/60);var m=min%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
  function aLocalInput(fecha){var y=fecha.getFullYear();var m=String(fecha.getMonth()+1).padStart(2,'0');var d=String(fecha.getDate()).padStart(2,'0');var hh=String(fecha.getHours()).padStart(2,'0');var mm=String(fecha.getMinutes()).padStart(2,'0');return y+'-'+m+'-'+d+'T'+hh+':'+mm;}
  function aFechaLocal(fecha){var y=fecha.getFullYear();var m=String(fecha.getMonth()+1).padStart(2,'0');var d=String(fecha.getDate()).padStart(2,'0');return y+'-'+m+'-'+d;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function formatearFechaHora(valor){if(!valor){return'--';}var partes=String(valor).split('T');return formatearFecha(partes[0])+' '+(partes[1]||'');}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ayay-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
