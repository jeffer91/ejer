/* =========================================================
Nombre completo: ajfb-main.js
Ruta o ubicación: src/pantallas/05-ajustes/03-firebase/ajfb-main.js
Función o funciones:
- Cargar y guardar configuración local de Firebase.
- Probar respaldo alterno usando servicios compartidos.
- Respaldar datos locales importantes.
Con qué se conecta:
- ajfb-index.html
- ajfb.css
- data/ajfb-demo-data.json
- ../../../shared/integraciones/firebase/fit-fb-schema.js
- ../../../shared/integraciones/firebase/fit-fb-client.service.js
- ../../../shared/integraciones/firebase/fit-fb-sync.service.js
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ajfb-config';
  var estado={config:null,colecciones:[]};
  var demoFallback={configuracion:{apiKey:'PEGAR_API_KEY',authDomain:'mi-proyecto.firebaseapp.com',projectId:'mi-proyecto',storageBucket:'mi-proyecto.appspot.com',appId:'1:000000000:web:000000000',modoSync:'Después de Google Sheets',estado:'Pendiente',ultimaPrueba:'Sin probar',nota:'Firebase funcionará como respaldo alterno.'},colecciones:[{nombre:'perfil',descripcion:'Copia de perfil.'},{nombre:'registrosDiarios',descripcion:'Registros importantes.'},{nombre:'entrenamientos',descripcion:'Sesiones y series.'},{nombre:'hidratacion',descripcion:'Agua diaria.'},{nombre:'recomendaciones',descripcion:'Acciones sugeridas.'},{nombre:'syncPendiente',descripcion:'Cambios pendientes.'},{nombre:'syncLog',descripcion:'Historial de sincronización.'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);
  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();});}
  function capturarElementos(){
    el.modo=document.getElementById('ajfb-modo-datos');el.resumenEstado=document.getElementById('ajfb-resumen-estado');el.resumenProyecto=document.getElementById('ajfb-resumen-proyecto');el.resumenColecciones=document.getElementById('ajfb-resumen-colecciones');el.resumenPrueba=document.getElementById('ajfb-resumen-prueba');el.form=document.getElementById('ajfb-form');el.inputApiKey=document.getElementById('ajfb-input-api-key');el.inputAuthDomain=document.getElementById('ajfb-input-auth-domain');el.inputProjectId=document.getElementById('ajfb-input-project-id');el.inputStorage=document.getElementById('ajfb-input-storage');el.inputAppId=document.getElementById('ajfb-input-app-id');el.inputModoSync=document.getElementById('ajfb-input-modo-sync');el.inputEstado=document.getElementById('ajfb-input-estado');el.inputNota=document.getElementById('ajfb-input-nota');el.btnProbar=document.getElementById('ajfb-btn-probar');el.btnConexion=document.getElementById('ajfb-btn-conexion');el.btnSincronizar=document.getElementById('ajfb-btn-sincronizar');el.btnDemo=document.getElementById('ajfb-btn-restaurar-demo');el.mensaje=document.getElementById('ajfb-mensaje');el.colecciones=document.getElementById('ajfb-colecciones');
  }
  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.configuracion){estado.config=normalizarConfig(guardado.configuracion);estado.colecciones=normalizarColecciones(guardado.colecciones||demoFallback.colecciones);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ajfb-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.config=normalizarConfig(data.configuracion||demoFallback.configuracion);estado.colecciones=normalizarColecciones(data.colecciones||demoFallback.colecciones);el.modo.textContent='Modo demo';}).catch(function(){estado.config=normalizarConfig(demoFallback.configuracion);estado.colecciones=normalizarColecciones(demoFallback.colecciones);el.modo.textContent='Modo demo interno';});
  }
  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarConfiguracion();});
    el.btnProbar.addEventListener('click',probarConfiguracionLocal);
    el.btnConexion.addEventListener('click',probarRespaldo);
    el.btnSincronizar.addEventListener('click',respaldarAhora);
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.config=normalizarConfig(demoFallback.configuracion);estado.colecciones=normalizarColecciones(demoFallback.colecciones);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Configuración demo restaurada.',false);renderizarTodo();});
  }
  function llenarFormulario(){var c=estado.config;el.inputApiKey.value=c.apiKey;el.inputAuthDomain.value=c.authDomain;el.inputProjectId.value=c.projectId;el.inputStorage.value=c.storageBucket;el.inputAppId.value=c.appId;el.inputModoSync.value=c.modoSync;el.inputEstado.value=c.estado;el.inputNota.value=c.nota;}
  function leerFormulario(){return normalizarConfig({apiKey:el.inputApiKey.value.trim(),authDomain:el.inputAuthDomain.value.trim(),projectId:el.inputProjectId.value.trim(),storageBucket:el.inputStorage.value.trim(),appId:el.inputAppId.value.trim(),modoSync:el.inputModoSync.value,estado:el.inputEstado.value,ultimaPrueba:estado.config?estado.config.ultimaPrueba:'Sin probar',nota:el.inputNota.value.trim()});}
  function validar(config){if(!config.apiKey||config.apiKey.indexOf('PEGAR_')===0){mostrarMensaje('Pega la API Key real.',true);return false;}if(!config.authDomain){mostrarMensaje('Pega el Auth Domain.',true);return false;}if(!config.projectId){mostrarMensaje('Pega el Project ID.',true);return false;}return true;}
  function guardarConfiguracion(){var config=leerFormulario();if(!validar(config)){return;}estado.config=config;guardarLocal();mostrarMensaje('Configuración Firebase guardada.',false);renderizarTodo();}
  function probarConfiguracionLocal(){var config=leerFormulario();if(!validar(config)){return;}config.estado='Configurado';config.ultimaPrueba=fechaHoraActual();estado.config=config;el.inputEstado.value='Configurado';guardarLocal();mostrarMensaje('Validación local correcta.',false);renderizarTodo();}
  function probarRespaldo(){var config=leerFormulario();if(!validar(config)){return;}bloquear(true,'Probando respaldo...');window.FitFirebaseClient.ping(config).then(function(res){config.estado=res.ok?'Probado':'Configurado';config.ultimaPrueba=fechaHoraActual();estado.config=config;el.inputEstado.value=config.estado;guardarLocal();mostrarMensaje(res.message||'Firebase listo.',!res.ok);renderizarTodo();}).catch(function(error){mostrarMensaje('No se pudo probar Firebase: '+error.message,true);}).finally(function(){bloquear(false);});}
  function respaldarAhora(){var config=leerFormulario();if(!validar(config)){return;}guardarConfiguracion();if(!window.FitFirebaseSync){mostrarMensaje('Servicio Firebase no cargado.',true);return;}bloquear(true,'Preparando respaldo...');window.FitFirebaseSync.syncNow().then(function(res){mostrarMensaje((res.message||'Respaldo enviado.')+' Lotes: '+(res.batches||0),false);}).catch(function(error){mostrarMensaje('No se pudo respaldar: '+error.message,true);}).finally(function(){bloquear(false);});}
  function renderizarTodo(){renderizarResumen();renderizarColecciones();}
  function renderizarResumen(){var c=estado.config;el.resumenEstado.textContent=c.estado;el.resumenProyecto.textContent=acortar(c.projectId);el.resumenColecciones.textContent=String(estado.colecciones.length);el.resumenPrueba.textContent=c.ultimaPrueba||'Sin probar';}
  function renderizarColecciones(){el.colecciones.innerHTML='';estado.colecciones.forEach(function(col,index){var div=document.createElement('div');div.className='ajfb-collection-item';div.innerHTML='<span>Colección '+(index+1)+'</span><strong>'+esc(col.nombre)+'</strong><p>'+esc(col.descripcion)+'</p>';el.colecciones.appendChild(div);});}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({configuracion:estado.config,colecciones:estado.colecciones}));el.modo.textContent='Datos locales';}
  function bloquear(active,text){[el.btnConexion,el.btnSincronizar].forEach(function(btn){btn.disabled=active;});if(text){mostrarMensaje(text,false);}}
  function normalizarConfig(c){return{apiKey:c.apiKey||'',authDomain:c.authDomain||'',projectId:c.projectId||'',storageBucket:c.storageBucket||'',appId:c.appId||'',modoSync:c.modoSync||'Después de Google Sheets',estado:c.estado||'Pendiente',ultimaPrueba:c.ultimaPrueba||'Sin probar',nota:c.nota||'Sin nota'};}
  function normalizarColecciones(lista){return lista.map(function(c){return{nombre:c.nombre||'coleccion',descripcion:c.descripcion||'Sin descripción'};});}
  function fechaHoraActual(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function acortar(valor){valor=String(valor||'--');return valor.length>14?valor.slice(0,7)+'...'+valor.slice(-4):valor;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ajfb-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
