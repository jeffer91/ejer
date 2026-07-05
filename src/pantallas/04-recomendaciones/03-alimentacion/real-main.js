/* =========================================================
Nombre completo: real-main.js
Ruta o ubicación: src/pantallas/04-recomendaciones/03-alimentacion/real-main.js
Función o funciones:
- Cargar datos demo o recomendaciones guardadas localmente.
- Generar recomendaciones locales prudentes de alimentación.
- Permitir aplicar o descartar recomendaciones en localStorage.
Con qué se conecta:
- real-index.html
- real.css
- data/real-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-real-recomendaciones';
  var estado={resumen:null,datos:null,recomendaciones:[]};
  var demoFallback={resumenAlimentacion:{periodo:'Semana demo',comidasPlanificadas:10,comidasSinPlan:3,aguaPromedioMl:2100,energiaPromedio:4.1,suenoPromedioHoras:7.2,entrenamientos:3,diasConNota:5},datos:{horarios:'Datos demo de horarios.',energia:'Energía estable.',hidratacion:'Hidratación cercana a la meta.',entrenamiento:'Días con entrenamiento.'},recomendacionesBase:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('real-modo-datos');el.balance=document.getElementById('real-balance');el.agua=document.getElementById('real-agua');el.energia=document.getElementById('real-energia');el.planificacion=document.getElementById('real-planificacion');el.btnGenerar=document.getElementById('real-btn-generar');el.btnDemo=document.getElementById('real-btn-restaurar-demo');el.mensaje=document.getElementById('real-mensaje');el.dataList=document.getElementById('real-data-list');el.lista=document.getElementById('real-lista-recomendaciones');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    return fetch('./data/real-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.resumen=data.resumenAlimentacion||demoFallback.resumenAlimentacion;estado.datos=data.datos||demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):normalizarRecomendaciones(data.recomendacionesBase||[]);el.modo.textContent=guardado?'Datos locales':'Modo demo';}).catch(function(){estado.resumen=demoFallback.resumenAlimentacion;estado.datos=demoFallback.datos;estado.recomendaciones=guardado&&Array.isArray(guardado.recomendaciones)?normalizarRecomendaciones(guardado.recomendaciones):generarDesdeReglas();el.modo.textContent=guardado?'Datos locales':'Modo demo interno';});
  }

  function conectarEventos(){
    el.btnGenerar.addEventListener('click',function(){estado.recomendaciones=generarDesdeReglas();guardarLocal();mostrarMensaje('Recomendaciones de alimentación generadas.',false);renderizarTodo();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);cargarDatos().then(function(){mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});});
  }

  function generarDesdeReglas(){
    var r=estado.resumen||demoFallback.resumenAlimentacion;
    var lista=[];
    lista.push({id:'real-regla-plan',titulo:'Preparar una opción base para días ocupados',explicacion:'Hay '+r.comidasSinPlan+' comidas sin planificación en la semana demo. Tener una opción sencilla evita improvisar cuando hay trabajo o entrenamiento.',prioridad:r.comidasSinPlan>=3?'Alta':'Media',categoria:'Organización',estado:'Pendiente'});
    lista.push({id:'real-regla-agua',titulo:'Repartir la hidratación durante el día',explicacion:'El promedio de agua es '+Math.round(r.aguaPromedioMl)+' ml. Puedes repartirla entre mañana, tarde y momentos de entrenamiento sin forzar cantidades excesivas.',prioridad:r.aguaPromedioMl>=2000?'Media':'Alta',categoria:'Hidratación',estado:'Pendiente'});
    lista.push({id:'real-regla-energia',titulo:'Registrar energía después de comer',explicacion:'La energía promedio es '+r.energiaPromedio+'/5. Registrar cómo te sientes ayuda a detectar qué comidas te funcionan mejor.',prioridad:'Media',categoria:'Registro',estado:'Pendiente'});
    lista.push({id:'real-regla-sueno',titulo:'Relacionar cena y descanso',explicacion:'El sueño promedio es '+r.suenoPromedioHoras+' horas. Una rutina tranquila por la noche puede ayudar a sostener descanso y entrenamiento.',prioridad:r.suenoPromedioHoras>=7?'Baja':'Media',categoria:'Descanso',estado:'Pendiente'});
    return normalizarRecomendaciones(lista);
  }

  function renderizarTodo(){renderizarResumen();renderizarDatos();renderizarRecomendaciones();}

  function renderizarResumen(){
    var r=estado.resumen||demoFallback.resumenAlimentacion;var balance=r.comidasSinPlan<=3&&r.aguaPromedioMl>=2000?'Estable':'Revisar';
    el.balance.textContent=balance;el.agua.textContent=Math.round(r.aguaPromedioMl)+' ml';el.energia.textContent=r.energiaPromedio+'/5';el.planificacion.textContent=r.comidasPlanificadas+'/'+(r.comidasPlanificadas+r.comidasSinPlan);
  }

  function renderizarDatos(){
    el.dataList.innerHTML='';var r=estado.resumen||demoFallback.resumenAlimentacion;var datos=['Periodo: '+r.periodo,'Comidas planificadas: '+r.comidasPlanificadas,'Comidas sin plan: '+r.comidasSinPlan,'Agua promedio: '+Math.round(r.aguaPromedioMl)+' ml','Energía promedio: '+r.energiaPromedio+'/5','Días con nota: '+r.diasConNota];datos.forEach(function(texto){var li=document.createElement('li');li.textContent=texto;el.dataList.appendChild(li);});
  }

  function renderizarRecomendaciones(){
    el.lista.innerHTML='';if(!estado.recomendaciones.length){var vacio=document.createElement('p');vacio.textContent='No hay recomendaciones todavía. Presiona Analizar alimentación.';el.lista.appendChild(vacio);return;}
    estado.recomendaciones.forEach(function(item){var card=document.createElement('article');card.className='real-rec '+(item.estado==='Aplicada'?'real-aplicada':'')+(item.estado==='Descartada'?' real-descartada':'');var pillClass=item.prioridad==='Alta'?'real-pill-alta':item.prioridad==='Media'?'real-pill-media':'real-pill-baja';card.innerHTML='<span class="real-pill '+pillClass+'">'+esc(item.prioridad)+'</span><h3>'+esc(item.titulo)+'</h3><p>'+esc(item.explicacion)+'</p><p><strong>Categoría:</strong> '+esc(item.categoria)+'</p><p><strong>Estado:</strong> '+esc(item.estado)+'</p><div class="real-rec-actions"><button data-accion="aplicar" data-id="'+esc(item.id)+'">Aplicar</button><button class="real-btn-light" data-accion="descartar" data-id="'+esc(item.id)+'">Descartar</button></div>';el.lista.appendChild(card);});
    Array.prototype.slice.call(el.lista.querySelectorAll('button[data-accion]')).forEach(function(btn){btn.addEventListener('click',function(){actualizarEstado(btn.getAttribute('data-id'),btn.getAttribute('data-accion'));});});
  }

  function actualizarEstado(id,accion){estado.recomendaciones=estado.recomendaciones.map(function(item){if(item.id!==id){return item;}item.estado=accion==='aplicar'?'Aplicada':'Descartada';return item;});guardarLocal();mostrarMensaje(accion==='aplicar'?'Recomendación aplicada.':'Recomendación descartada.',false);renderizarTodo();}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({recomendaciones:estado.recomendaciones}));el.modo.textContent='Datos locales';}
  function normalizarRecomendaciones(lista){return lista.map(function(item,index){return{id:item.id||('real-rec-'+index),titulo:item.titulo||'Recomendación',explicacion:item.explicacion||'Sin explicación',prioridad:item.prioridad||'Media',categoria:item.categoria||'Alimentación',estado:item.estado||'Pendiente'};});}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('real-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
