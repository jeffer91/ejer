/* =========================================================
Nombre completo: enhi-main.js
Ruta o ubicación: src/pantallas/02-entrenamiento/02-hiit/enhi-main.js
Función o funciones:
- Cargar configuración demo o datos guardados localmente.
- Ejecutar temporizador HIIT con trabajo, descanso y rondas.
- Guardar configuración e historial en localStorage.
Con qué se conecta:
- enhi-index.html
- enhi.css
- data/enhi-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-enhi-datos';
  var estado={config:null,historial:[],timer:null,corriendo:false,pausado:false,fase:'Listo',rondaActual:0,segundosRestantes:0,totalFase:0};
  var demoFallback={configuracion:{nombre:'HIIT controlado',trabajoSeg:30,descansoSeg:20,rondas:6,intensidad:3,nota:'Sesión demo.'},historial:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();prepararTimer();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('enhi-modo-datos');el.fase=document.getElementById('enhi-fase');el.ronda=document.getElementById('enhi-ronda');el.tiempo=document.getElementById('enhi-tiempo');el.totalSesiones=document.getElementById('enhi-total-sesiones');el.estado=document.getElementById('enhi-estado');el.ring=document.getElementById('enhi-ring');el.tiempoGrande=document.getElementById('enhi-tiempo-grande');el.faseGrande=document.getElementById('enhi-fase-grande');el.btnIniciar=document.getElementById('enhi-btn-iniciar');el.btnPausar=document.getElementById('enhi-btn-pausar');el.btnReiniciar=document.getElementById('enhi-btn-reiniciar');el.form=document.getElementById('enhi-form');el.inputNombre=document.getElementById('enhi-input-nombre');el.inputTrabajo=document.getElementById('enhi-input-trabajo');el.inputDescanso=document.getElementById('enhi-input-descanso');el.inputRondas=document.getElementById('enhi-input-rondas');el.inputIntensidad=document.getElementById('enhi-input-intensidad');el.inputNota=document.getElementById('enhi-input-nota');el.btnDemo=document.getElementById('enhi-btn-restaurar-demo');el.mensaje=document.getElementById('enhi-mensaje');el.tabla=document.getElementById('enhi-tabla-body');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion&&Array.isArray(guardado.historial)){estado.config=normalizarConfig(guardado.configuracion);estado.historial=normalizarHistorial(guardado.historial);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/enhi-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.historial=normalizarHistorial(data.historial||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.historial=normalizarHistorial(demoFallback.historial);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.btnIniciar.addEventListener('click',iniciarTimer);
    el.btnPausar.addEventListener('click',pausarTimer);
    el.btnReiniciar.addEventListener('click',reiniciarTimer);
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarConfiguracion();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.historial=normalizarHistorial(demoFallback.historial);el.modo.textContent='Modo demo restaurado';llenarFormulario();reiniciarTimer();mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
  }

  function guardarConfiguracion(){
    var nueva=normalizarConfig({nombre:el.inputNombre.value.trim(),trabajoSeg:el.inputTrabajo.value,descansoSeg:el.inputDescanso.value,rondas:el.inputRondas.value,intensidad:el.inputIntensidad.value,nota:el.inputNota.value.trim()});
    if(!nueva.nombre){mostrarMensaje('Escribe un nombre para la sesión.',true);return;}
    if(nueva.trabajoSeg<5||nueva.descansoSeg<5||nueva.rondas<1){mostrarMensaje('Revisa trabajo, descanso y rondas.',true);return;}
    estado.config=nueva;guardarLocal();reiniciarTimer();mostrarMensaje('Configuración guardada.',false);renderizarTodo();
  }

  function iniciarTimer(){
    if(estado.corriendo&&estado.pausado){estado.pausado=false;mostrarMensaje('Temporizador reanudado.',false);return;}
    if(estado.corriendo){return;}
    estado.corriendo=true;estado.pausado=false;estado.rondaActual=1;estado.fase='Trabajo';estado.segundosRestantes=estado.config.trabajoSeg;estado.totalFase=estado.config.trabajoSeg;mostrarMensaje('Sesión iniciada.',false);renderizarTodo();estado.timer=setInterval(tick,1000);
  }

  function pausarTimer(){
    if(!estado.corriendo){mostrarMensaje('No hay una sesión activa.',true);return;}
    estado.pausado=!estado.pausado;mostrarMensaje(estado.pausado?'Temporizador pausado.':'Temporizador reanudado.',false);renderizarTodo();
  }

  function reiniciarTimer(){
    if(estado.timer){clearInterval(estado.timer);}
    estado.timer=null;estado.corriendo=false;estado.pausado=false;prepararTimer();renderizarTodo();
  }

  function prepararTimer(){estado.fase='Listo';estado.rondaActual=0;estado.segundosRestantes=estado.config?estado.config.trabajoSeg:0;estado.totalFase=estado.config?estado.config.trabajoSeg:1;}

  function tick(){
    if(estado.pausado){return;}
    estado.segundosRestantes-=1;
    if(estado.segundosRestantes<=0){avanzarFase();}
    renderizarTodo();
  }

  function avanzarFase(){
    if(estado.fase==='Trabajo'){estado.fase='Descanso';estado.segundosRestantes=estado.config.descansoSeg;estado.totalFase=estado.config.descansoSeg;return;}
    if(estado.rondaActual>=estado.config.rondas){finalizarSesion();return;}
    estado.rondaActual+=1;estado.fase='Trabajo';estado.segundosRestantes=estado.config.trabajoSeg;estado.totalFase=estado.config.trabajoSeg;
  }

  function finalizarSesion(){
    if(estado.timer){clearInterval(estado.timer);}estado.timer=null;estado.corriendo=false;estado.pausado=false;estado.fase='Completado';estado.segundosRestantes=0;guardarHistorial('Completado');mostrarMensaje('Sesión completada. Buen trabajo, registra cómo te sentiste.',false);renderizarTodo();
  }

  function guardarHistorial(estadoSesion){
    var hoy=new Date();var fecha=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');
    estado.historial.push({fecha:fecha,nombre:estado.config.nombre,trabajoSeg:estado.config.trabajoSeg,descansoSeg:estado.config.descansoSeg,rondas:estado.config.rondas,estado:estadoSesion,nota:estado.config.nota||'Sin nota'});guardarLocal();
  }

  function renderizarTodo(){
    el.fase.textContent=estado.fase;el.ronda.textContent='Ronda '+estado.rondaActual+'/'+(estado.config?estado.config.rondas:0);el.tiempo.textContent=formatoTiempo(estado.segundosRestantes);el.tiempoGrande.textContent=formatoTiempo(estado.segundosRestantes);el.faseGrande.textContent=estado.fase;el.totalSesiones.textContent=String(estado.historial.length);el.estado.textContent=estado.corriendo?(estado.pausado?'Pausado':'Activo'):'Detenido';actualizarRing();renderizarTabla();
  }

  function actualizarRing(){
    var progreso=estado.totalFase>0?1-(estado.segundosRestantes/estado.totalFase):0;
    var grados=Math.max(0,Math.min(360,Math.round(progreso*360)));
    el.ring.style.background='conic-gradient(#2563eb '+grados+'deg,#e5e7eb '+grados+'deg)';
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';estado.historial.slice().reverse().slice(0,10).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td>'+esc(item.nombre)+'</td><td>'+esc(item.trabajoSeg+' s')+'</td><td>'+esc(item.descansoSeg+' s')+'</td><td>'+esc(item.rondas)+'</td><td>'+esc(item.estado)+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});
  }

  function llenarFormulario(){el.inputNombre.value=estado.config.nombre;el.inputTrabajo.value=estado.config.trabajoSeg;el.inputDescanso.value=estado.config.descansoSeg;el.inputRondas.value=estado.config.rondas;el.inputIntensidad.value=estado.config.intensidad||'';el.inputNota.value=estado.config.nota||'';}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,historial:estado.historial}));el.modo.textContent='Datos locales';}
  function normalizarConfig(c){return{nombre:String(c.nombre||'HIIT controlado'),trabajoSeg:numero(c.trabajoSeg)||30,descansoSeg:numero(c.descansoSeg)||20,rondas:numero(c.rondas)||6,intensidad:numero(c.intensidad)||null,nota:c.nota||'Sin nota'};}
  function normalizarHistorial(lista){return lista.map(function(i){return{fecha:i.fecha,nombre:i.nombre||'HIIT',trabajoSeg:numero(i.trabajoSeg)||0,descansoSeg:numero(i.descansoSeg)||0,rondas:numero(i.rondas)||0,estado:i.estado||'Guardado',nota:i.nota||'Sin nota'};}).filter(function(i){return i.fecha;});}
  function numero(valor){var n=Number(valor);return Number.isFinite(n)?n:null;}
  function formatoTiempo(seg){seg=Math.max(0,Number(seg)||0);var m=Math.floor(seg/60);var s=seg%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('enhi-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
