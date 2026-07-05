/* =========================================================
Nombre completo: ajgm-main.js
Ruta o ubicación: src/pantallas/05-ajustes/04-gemini/ajgm-main.js
Función o funciones:
- Cargar configuración demo o configuración guardada localmente.
- Guardar datos de Gemini y prompt base en localStorage.
- Validar estructura básica y mostrar prompts preparados.
Con qué se conecta:
- ajgm-index.html
- ajgm.css
- data/ajgm-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ajgm-config';
  var estado={config:null,prompts:[]};
  var demoFallback={configuracion:{apiKey:'PEGAR_API_KEY_GEMINI',modelo:'PEGAR_MODELO_GEMINI',temperatura:0.4,maxTokens:1200,estado:'Pendiente',ultimaPrueba:'Sin probar',nota:'Configuración demo.'},prompts:[{nombre:'Sistema general',texto:'Eres un asistente para una app personal de bienestar. Da recomendaciones claras, prudentes, breves y sostenibles.'},{nombre:'Recomendaciones',texto:'Analiza progreso, entrenamiento, hidratación, sueño y hábitos.'},{nombre:'Formato de salida',texto:'Devuelve JSON válido con titulo, prioridad, categoria, explicacion y accionSugerida.'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('ajgm-modo-datos');el.resumenEstado=document.getElementById('ajgm-resumen-estado');el.resumenModelo=document.getElementById('ajgm-resumen-modelo');el.resumenTemp=document.getElementById('ajgm-resumen-temp');el.resumenPrueba=document.getElementById('ajgm-resumen-prueba');el.form=document.getElementById('ajgm-form');el.inputApiKey=document.getElementById('ajgm-input-api-key');el.inputModelo=document.getElementById('ajgm-input-modelo');el.inputTemperatura=document.getElementById('ajgm-input-temperatura');el.inputMaxTokens=document.getElementById('ajgm-input-max-tokens');el.inputEstado=document.getElementById('ajgm-input-estado');el.inputPrompt=document.getElementById('ajgm-input-prompt');el.inputNota=document.getElementById('ajgm-input-nota');el.btnProbar=document.getElementById('ajgm-btn-probar');el.btnDemo=document.getElementById('ajgm-btn-restaurar-demo');el.mensaje=document.getElementById('ajgm-mensaje');el.prompts=document.getElementById('ajgm-prompts');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion){estado.config=normalizarConfig(guardado.configuracion);estado.prompts=normalizarPrompts(guardado.prompts||demoFallback.prompts);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ajgm-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.prompts=normalizarPrompts(data.prompts||demoFallback.prompts);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.prompts=normalizarPrompts(demoFallback.prompts);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarConfiguracion();});
    el.btnProbar.addEventListener('click',probarConfiguracionLocal);
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.prompts=normalizarPrompts(demoFallback.prompts);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Configuración demo restaurada.',false);renderizarTodo();});
  }

  function llenarFormulario(){
    var c=estado.config;el.inputApiKey.value=c.apiKey;el.inputModelo.value=c.modelo;el.inputTemperatura.value=c.temperatura;el.inputMaxTokens.value=c.maxTokens;el.inputEstado.value=c.estado;el.inputPrompt.value=estado.prompts.length?estado.prompts[0].texto:'';el.inputNota.value=c.nota;
  }

  function guardarConfiguracion(){
    var config=leerFormulario();
    if(!config.apiKey){mostrarMensaje('Pega la API Key.',true);return;}
    if(!config.modelo){mostrarMensaje('Escribe el modelo que usarás.',true);return;}
    if(config.temperatura<0||config.temperatura>1){mostrarMensaje('La temperatura debe estar entre 0 y 1.',true);return;}
    if(config.maxTokens<200||config.maxTokens>8000){mostrarMensaje('El máximo de tokens debe estar entre 200 y 8000.',true);return;}
    estado.config=config;actualizarPromptBase();guardarLocal();mostrarMensaje('Configuración Gemini guardada.',false);renderizarTodo();
  }

  function probarConfiguracionLocal(){
    var config=leerFormulario();
    if(!config.apiKey||config.apiKey.indexOf('PEGAR_')===0){mostrarMensaje('Primero pega una API Key real.',true);return;}
    if(!config.modelo||config.modelo.indexOf('PEGAR_')===0){mostrarMensaje('Primero escribe el modelo que vas a usar.',true);return;}
    if(!el.inputPrompt.value.trim()){mostrarMensaje('El prompt base no puede quedar vacío.',true);return;}
    config.estado='Probado';config.ultimaPrueba=fechaHoraActual();estado.config=config;el.inputEstado.value='Probado';actualizarPromptBase();guardarLocal();mostrarMensaje('Validación local correcta. La prueba real se hará en el bloque de integración.',false);renderizarTodo();
  }

  function leerFormulario(){return normalizarConfig({apiKey:el.inputApiKey.value.trim(),modelo:el.inputModelo.value.trim(),temperatura:el.inputTemperatura.value,maxTokens:el.inputMaxTokens.value,estado:el.inputEstado.value,ultimaPrueba:estado.config?estado.config.ultimaPrueba:'Sin probar',nota:el.inputNota.value.trim()});}

  function actualizarPromptBase(){
    var texto=el.inputPrompt.value.trim();
    if(!estado.prompts.length){estado.prompts.push({nombre:'Sistema general',texto:texto});return;}
    estado.prompts[0].texto=texto;
  }

  function renderizarTodo(){renderizarResumen();renderizarPrompts();}

  function renderizarResumen(){
    var c=estado.config;el.resumenEstado.textContent=c.estado;el.resumenModelo.textContent=acortar(c.modelo);el.resumenTemp.textContent=String(c.temperatura);el.resumenPrueba.textContent=c.ultimaPrueba||'Sin probar';
  }

  function renderizarPrompts(){
    el.prompts.innerHTML='';estado.prompts.forEach(function(prompt,index){var div=document.createElement('div');div.className='ajgm-prompt-item';div.innerHTML='<span>Prompt '+(index+1)+'</span><strong>'+esc(prompt.nombre)+'</strong><p>'+esc(prompt.texto)+'</p>';el.prompts.appendChild(div);});
  }

  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,prompts:estado.prompts}));el.modo.textContent='Datos locales';}
  function normalizarConfig(c){return{apiKey:c.apiKey||'',modelo:c.modelo||'',temperatura:numero(c.temperatura,0.4),maxTokens:numero(c.maxTokens,1200),estado:c.estado||'Pendiente',ultimaPrueba:c.ultimaPrueba||'Sin probar',nota:c.nota||'Sin nota'};}
  function normalizarPrompts(lista){return lista.map(function(p){return{nombre:p.nombre||'Prompt',texto:p.texto||'Sin texto'};});}
  function numero(valor,defecto){var n=Number(valor);return Number.isFinite(n)?n:defecto;}
  function fechaHoraActual(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function acortar(valor){valor=String(valor||'--');return valor.length>16?valor.slice(0,8)+'...'+valor.slice(-5):valor;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ajgm-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
