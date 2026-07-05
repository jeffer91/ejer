/* =========================================================
Nombre completo: reag-main.js
Ruta o ubicación: src/pantallas/04-recomendaciones/01-analisis-general/reag-main.js
Función o funciones:
- Cargar datos demo o recomendaciones guardadas localmente.
- Generar recomendaciones locales prudentes para análisis general.
- Permitir aplicar o descartar recomendaciones en localStorage.
Con qué se conecta:
- reag-index.html
- reag.css
- data/reag-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-reag-recomendaciones';
  var estado={resumen:null,datos:null,recomendaciones:[]};
  var demoFallback={resumen:{periodo:'Últimos 7 días demo',energiaPromedio:4,aguaPromedioMl:2100,suenoPromedioHoras:7,entrenamientosSemana:3,hiitSemana:1,diasDescanso:2,registrosProgreso:5},datos:{progreso:'Hay registros recientes.',entrenamiento:'Semana activa.',hidratacion:'Promedio cercano a la meta.',descanso:'Descanso estable.'},recomendacionesBase:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('reag-modo-datos');el.estadoGeneral=document.getElementById('reag-estado-general');el.prioridadAlta=document.getElementById('reag-prioridad-alta');el.aplicadas=document.getElementById('reag-aplicadas');el.descartadas=document.getElementById('reag-descartadas');el.btnGenerar=document.getElementById('reag-btn-generar');el.btnDemo=document.getElementById('reag-btn-restaurar-demo');el.mensaje=document.getElementById('reag-mensaje');el.dataList=document.getElementById('reag-data-list');el.lista=document.getElementById('reag-lista-recomendaciones');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    return fetch('./data/reag-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.resumen=data.resumen||demoFallback.resumen;estado.datos=data.datos||demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):normalizarRecomendaciones(data.recomendacionesBase||[]);el.modo.textContent=guardado?'Datos locales':'Modo demo';}).catch(function(){estado.resumen=demoFallback.resumen;estado.datos=demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):generarDesdeReglas();el.modo.textContent=guardado?'Datos locales':'Modo demo interno';});
  }

  function conectarEventos(){
    el.btnGenerar.addEventListener('click',function(){estado.recomendaciones=generarDesdeReglas();guardarLocal();mostrarMensaje('Recomendaciones generadas correctamente.',false);renderizarTodo();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);cargarDatos().then(function(){mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});});
  }

  function generarDesdeReglas(){
    var r=estado.resumen||demoFallback.resumen;
    var lista=[];
    lista.push({id:'rec-recuperacion',titulo:'Cuidar la recuperación semanal',explicacion:'Con '+r.entrenamientosSemana+' entrenamientos y '+r.hiitSemana+' sesión HIIT, conviene mantener días de descanso y revisar energía antes de subir intensidad.',prioridad:r.diasDescanso>=2?'Media':'Alta',categoria:'Entrenamiento',estado:'Pendiente'});
    lista.push({id:'rec-hidratacion',titulo:'Revisar hidratación por momentos del día',explicacion:'El promedio es '+Math.round(r.aguaPromedioMl)+' ml. Una acción útil es repartir el agua entre mañana, tarde y alrededor del entrenamiento.',prioridad:r.aguaPromedioMl>=2000?'Media':'Alta',categoria:'Hábitos',estado:'Pendiente'});
    lista.push({id:'rec-sueno',titulo:'Mantener una hora estable para dormir',explicacion:'El sueño promedio es '+r.suenoPromedioHoras+' horas. Mantener horarios estables ayuda a entrenar con mejor energía.',prioridad:r.suenoPromedioHoras>=7?'Baja':'Media',categoria:'Descanso',estado:'Pendiente'});
    lista.push({id:'rec-registro',titulo:'Registrar energía y nota breve',explicacion:'La energía promedio es '+r.energiaPromedio+'/5. Registrar una nota corta ayuda a que Gemini luego sugiera ajustes más útiles.',prioridad:'Media',categoria:'Progreso',estado:'Pendiente'});
    return normalizarRecomendaciones(lista);
  }

  function renderizarTodo(){renderizarResumen();renderizarDatos();renderizarRecomendaciones();}

  function renderizarResumen(){
    var total=estado.recomendaciones.length;var altas=estado.recomendaciones.filter(function(i){return i.prioridad==='Alta';}).length;var aplicadas=estado.recomendaciones.filter(function(i){return i.estado==='Aplicada';}).length;var descartadas=estado.recomendaciones.filter(function(i){return i.estado==='Descartada';}).length;
    el.estadoGeneral.textContent=total?'Con análisis':'Sin análisis';el.prioridadAlta.textContent=String(altas);el.aplicadas.textContent=String(aplicadas);el.descartadas.textContent=String(descartadas);
  }

  function renderizarDatos(){
    el.dataList.innerHTML='';var r=estado.resumen||demoFallback.resumen;var datos=['Periodo: '+r.periodo,'Energía promedio: '+r.energiaPromedio+'/5','Agua promedio: '+Math.round(r.aguaPromedioMl)+' ml','Sueño promedio: '+r.suenoPromedioHoras+' horas','Entrenamientos: '+r.entrenamientosSemana+' | HIIT: '+r.hiitSemana+' | Descanso: '+r.diasDescanso];datos.forEach(function(texto){var li=document.createElement('li');li.textContent=texto;el.dataList.appendChild(li);});
  }

  function renderizarRecomendaciones(){
    el.lista.innerHTML='';if(!estado.recomendaciones.length){var vacio=document.createElement('p');vacio.textContent='No hay recomendaciones todavía. Presiona Generar recomendaciones.';el.lista.appendChild(vacio);return;}
    estado.recomendaciones.forEach(function(item){var card=document.createElement('article');card.className='reag-rec '+(item.estado==='Aplicada'?'reag-aplicada':'')+(item.estado==='Descartada'?' reag-descartada':'');var pillClass=item.prioridad==='Alta'?'reag-pill-alta':item.prioridad==='Media'?'reag-pill-media':'reag-pill-baja';card.innerHTML='<span class="reag-pill '+pillClass+'">'+esc(item.prioridad)+'</span><h3>'+esc(item.titulo)+'</h3><p>'+esc(item.explicacion)+'</p><p><strong>Categoría:</strong> '+esc(item.categoria)+'</p><p><strong>Estado:</strong> '+esc(item.estado)+'</p><div class="reag-rec-actions"><button data-accion="aplicar" data-id="'+esc(item.id)+'">Aplicar</button><button class="reag-btn-light" data-accion="descartar" data-id="'+esc(item.id)+'">Descartar</button></div>';el.lista.appendChild(card);});
    Array.prototype.slice.call(el.lista.querySelectorAll('button[data-accion]')).forEach(function(btn){btn.addEventListener('click',function(){actualizarEstado(btn.getAttribute('data-id'),btn.getAttribute('data-accion'));});});
  }

  function actualizarEstado(id,accion){estado.recomendaciones=estado.recomendaciones.map(function(item){if(item.id!==id){return item;}item.estado=accion==='aplicar'?'Aplicada':'Descartada';return item;});guardarLocal();mostrarMensaje(accion==='aplicar'?'Recomendación aplicada.':'Recomendación descartada.',false);renderizarTodo();}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({recomendaciones:estado.recomendaciones}));el.modo.textContent='Datos locales';}
  function normalizarRecomendaciones(lista){return lista.map(function(item,index){return{id:item.id||('rec-'+index),titulo:item.titulo||'Recomendación',explicacion:item.explicacion||'Sin explicación',prioridad:item.prioridad||'Media',categoria:item.categoria||'General',estado:item.estado||'Pendiente'};});}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('reag-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
