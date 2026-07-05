/* =========================================================
Nombre completo: ajgs-main.js
Ruta o ubicación: src/pantallas/05-ajustes/02-google-sheets/ajgs-main.js
Función o funciones:
- Cargar y guardar configuración local de Google Sheets.
- Probar conexión real con Apps Script.
- Crear tablas y sincronizar datos locales usando servicios compartidos.
Con qué se conecta:
- ajgs-index.html
- ajgs.css
- data/ajgs-demo-data.json
- ../../../shared/integraciones/google-sheets/fit-gs-schema.js
- ../../../shared/integraciones/google-sheets/fit-gs-client.service.js
- ../../../shared/integraciones/google-sheets/fit-gs-sync.service.js
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ajgs-config';
  var estado={config:null,tablas:[]};
  var demoFallback={configuracion:{spreadsheetId:'PEGAR_ID_DE_GOOGLE_SHEETS',webAppUrl:'https://script.google.com/macros/s/PEGAR_ID_DEPLOYMENT/exec',modoSync:'Manual',estado:'Pendiente',ultimaPrueba:'Sin probar',nota:'Configuración demo.'},tablas:[{nombre:'Perfil',descripcion:'Datos generales.'},{nombre:'RegistrosDiarios',descripcion:'Registros diarios.'},{nombre:'Entrenamientos',descripcion:'Sesiones y series.'},{nombre:'Hidratacion',descripcion:'Agua diaria.'},{nombre:'Recomendaciones',descripcion:'Acciones sugeridas.'},{nombre:'SyncLog',descripcion:'Historial de sincronización.'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);
  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('ajgs-modo-datos');el.resumenEstado=document.getElementById('ajgs-resumen-estado');el.resumenSheet=document.getElementById('ajgs-resumen-sheet');el.resumenTablas=document.getElementById('ajgs-resumen-tablas');el.resumenPrueba=document.getElementById('ajgs-resumen-prueba');el.form=document.getElementById('ajgs-form');el.inputSheetId=document.getElementById('ajgs-input-sheet-id');el.inputWebapp=document.getElementById('ajgs-input-webapp');el.inputModoSync=document.getElementById('ajgs-input-modo-sync');el.inputEstado=document.getElementById('ajgs-input-estado');el.inputNota=document.getElementById('ajgs-input-nota');el.btnProbar=document.getElementById('ajgs-btn-probar');el.btnConexion=document.getElementById('ajgs-btn-conexion-real');el.btnCrearTablas=document.getElementById('ajgs-btn-crear-tablas');el.btnSincronizar=document.getElementById('ajgs-btn-sincronizar');el.btnDemo=document.getElementById('ajgs-btn-restaurar-demo');el.mensaje=document.getElementById('ajgs-mensaje');el.tablas=document.getElementById('ajgs-tablas');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion){estado.config=normalizarConfig(guardado.configuracion);estado.tablas=normalizarTablas(guardado.tablas||demoFallback.tablas);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ajgs-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.tablas=normalizarTablas(data.tablas||demoFallback.tablas);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.tablas=normalizarTablas(demoFallback.tablas);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarConfiguracion();});
    el.btnProbar.addEventListener('click',probarConfiguracionLocal);
    el.btnConexion.addEventListener('click',probarConexionReal);
    el.btnCrearTablas.addEventListener('click',crearTablasReales);
    el.btnSincronizar.addEventListener('click',sincronizarAhora);
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.tablas=normalizarTablas(demoFallback.tablas);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Configuración demo restaurada.',false);renderizarTodo();});
  }

  function llenarFormulario(){var c=estado.config;el.inputSheetId.value=c.spreadsheetId;el.inputWebapp.value=c.webAppUrl;el.inputModoSync.value=c.modoSync;el.inputEstado.value=c.estado;el.inputNota.value=c.nota;}
  function leerFormulario(){return normalizarConfig({spreadsheetId:el.inputSheetId.value.trim(),webAppUrl:el.inputWebapp.value.trim(),modoSync:el.inputModoSync.value,estado:el.inputEstado.value,ultimaPrueba:estado.config?estado.config.ultimaPrueba:'Sin probar',nota:el.inputNota.value.trim()});}
  function guardarConfiguracion(){var config=leerFormulario();if(!validar(config)){return;}estado.config=config;guardarLocal();mostrarMensaje('Configuración guardada correctamente.',false);renderizarTodo();}
  function validar(config){if(!config.spreadsheetId||config.spreadsheetId.indexOf('PEGAR_')===0){mostrarMensaje('Pega el Spreadsheet ID real.',true);return false;}if(!config.webAppUrl||config.webAppUrl.indexOf('https://script.google.com/macros/s/')!==0){mostrarMensaje('Pega una URL válida de Apps Script Web App.',true);return false;}return true;}

  function probarConfiguracionLocal(){var config=leerFormulario();if(!validar(config)){return;}config.estado='Configurado';config.ultimaPrueba=fechaHoraActual();estado.config=config;el.inputEstado.value='Configurado';guardarLocal();mostrarMensaje('Validación local correcta.',false);renderizarTodo();}

  function probarConexionReal(){
    var config=leerFormulario();if(!validar(config)){return;}guardarConfiguracion();bloquear(true,'Probando conexión real...');
    window.FitGoogleSheetsClient.ping(config.webAppUrl).then(function(res){config.estado='Probado';config.ultimaPrueba=fechaHoraActual();estado.config=config;el.inputEstado.value='Probado';guardarLocal();mostrarMensaje(res.message||'Conexión real correcta.',false);renderizarTodo();}).catch(function(error){mostrarMensaje('Error de conexión: '+error.message,true);}).finally(function(){bloquear(false);});
  }

  function crearTablasReales(){
    var config=leerFormulario();if(!validar(config)){return;}bloquear(true,'Creando tablas...');
    var tables=window.FitGoogleSheetsSchema?window.FitGoogleSheetsSchema.getTables():{};
    window.FitGoogleSheetsClient.setup(config.webAppUrl,tables).then(function(res){mostrarMensaje(res.message||'Tablas creadas o verificadas.',false);}).catch(function(error){mostrarMensaje('No se pudieron crear tablas: '+error.message,true);}).finally(function(){bloquear(false);});
  }

  function sincronizarAhora(){
    if(!window.FitGoogleSheetsSync){mostrarMensaje('Servicio de sincronización no cargado.',true);return;}
    var config=leerFormulario();if(!validar(config)){return;}guardarConfiguracion();bloquear(true,'Sincronizando datos locales...');
    window.FitGoogleSheetsSync.syncNow().then(function(res){mostrarMensaje((res.message||'Sincronización enviada.')+' Lotes: '+(res.batches||0),false);}).catch(function(error){mostrarMensaje('No se pudo sincronizar: '+error.message,true);}).finally(function(){bloquear(false);});
  }

  function renderizarTodo(){renderizarResumen();renderizarTablas();}
  function renderizarResumen(){var c=estado.config;el.resumenEstado.textContent=c.estado;el.resumenSheet.textContent=acortar(c.spreadsheetId);el.resumenTablas.textContent=String(estado.tablas.length);el.resumenPrueba.textContent=c.ultimaPrueba||'Sin probar';}
  function renderizarTablas(){el.tablas.innerHTML='';estado.tablas.forEach(function(tabla,index){var div=document.createElement('div');div.className='ajgs-table-item';div.innerHTML='<span>Tabla '+(index+1)+'</span><strong>'+esc(tabla.nombre)+'</strong><p>'+esc(tabla.descripcion)+'</p>';el.tablas.appendChild(div);});}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,tablas:estado.tablas}));el.modo.textContent='Datos locales';}
  function bloquear(estadoBloqueo,texto){[el.btnConexion,el.btnCrearTablas,el.btnSincronizar].forEach(function(btn){btn.disabled=estadoBloqueo;});if(texto){mostrarMensaje(texto,false);}}
  function normalizarConfig(c){return{spreadsheetId:c.spreadsheetId||'',webAppUrl:c.webAppUrl||'',modoSync:c.modoSync||'Manual',estado:c.estado||'Pendiente',ultimaPrueba:c.ultimaPrueba||'Sin probar',nota:c.nota||'Sin nota'};}
  function normalizarTablas(tablas){return tablas.map(function(t){return{nombre:t.nombre||'Tabla',descripcion:t.descripcion||'Sin descripción'};});}
  function fechaHoraActual(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function acortar(valor){valor=String(valor||'--');return valor.length>12?valor.slice(0,6)+'...'+valor.slice(-4):valor;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ajgs-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
