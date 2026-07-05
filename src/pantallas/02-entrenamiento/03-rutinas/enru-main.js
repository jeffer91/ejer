/* =========================================================
Nombre completo: enru-main.js
Ruta o ubicación: src/pantallas/02-entrenamiento/03-rutinas/enru-main.js
Función o funciones:
- Cargar planificación semanal demo o datos guardados localmente.
- Editar días de rutina, HIIT, caminata, movilidad o descanso.
- Mostrar resumen, calendario semanal y rutinas base.
Con qué se conecta:
- enru-index.html
- enru.css
- data/enru-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-enru-plan';
  var DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var estado={semana:'Semana demo',dias:[],rutinasBase:[],diaActivo:'Lunes'};
  var demoFallback={semana:'Semana demo',dias:[{dia:'Lunes',tipo:'Entrenamiento',enfoque:'Tren superior',duracionMin:50,nota:'Fuerza controlada.'},{dia:'Martes',tipo:'Caminata',enfoque:'Movimiento suave',duracionMin:35,nota:'Día liviano.'},{dia:'Miércoles',tipo:'Entrenamiento',enfoque:'Piernas y core',duracionMin:50,nota:'Sin sobrecarga.'},{dia:'Jueves',tipo:'Descanso',enfoque:'Recuperación',duracionMin:0,nota:'Dormir mejor.'},{dia:'Viernes',tipo:'Entrenamiento',enfoque:'Tren superior mixto',duracionMin:45,nota:'Moderado.'},{dia:'Sábado',tipo:'HIIT',enfoque:'Intervalos controlados',duracionMin:18,nota:'Descansos completos.'},{dia:'Domingo',tipo:'Descanso',enfoque:'Recuperación total',duracionMin:0,nota:'Revisión semanal.'}],rutinasBase:[{nombre:'Tren superior',descripcion:'Rutina de empuje y espalda.',ejercicios:['Press de banca','Remo','Press de hombro','Plancha']}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarSelectorDias();cargarDiaEnFormulario(estado.diaActivo);renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('enru-modo-datos');el.semana=document.getElementById('enru-semana');el.totalEntrenos=document.getElementById('enru-total-entrenos');el.totalHiit=document.getElementById('enru-total-hiit');el.totalDescanso=document.getElementById('enru-total-descanso');el.calendario=document.getElementById('enru-calendario');el.form=document.getElementById('enru-form');el.inputDia=document.getElementById('enru-input-dia');el.inputTipo=document.getElementById('enru-input-tipo');el.inputEnfoque=document.getElementById('enru-input-enfoque');el.inputDuracion=document.getElementById('enru-input-duracion');el.inputNota=document.getElementById('enru-input-nota');el.btnDemo=document.getElementById('enru-btn-restaurar-demo');el.mensaje=document.getElementById('enru-mensaje');el.rutinas=document.getElementById('enru-rutinas-base');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&Array.isArray(guardado.dias)){estado.semana=guardado.semana||'Semana actual';estado.dias=normalizarDias(guardado.dias);estado.rutinasBase=normalizarRutinas(guardado.rutinasBase||[]);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/enru-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.semana=data.semana||'Semana demo';estado.dias=normalizarDias(data.dias||[]);estado.rutinasBase=normalizarRutinas(data.rutinasBase||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.semana=demoFallback.semana;estado.dias=normalizarDias(demoFallback.dias);estado.rutinasBase=normalizarRutinas(demoFallback.rutinasBase);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarDia();});
    el.inputDia.addEventListener('change',function(){estado.diaActivo=el.inputDia.value;cargarDiaEnFormulario(estado.diaActivo);renderizarCalendario();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.semana=demoFallback.semana;estado.dias=normalizarDias(demoFallback.dias);estado.rutinasBase=normalizarRutinas(demoFallback.rutinasBase);estado.diaActivo='Lunes';llenarSelectorDias();cargarDiaEnFormulario(estado.diaActivo);el.modo.textContent='Modo demo restaurado';mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
  }

  function llenarSelectorDias(){
    el.inputDia.innerHTML='';DIAS.forEach(function(dia){var option=document.createElement('option');option.value=dia;option.textContent=dia;el.inputDia.appendChild(option);});el.inputDia.value=estado.diaActivo;
  }

  function guardarDia(){
    var registro={dia:el.inputDia.value,tipo:el.inputTipo.value,enfoque:el.inputEnfoque.value.trim(),duracionMin:numero(el.inputDuracion.value)||0,nota:el.inputNota.value.trim()||'Sin nota'};
    if(!registro.dia){mostrarMensaje('Selecciona un día.',true);return;}
    if(!registro.enfoque){mostrarMensaje('Escribe el enfoque del día.',true);return;}
    estado.dias=estado.dias.filter(function(item){return item.dia!==registro.dia;});estado.dias.push(registro);estado.dias=normalizarDias(estado.dias);estado.diaActivo=registro.dia;guardarLocal();mostrarMensaje('Día guardado correctamente.',false);renderizarTodo();
  }

  function cargarDiaEnFormulario(dia){
    var registro=buscarDia(dia)||{dia:dia,tipo:'Descanso',enfoque:'Recuperación',duracionMin:0,nota:''};
    el.inputDia.value=registro.dia;el.inputTipo.value=registro.tipo;el.inputEnfoque.value=registro.enfoque;el.inputDuracion.value=registro.duracionMin||'';el.inputNota.value=registro.nota||'';
  }

  function renderizarTodo(){renderizarResumen();renderizarCalendario();renderizarRutinas();}

  function renderizarResumen(){
    el.semana.textContent=estado.semana;el.totalEntrenos.textContent=String(contarTipo('Entrenamiento'));el.totalHiit.textContent=String(contarTipo('HIIT'));el.totalDescanso.textContent=String(contarTipo('Descanso'));
  }

  function renderizarCalendario(){
    el.calendario.innerHTML='';DIAS.forEach(function(dia){var item=buscarDia(dia)||{dia:dia,tipo:'Descanso',enfoque:'Sin plan',duracionMin:0,nota:'Sin nota'};var card=document.createElement('article');card.className='enru-day'+(dia===estado.diaActivo?' enru-day-active':'');card.setAttribute('tabindex','0');card.innerHTML='<h3>'+esc(dia)+'</h3><p><span class="enru-pill">'+esc(item.tipo)+'</span></p><p><strong>'+esc(item.enfoque)+'</strong></p><p>'+esc(item.duracionMin?item.duracionMin+' min':'Sin duración')+'</p><p>'+esc(item.nota||'Sin nota')+'</p>';card.addEventListener('click',function(){estado.diaActivo=dia;cargarDiaEnFormulario(dia);renderizarCalendario();});card.addEventListener('keydown',function(event){if(event.key==='Enter'){estado.diaActivo=dia;cargarDiaEnFormulario(dia);renderizarCalendario();}});el.calendario.appendChild(card);});
  }

  function renderizarRutinas(){
    el.rutinas.innerHTML='';estado.rutinasBase.forEach(function(rutina){var card=document.createElement('article');card.className='enru-routine';var items=(rutina.ejercicios||[]).map(function(e){return'<li>'+esc(e)+'</li>';}).join('');card.innerHTML='<h3>'+esc(rutina.nombre)+'</h3><p>'+esc(rutina.descripcion||'Sin descripción')+'</p><ul>'+items+'</ul>';el.rutinas.appendChild(card);});
  }

  function buscarDia(dia){return estado.dias.find(function(item){return item.dia===dia;});}
  function contarTipo(tipo){return estado.dias.filter(function(item){return item.tipo===tipo;}).length;}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({semana:estado.semana,dias:estado.dias,rutinasBase:estado.rutinasBase}));el.modo.textContent='Datos locales';}
  function normalizarDias(dias){var mapa={};dias.forEach(function(item){if(item&&item.dia){mapa[item.dia]={dia:item.dia,tipo:item.tipo||'Descanso',enfoque:item.enfoque||'Sin plan',duracionMin:numero(item.duracionMin)||0,nota:item.nota||'Sin nota'};}});return DIAS.map(function(dia){return mapa[dia]||{dia:dia,tipo:'Descanso',enfoque:'Recuperación',duracionMin:0,nota:'Sin nota'};});}
  function normalizarRutinas(rutinas){return rutinas.map(function(item){return{nombre:item.nombre||'Rutina',descripcion:item.descripcion||'Sin descripción',ejercicios:Array.isArray(item.ejercicios)?item.ejercicios:[]};});}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?n:null;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('enru-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
