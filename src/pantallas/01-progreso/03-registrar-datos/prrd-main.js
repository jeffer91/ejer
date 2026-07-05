/* =========================================================
Nombre completo: prrd-main.js
Ruta o ubicación: src/pantallas/01-progreso/03-registrar-datos/prrd-main.js
Función o funciones:
- Cargar datos demo o datos guardados localmente.
- Registrar datos diarios generales en localStorage.
- Mostrar resumen, historial e ideas simples de revisión.
Con qué se conecta:
- prrd-index.html
- prrd.css
- data/prrd-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-prrd-registros';
  var estado={registros:[]};
  var demoFallback={registros:[{fecha:'2026-07-01',pesoKg:90.5,cinturaCm:94,energia:4,aguaMl:1800,suenoHoras:7,actividad:'Entrenamiento',nota:'Día demo.'},{fecha:'2026-07-02',pesoKg:90.4,cinturaCm:93.9,energia:4,aguaMl:2100,suenoHoras:7.5,actividad:'Caminata',nota:'Día demo.'},{fecha:'2026-07-03',pesoKg:90.2,cinturaCm:93.8,energia:5,aguaMl:2300,suenoHoras:8,actividad:'Descanso',nota:'Día demo.'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();ponerFechaHoy();cargarDatos().then(function(){conectarEventos();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('prrd-modo-datos');el.fechaActual=document.getElementById('prrd-fecha-actual');el.energiaActual=document.getElementById('prrd-energia-actual');el.aguaActual=document.getElementById('prrd-agua-actual');el.actividadActual=document.getElementById('prrd-actividad-actual');el.form=document.getElementById('prrd-form');el.inputFecha=document.getElementById('prrd-input-fecha');el.inputPeso=document.getElementById('prrd-input-peso');el.inputCintura=document.getElementById('prrd-input-cintura');el.inputEnergia=document.getElementById('prrd-input-energia');el.inputAgua=document.getElementById('prrd-input-agua');el.inputSueno=document.getElementById('prrd-input-sueno');el.inputActividad=document.getElementById('prrd-input-actividad');el.inputNota=document.getElementById('prrd-input-nota');el.btnDemo=document.getElementById('prrd-btn-restaurar-demo');el.mensaje=document.getElementById('prrd-mensaje');el.insights=document.getElementById('prrd-insights');el.tabla=document.getElementById('prrd-tabla-body');
  }

  function ponerFechaHoy(){var hoy=new Date();el.inputFecha.value=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');}

  function cargarDatos(){var guardado=leerJson(STORAGE_KEY);if(guardado&&Array.isArray(guardado.registros)){estado.registros=normalizar(guardado.registros);el.modo.textContent='Datos locales';return Promise.resolve();}return fetch('./data/prrd-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.registros=normalizar(data.registros||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.registros=normalizar(demoFallback.registros);el.modo.textContent='Modo demo interno';});}

  function conectarEventos(){el.form.addEventListener('submit',function(event){event.preventDefault();guardarRegistro();});el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.registros=normalizar(demoFallback.registros);el.modo.textContent='Modo demo restaurado';mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});}

  function guardarRegistro(){
    var registro={fecha:el.inputFecha.value,pesoKg:numero(el.inputPeso.value),cinturaCm:numero(el.inputCintura.value),energia:numero(el.inputEnergia.value),aguaMl:numero(el.inputAgua.value),suenoHoras:numero(el.inputSueno.value),actividad:el.inputActividad.value,nota:el.inputNota.value.trim()||'Sin nota'};
    if(!registro.fecha){mostrarMensaje('Selecciona una fecha.',true);return;}
    if(!Number.isFinite(registro.energia)||registro.energia<1||registro.energia>5){mostrarMensaje('La energía debe estar entre 1 y 5.',true);return;}
    estado.registros=estado.registros.filter(function(item){return item.fecha!==registro.fecha;});estado.registros.push(registro);estado.registros=normalizar(estado.registros);localStorage.setItem(STORAGE_KEY,JSON.stringify({registros:estado.registros}));el.inputNota.value='';el.modo.textContent='Datos locales';mostrarMensaje('Registro diario guardado correctamente.',false);renderizarTodo();
  }

  function renderizarTodo(){var ultimo=estado.registros[estado.registros.length-1];if(!ultimo){return;}el.fechaActual.textContent=formatearFecha(ultimo.fecha);el.energiaActual.textContent=(ultimo.energia||'--')+'/5';el.aguaActual.textContent=Number.isFinite(ultimo.aguaMl)?ultimo.aguaMl+' ml':'-- ml';el.actividadActual.textContent=ultimo.actividad||'--';renderizarInsights();renderizarTabla();}

  function renderizarInsights(){el.insights.innerHTML='';var ultimos=estado.registros.slice(-7);var promedioEnergia=promedio(ultimos,'energia');var promedioAgua=promedio(ultimos,'aguaMl');var promedioSueno=promedio(ultimos,'suenoHoras');var textos=['Energía promedio reciente: '+(promedioEnergia?promedioEnergia.toFixed(1)+'/5':'sin datos suficientes')+'.','Agua promedio reciente: '+(promedioAgua?Math.round(promedioAgua)+' ml':'sin datos suficientes')+'.','Sueño promedio reciente: '+(promedioSueno?promedioSueno.toFixed(1)+' horas':'sin datos suficientes')+'.'];textos.forEach(function(t){var li=document.createElement('li');li.textContent=t;el.insights.appendChild(li);});}

  function renderizarTabla(){el.tabla.innerHTML='';estado.registros.slice().reverse().slice(0,10).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td>'+esc(item.energia?item.energia+'/5':'--')+'</td><td>'+esc(Number.isFinite(item.aguaMl)?item.aguaMl+' ml':'--')+'</td><td>'+esc(Number.isFinite(item.suenoHoras)?item.suenoHoras+' h':'--')+'</td><td>'+esc(item.actividad||'--')+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});}

  function normalizar(registros){return registros.map(function(item){return{fecha:item.fecha,pesoKg:numero(item.pesoKg),cinturaCm:numero(item.cinturaCm),energia:numero(item.energia),aguaMl:numero(item.aguaMl),suenoHoras:numero(item.suenoHoras),actividad:item.actividad||'Descanso',nota:item.nota||'Sin nota'};}).filter(function(item){return item.fecha&&Number.isFinite(item.energia);}).sort(function(a,b){return a.fecha.localeCompare(b.fecha);});}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?redondear(n,2):null;}
  function promedio(lista,campo){var valores=lista.map(function(item){return item[campo];}).filter(Number.isFinite);if(!valores.length){return 0;}return valores.reduce(function(a,b){return a+b;},0)/valores.length;}
  function redondear(valor,decimales){var factor=Math.pow(10,decimales);return Math.round(valor*factor)/factor;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('prrd-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
