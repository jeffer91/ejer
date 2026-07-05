/* =========================================================
Nombre completo: ayag-main.js
Ruta o ubicación: src/pantallas/03-ayuno/02-agua/ayag-main.js
Función o funciones:
- Cargar configuración demo o datos guardados localmente.
- Registrar hidratación diaria por botones rápidos o formulario.
- Mostrar progreso visual, resumen e historial local.
Con qué se conecta:
- ayag-index.html
- ayag.css
- data/ayag-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ayag-datos';
  var estado={config:{metaDiariaMl:2500},registros:[]};
  var demoFallback={configuracion:{metaDiariaMl:2500,nota:'Meta demo.'},registros:[{fecha:'2026-07-04',cantidadMl:500,momento:'Mañana',nota:'Demo.'},{fecha:'2026-07-04',cantidadMl:750,momento:'Tarde',nota:'Demo.'},{fecha:'2026-07-04',cantidadMl:500,momento:'Entrenamiento',nota:'Demo.'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();ponerFechaHoy();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('ayag-modo-datos');el.totalHoy=document.getElementById('ayag-total-hoy');el.fechaHoy=document.getElementById('ayag-fecha-hoy');el.meta=document.getElementById('ayag-meta');el.progreso=document.getElementById('ayag-progreso');el.totalRegistros=document.getElementById('ayag-total-registros');el.fill=document.getElementById('ayag-bottle-fill');el.bottleText=document.getElementById('ayag-bottle-text');el.botonesRapidos=Array.prototype.slice.call(document.querySelectorAll('[data-ml]'));el.btnLimpiar=document.getElementById('ayag-btn-limpiar-dia');el.form=document.getElementById('ayag-form');el.inputFecha=document.getElementById('ayag-input-fecha');el.inputMl=document.getElementById('ayag-input-ml');el.inputMeta=document.getElementById('ayag-input-meta');el.inputMomento=document.getElementById('ayag-input-momento');el.inputNota=document.getElementById('ayag-input-nota');el.btnDemo=document.getElementById('ayag-btn-restaurar-demo');el.mensaje=document.getElementById('ayag-mensaje');el.tabla=document.getElementById('ayag-tabla-body');
  }

  function ponerFechaHoy(){var hoy=new Date();el.inputFecha.value=aFechaLocal(hoy);}

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion&&Array.isArray(guardado.registros)){estado.config=normalizarConfig(guardado.configuracion);estado.registros=normalizarRegistros(guardado.registros);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ayag-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.registros=normalizarRegistros(data.registros||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.registros=normalizarRegistros(demoFallback.registros);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.botonesRapidos.forEach(function(btn){btn.addEventListener('click',function(){agregarAgua(Number(btn.getAttribute('data-ml')),'Rápido','Botón rápido');});});
    el.btnLimpiar.addEventListener('click',limpiarDiaActual);
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarManual();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.registros=normalizarRegistros(demoFallback.registros);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
  }

  function guardarManual(){
    var cantidad=numero(el.inputMl.value);var meta=numero(el.inputMeta.value);var fecha=el.inputFecha.value;var momento=el.inputMomento.value;var nota=el.inputNota.value.trim()||'Sin nota';
    if(!fecha){mostrarMensaje('Selecciona una fecha.',true);return;}
    if(!Number.isFinite(cantidad)||cantidad<=0||cantidad>3000){mostrarMensaje('Ingresa una cantidad válida.',true);return;}
    if(!Number.isFinite(meta)||meta<500||meta>6000){mostrarMensaje('La meta debe estar entre 500 y 6000 ml.',true);return;}
    estado.config.metaDiariaMl=meta;estado.registros.push({fecha:fecha,cantidadMl:cantidad,momento:momento,nota:nota});guardarLocal();el.inputMl.value='';el.inputNota.value='';mostrarMensaje('Agua registrada correctamente.',false);renderizarTodo();
  }

  function agregarAgua(cantidad,momento,nota){
    if(!Number.isFinite(cantidad)||cantidad<=0){mostrarMensaje('Cantidad no válida.',true);return;}
    var hoy=aFechaLocal(new Date());estado.registros.push({fecha:hoy,cantidadMl:cantidad,momento:momento,nota:nota});guardarLocal();mostrarMensaje('Agregaste '+cantidad+' ml.',false);renderizarTodo();
  }

  function limpiarDiaActual(){
    var hoy=el.inputFecha.value||aFechaLocal(new Date());estado.registros=estado.registros.filter(function(item){return item.fecha!==hoy;});guardarLocal();mostrarMensaje('Día limpiado correctamente.',false);renderizarTodo();
  }

  function llenarFormulario(){el.inputMeta.value=estado.config.metaDiariaMl||2500;}

  function renderizarTodo(){
    var hoy=el.inputFecha.value||aFechaLocal(new Date());var total=totalPorFecha(hoy);var meta=estado.config.metaDiariaMl||2500;var porcentaje=Math.min(100,Math.round((total/meta)*100));
    el.totalHoy.textContent=total+' ml';el.fechaHoy.textContent=formatearFecha(hoy);el.meta.textContent=meta+' ml';el.progreso.textContent=porcentaje+'%';el.totalRegistros.textContent=String(estado.registros.length);el.fill.style.height=porcentaje+'%';el.bottleText.textContent=porcentaje+'%';renderizarTabla(hoy);
  }

  function renderizarTabla(fecha){
    el.tabla.innerHTML='';estado.registros.slice().reverse().slice(0,12).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td><strong>'+esc(item.cantidadMl+' ml')+'</strong></td><td>'+esc(item.momento||'--')+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});
  }

  function totalPorFecha(fecha){return estado.registros.filter(function(item){return item.fecha===fecha;}).reduce(function(total,item){return total+(Number(item.cantidadMl)||0);},0);}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,registros:estado.registros}));el.modo.textContent='Datos locales';}
  function normalizarConfig(c){return{metaDiariaMl:numero(c.metaDiariaMl)||2500,nota:c.nota||'Sin nota'};}
  function normalizarRegistros(lista){return lista.map(function(i){return{fecha:i.fecha,cantidadMl:numero(i.cantidadMl)||0,momento:i.momento||'Manual',nota:i.nota||'Sin nota'};}).filter(function(i){return i.fecha&&i.cantidadMl>0;}).sort(function(a,b){return a.fecha.localeCompare(b.fecha);});}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?n:null;}
  function aFechaLocal(fecha){var y=fecha.getFullYear();var m=String(fecha.getMonth()+1).padStart(2,'0');var d=String(fecha.getDate()).padStart(2,'0');return y+'-'+m+'-'+d;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ayag-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
