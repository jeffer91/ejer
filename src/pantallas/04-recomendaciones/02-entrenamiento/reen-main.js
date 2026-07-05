/* =========================================================
Nombre completo: reen-main.js
Ruta o ubicación: src/pantallas/04-recomendaciones/02-entrenamiento/reen-main.js
Función o funciones:
- Cargar datos demo o recomendaciones guardadas localmente.
- Generar recomendaciones locales prudentes de entrenamiento.
- Permitir aplicar o descartar recomendaciones en localStorage.
Con qué se conecta:
- reen-index.html
- reen.css
- data/reen-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-reen-recomendaciones';
  var estado={resumen:null,datos:null,recomendaciones:[]};
  var demoFallback={resumenEntrenamiento:{periodo:'Semana demo',entrenamientos:3,hiit:1,descanso:2,caminata:1,seriesRegistradas:8,esfuerzoPromedio:4,energiaPromedio:4.1,sesionesCompletadas:4},datos:{rutina:'Plan demo.',carga:'Carga moderada.',registro:'Registro básico.',recuperacion:'Descanso presente.'},recomendacionesBase:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('reen-modo-datos');el.balance=document.getElementById('reen-balance');el.entrenos=document.getElementById('reen-entrenos');el.hiit=document.getElementById('reen-hiit');el.descanso=document.getElementById('reen-descanso');el.btnGenerar=document.getElementById('reen-btn-generar');el.btnDemo=document.getElementById('reen-btn-restaurar-demo');el.mensaje=document.getElementById('reen-mensaje');el.dataList=document.getElementById('reen-data-list');el.lista=document.getElementById('reen-lista-recomendaciones');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    return fetch('./data/reen-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.resumen=data.resumenEntrenamiento||demoFallback.resumenEntrenamiento;estado.datos=data.datos||demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):normalizarRecomendaciones(data.recomendacionesBase||[]);el.modo.textContent=guardado?'Datos locales':'Modo demo';}).catch(function(){estado.resumen=demoFallback.resumenEntrenamiento;estado.datos=demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):generarDesdeReglas();el.modo.textContent=guardado?'Datos locales':'Modo demo interno';});
  }

  function conectarEventos(){
    el.btnGenerar.addEventListener('click',function(){estado.recomendaciones=generarDesdeReglas();guardarLocal();mostrarMensaje('Recomendaciones de entrenamiento generadas.',false);renderizarTodo();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);cargarDatos().then(function(){mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});});
  }

  function generarDesdeReglas(){
    var r=estado.resumen||demoFallback.resumenEntrenamiento;
    var lista=[];
    var prioridadDescanso=r.descanso>=2?'Media':'Alta';
    var prioridadHiit=r.hiit<=1?'Media':'Alta';
    lista.push({id:'reen-regla-descanso',titulo:'Proteger la recuperación semanal',explicacion:'La semana tiene '+r.entrenamientos+' entrenamientos, '+r.hiit+' HIIT y '+r.descanso+' días de descanso. Mantén descansos antes de subir volumen.',prioridad:prioridadDescanso,categoria:'Recuperación',estado:'Pendiente'});
    lista.push({id:'reen-regla-esfuerzo',titulo:'Controlar el esfuerzo promedio',explicacion:'El esfuerzo promedio es '+r.esfuerzoPromedio+'/5. Si varios días se sienten pesados, baja carga o reduce una serie antes de aumentar intensidad.',prioridad:r.esfuerzoPromedio>=4?'Alta':'Media',categoria:'Intensidad',estado:'Pendiente'});
    lista.push({id:'reen-regla-hiit',titulo:'No abusar del HIIT',explicacion:'Con una sesión HIIT semanal y entrenamientos de fuerza, conviene mantener intervalos controlados y descanso suficiente.',prioridad:prioridadHiit,categoria:'HIIT',estado:'Pendiente'});
    lista.push({id:'reen-regla-registro',titulo:'Anotar técnica y sensación',explicacion:'Hay '+r.seriesRegistradas+' series registradas. Una nota breve de técnica o molestia hace que las próximas sugerencias sean más precisas.',prioridad:'Media',categoria:'Registro',estado:'Pendiente'});
    return normalizarRecomendaciones(lista);
  }

  function renderizarTodo(){renderizarResumen();renderizarDatos();renderizarRecomendaciones();}

  function renderizarResumen(){
    var r=estado.resumen||demoFallback.resumenEntrenamiento;var balance=r.descanso>=2&&r.hiit<=1?'Equilibrado':'Revisar';
    el.balance.textContent=balance;el.entrenos.textContent=String(r.entrenamientos||0);el.hiit.textContent=String(r.hiit||0);el.descanso.textContent=String(r.descanso||0);
  }

  function renderizarDatos(){
    el.dataList.innerHTML='';var r=estado.resumen||demoFallback.resumenEntrenamiento;var datos=['Periodo: '+r.periodo,'Sesiones completadas: '+r.sesionesCompletadas,'Series registradas: '+r.seriesRegistradas,'Esfuerzo promedio: '+r.esfuerzoPromedio+'/5','Energía promedio: '+r.energiaPromedio+'/5','Caminatas: '+r.caminata];datos.forEach(function(texto){var li=document.createElement('li');li.textContent=texto;el.dataList.appendChild(li);});
  }

  function renderizarRecomendaciones(){
    el.lista.innerHTML='';if(!estado.recomendaciones.length){var vacio=document.createElement('p');vacio.textContent='No hay recomendaciones todavía. Presiona Analizar entrenamiento.';el.lista.appendChild(vacio);return;}
    estado.recomendaciones.forEach(function(item){var card=document.createElement('article');card.className='reen-rec '+(item.estado==='Aplicada'?'reen-aplicada':'')+(item.estado==='Descartada'?' reen-descartada':'');var pillClass=item.prioridad==='Alta'?'reen-pill-alta':item.prioridad==='Media'?'reen-pill-media':'reen-pill-baja';card.innerHTML='<span class="reen-pill '+pillClass+'">'+esc(item.prioridad)+'</span><h3>'+esc(item.titulo)+'</h3><p>'+esc(item.explicacion)+'</p><p><strong>Categoría:</strong> '+esc(item.categoria)+'</p><p><strong>Estado:</strong> '+esc(item.estado)+'</p><div class="reen-rec-actions"><button data-accion="aplicar" data-id="'+esc(item.id)+'">Aplicar</button><button class="reen-btn-light" data-accion="descartar" data-id="'+esc(item.id)+'">Descartar</button></div>';el.lista.appendChild(card);});
    Array.prototype.slice.call(el.lista.querySelectorAll('button[data-accion]')).forEach(function(btn){btn.addEventListener('click',function(){actualizarEstado(btn.getAttribute('data-id'),btn.getAttribute('data-accion'));});});
  }

  function actualizarEstado(id,accion){estado.recomendaciones=estado.recomendaciones.map(function(item){if(item.id!==id){return item;}item.estado=accion==='aplicar'?'Aplicada':'Descartada';return item;});guardarLocal();mostrarMensaje(accion==='aplicar'?'Recomendación aplicada.':'Recomendación descartada.',false);renderizarTodo();}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({recomendaciones:estado.recomendaciones}));el.modo.textContent='Datos locales';}
  function normalizarRecomendaciones(lista){return lista.map(function(item,index){return{id:item.id||('reen-rec-'+index),titulo:item.titulo||'Recomendación',explicacion:item.explicacion||'Sin explicación',prioridad:item.prioridad||'Media',categoria:item.categoria||'Entrenamiento',estado:item.estado||'Pendiente'};});}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('reen-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
