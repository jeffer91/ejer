/* =========================================================
Nombre completo: reha-main.js
Ruta o ubicación: src/pantallas/04-recomendaciones/04-habitos/reha-main.js
Función o funciones:
- Cargar datos demo o recomendaciones guardadas localmente.
- Generar recomendaciones locales prudentes sobre hábitos.
- Permitir aplicar o descartar recomendaciones en localStorage.
Con qué se conecta:
- reha-index.html
- reha.css
- data/reha-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-reha-recomendaciones';
  var estado={resumen:null,datos:null,recomendaciones:[]};
  var demoFallback={resumenHabitos:{periodo:'Semana demo',suenoPromedioHoras:7.2,aguaPromedioMl:2100,energiaPromedio:4.1,diasConRegistro:5,diasConMovimiento:5,diasDescanso:2,notasRegistradas:6},datos:{sueno:'Sueño estable.',agua:'Agua cercana a la meta.',movimiento:'Movimiento frecuente.',registro:'Registros parciales.',organizacion:'Plan semanal.'},recomendacionesBase:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('reha-modo-datos');el.estado=document.getElementById('reha-estado');el.sueno=document.getElementById('reha-sueno');el.registro=document.getElementById('reha-registro');el.aplicadas=document.getElementById('reha-aplicadas');el.btnGenerar=document.getElementById('reha-btn-generar');el.btnDemo=document.getElementById('reha-btn-restaurar-demo');el.mensaje=document.getElementById('reha-mensaje');el.dataList=document.getElementById('reha-data-list');el.lista=document.getElementById('reha-lista-recomendaciones');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    return fetch('./data/reha-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.resumen=data.resumenHabitos||demoFallback.resumenHabitos;estado.datos=data.datos||demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):normalizarRecomendaciones(data.recomendacionesBase||[]);el.modo.textContent=guardado?'Datos locales':'Modo demo';}).catch(function(){estado.resumen=demoFallback.resumenHabitos;estado.datos=demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):generarDesdeReglas();el.modo.textContent=guardado?'Datos locales':'Modo demo interno';});
  }

  function conectarEventos(){
    el.btnGenerar.addEventListener('click',function(){estado.recomendaciones=generarDesdeReglas();guardarLocal();mostrarMensaje('Recomendaciones de hábitos generadas.',false);renderizarTodo();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);cargarDatos().then(function(){mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});});
  }

  function generarDesdeReglas(){
    var r=estado.resumen||demoFallback.resumenHabitos;
    var lista=[];
    lista.push({id:'reha-regla-sueno',titulo:'Proteger una rutina de sueño estable',explicacion:'El sueño promedio es '+r.suenoPromedioHoras+' horas. Mantener una hora parecida para dormir puede ayudar a sostener energía y entrenamiento.',prioridad:r.suenoPromedioHoras>=7?'Media':'Alta',categoria:'Descanso',estado:'Pendiente'});
    lista.push({id:'reha-regla-registro',titulo:'Registrar una nota diaria de 30 segundos',explicacion:'Hay '+r.diasConRegistro+'/7 días con registro. Una nota corta ayuda a encontrar patrones sin complicar la rutina.',prioridad:r.diasConRegistro>=6?'Baja':'Alta',categoria:'Registro',estado:'Pendiente'});
    lista.push({id:'reha-regla-agua',titulo:'Repartir agua en momentos fijos',explicacion:'El promedio es '+Math.round(r.aguaPromedioMl)+' ml. Puedes asociar agua con mañana, tarde y entrenamiento para hacerlo automático.',prioridad:r.aguaPromedioMl>=2000?'Media':'Alta',categoria:'Hidratación',estado:'Pendiente'});
    lista.push({id:'reha-regla-organizacion',titulo:'Preparar una acción para mañana',explicacion:'Elegir una sola acción pequeña antes de dormir reduce improvisación y mejora la constancia.',prioridad:'Media',categoria:'Organización',estado:'Pendiente'});
    return normalizarRecomendaciones(lista);
  }

  function renderizarTodo(){renderizarResumen();renderizarDatos();renderizarRecomendaciones();}

  function renderizarResumen(){
    var r=estado.resumen||demoFallback.resumenHabitos;var aplicadas=estado.recomendaciones.filter(function(i){return i.estado==='Aplicada';}).length;var estadoTexto=r.diasConRegistro>=5&&r.suenoPromedioHoras>=7?'Estable':'Revisar';
    el.estado.textContent=estadoTexto;el.sueno.textContent=r.suenoPromedioHoras+' h';el.registro.textContent=r.diasConRegistro+'/7';el.aplicadas.textContent=String(aplicadas);
  }

  function renderizarDatos(){
    el.dataList.innerHTML='';var r=estado.resumen||demoFallback.resumenHabitos;var datos=['Periodo: '+r.periodo,'Sueño promedio: '+r.suenoPromedioHoras+' horas','Agua promedio: '+Math.round(r.aguaPromedioMl)+' ml','Energía promedio: '+r.energiaPromedio+'/5','Días con movimiento: '+r.diasConMovimiento+'/7','Notas registradas: '+r.notasRegistradas];datos.forEach(function(texto){var li=document.createElement('li');li.textContent=texto;el.dataList.appendChild(li);});
  }

  function renderizarRecomendaciones(){
    el.lista.innerHTML='';if(!estado.recomendaciones.length){var vacio=document.createElement('p');vacio.textContent='No hay recomendaciones todavía. Presiona Analizar hábitos.';el.lista.appendChild(vacio);return;}
    estado.recomendaciones.forEach(function(item){var card=document.createElement('article');card.className='reha-rec '+(item.estado==='Aplicada'?'reha-aplicada':'')+(item.estado==='Descartada'?' reha-descartada':'');var pillClass=item.prioridad==='Alta'?'reha-pill-alta':item.prioridad==='Media'?'reha-pill-media':'reha-pill-baja';card.innerHTML='<span class="reha-pill '+pillClass+'">'+esc(item.prioridad)+'</span><h3>'+esc(item.titulo)+'</h3><p>'+esc(item.explicacion)+'</p><p><strong>Categoría:</strong> '+esc(item.categoria)+'</p><p><strong>Estado:</strong> '+esc(item.estado)+'</p><div class="reha-rec-actions"><button data-accion="aplicar" data-id="'+esc(item.id)+'">Aplicar</button><button class="reha-btn-light" data-accion="descartar" data-id="'+esc(item.id)+'">Descartar</button></div>';el.lista.appendChild(card);});
    Array.prototype.slice.call(el.lista.querySelectorAll('button[data-accion]')).forEach(function(btn){btn.addEventListener('click',function(){actualizarEstado(btn.getAttribute('data-id'),btn.getAttribute('data-accion'));});});
  }

  function actualizarEstado(id,accion){estado.recomendaciones=estado.recomendaciones.map(function(item){if(item.id!==id){return item;}item.estado=accion==='aplicar'?'Aplicada':'Descartada';return item;});guardarLocal();mostrarMensaje(accion==='aplicar'?'Recomendación aplicada.':'Recomendación descartada.',false);renderizarTodo();}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({recomendaciones:estado.recomendaciones}));el.modo.textContent='Datos locales';}
  function normalizarRecomendaciones(lista){return lista.map(function(item,index){return{id:item.id||('reha-rec-'+index),titulo:item.titulo||'Recomendación',explicacion:item.explicacion||'Sin explicación',prioridad:item.prioridad||'Media',categoria:item.categoria||'Hábitos',estado:item.estado||'Pendiente'};});}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('reha-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
