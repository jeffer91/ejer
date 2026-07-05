/* =========================================================
Nombre completo: voas-main.js
Ruta o ubicación: src/pantallas/06-voz/01-asistente/voas-main.js
Función o funciones:
- Cargar frases demo e historial guardado localmente.
- Escuchar voz cuando el navegador lo permita o procesar texto manual.
- Interpretar comandos simples y guardar el historial en localStorage.
Con qué se conecta:
- voas-index.html
- voas.css
- data/voas-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-voas-historial';
  var estado={frases:[],historial:[],resultado:null,reconocedor:null,escuchando:false,soportaVoz:false};
  var demoFallback={frases:[{titulo:'Agua',ejemplo:'Registrar 500 ml de agua'},{titulo:'Entrenamiento',ejemplo:'Registrar entrenamiento de piernas con esfuerzo 4'},{titulo:'Energía',ejemplo:'Hoy tengo energía 3'},{titulo:'Nota',ejemplo:'Guardar nota: me sentí bien'}],historial:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();prepararReconocimiento();cargarDatos().then(function(){conectarEventos();procesarTextoInicial();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('voas-modo-datos');el.estado=document.getElementById('voas-estado');el.total=document.getElementById('voas-total-comandos');el.ultimaAccion=document.getElementById('voas-ultima-accion');el.confianza=document.getElementById('voas-confianza');el.input=document.getElementById('voas-input-comando');el.btnEscuchar=document.getElementById('voas-btn-escuchar');el.btnDetener=document.getElementById('voas-btn-detener');el.btnProcesar=document.getElementById('voas-btn-procesar');el.btnGuardar=document.getElementById('voas-btn-guardar');el.btnDemo=document.getElementById('voas-btn-restaurar-demo');el.mensaje=document.getElementById('voas-mensaje');el.resultado=document.getElementById('voas-resultado');el.frases=document.getElementById('voas-frases');
  }

  function prepararReconocimiento(){
    var SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    estado.soportaVoz=Boolean(SpeechRecognition);
    if(!estado.soportaVoz){return;}
    estado.reconocedor=new SpeechRecognition();
    estado.reconocedor.lang='es-ES';
    estado.reconocedor.continuous=false;
    estado.reconocedor.interimResults=false;
    estado.reconocedor.onstart=function(){estado.escuchando=true;mostrarMensaje('Escuchando...',false);renderizarResumen();};
    estado.reconocedor.onend=function(){estado.escuchando=false;renderizarResumen();};
    estado.reconocedor.onerror=function(){estado.escuchando=false;mostrarMensaje('No se pudo usar el micrófono. Puedes escribir el comando manualmente.',true);renderizarResumen();};
    estado.reconocedor.onresult=function(event){var texto=event.results[0][0].transcript||'';el.input.value=texto;estado.resultado=interpretarComando(texto);mostrarMensaje('Texto recibido. Revisa el resultado antes de guardar.',false);renderizarTodo();};
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    return fetch('./data/voas-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.frases=data.frases||demoFallback.frases;estado.historial=guardado&&Array.isArray(guardado.historial)?normalizarHistorial(guardado.historial):normalizarHistorial(data.historial||[]);el.modo.textContent=guardado?'Datos locales':'Modo demo';}).catch(function(){estado.frases=demoFallback.frases;estado.historial=guardado&&Array.isArray(guardado.historial)?normalizarHistorial(guardado.historial):normalizarHistorial(demoFallback.historial);el.modo.textContent=guardado?'Datos locales':'Modo demo interno';});
  }

  function conectarEventos(){
    el.btnEscuchar.addEventListener('click',iniciarEscucha);
    el.btnDetener.addEventListener('click',detenerEscucha);
    el.btnProcesar.addEventListener('click',procesarTextoManual);
    el.btnGuardar.addEventListener('click',guardarResultado);
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.historial=normalizarHistorial(demoFallback.historial);estado.frases=demoFallback.frases;estado.resultado=null;el.input.value='';el.modo.textContent='Modo demo restaurado';mostrarMensaje('Demo restaurado.',false);renderizarTodo();});
  }

  function iniciarEscucha(){
    if(!estado.soportaVoz||!estado.reconocedor){mostrarMensaje('Este navegador no permite reconocimiento de voz aquí. Escribe el comando y presiona Procesar texto.',true);return;}
    try{estado.reconocedor.start();}catch(error){mostrarMensaje('Ya se estaba intentando escuchar. Espera un momento.',true);}
  }

  function detenerEscucha(){
    if(estado.reconocedor&&estado.escuchando){estado.reconocedor.stop();mostrarMensaje('Escucha detenida.',false);}
  }

  function procesarTextoInicial(){
    el.input.value='Registrar 500 ml de agua después de entrenar';
    estado.resultado=interpretarComando(el.input.value);
  }

  function procesarTextoManual(){
    var texto=el.input.value.trim();
    if(!texto){mostrarMensaje('Escribe o dicta un comando primero.',true);return;}
    estado.resultado=interpretarComando(texto);mostrarMensaje('Comando procesado localmente.',false);renderizarTodo();
  }

  function interpretarComando(texto){
    var limpio=String(texto||'').toLowerCase();
    var resultado={fecha:fechaHoraActual(),texto:texto,accion:'Guardar nota',categoria:'Nota',valor:'Texto libre',confianza:'Baja',estado:'Preparado'};
    var numero=(limpio.match(/\b\d+(?:[.,]\d+)?\b/)||[])[0]||'';
    if(limpio.indexOf('agua')>=0||limpio.indexOf('ml')>=0||limpio.indexOf('hidrat')>=0){resultado.accion='Registrar agua';resultado.categoria='Hidratación';resultado.valor=numero?numero.replace(',','.')+' ml':'Cantidad no detectada';resultado.confianza=numero?'Alta':'Media';}
    else if(limpio.indexOf('entren')>=0||limpio.indexOf('rutina')>=0||limpio.indexOf('serie')>=0||limpio.indexOf('hiit')>=0){resultado.accion='Registrar entrenamiento';resultado.categoria='Entrenamiento';resultado.valor=numero?'Esfuerzo '+numero+'/5':'Entrenamiento sin valor';resultado.confianza='Media';}
    else if(limpio.indexOf('energ')>=0){resultado.accion='Registrar energía';resultado.categoria='Progreso';resultado.valor=numero?'Energía '+numero+'/5':'Energía no detectada';resultado.confianza=numero?'Alta':'Media';}
    else if(limpio.indexOf('dorm')>=0||limpio.indexOf('sueño')>=0||limpio.indexOf('sueno')>=0){resultado.accion='Registrar sueño';resultado.categoria='Hábitos';resultado.valor=numero?numero+' horas':'Horas no detectadas';resultado.confianza=numero?'Alta':'Media';}
    else if(limpio.indexOf('nota')>=0||limpio.indexOf('guardar')>=0){resultado.accion='Guardar nota';resultado.categoria='Nota';resultado.valor='Texto libre';resultado.confianza='Media';}
    return resultado;
  }

  function guardarResultado(){
    if(!estado.resultado){mostrarMensaje('Primero procesa un comando.',true);return;}
    estado.historial.unshift(estado.resultado);
    estado.historial=estado.historial.slice(0,30);
    guardarLocal();mostrarMensaje('Comando guardado en historial.',false);renderizarTodo();
  }

  function renderizarTodo(){renderizarResumen();renderizarResultado();renderizarFrases();}

  function renderizarResumen(){
    el.estado.textContent=estado.escuchando?'Escuchando':estado.soportaVoz?'Disponible':'Solo texto';el.total.textContent=String(estado.historial.length);el.ultimaAccion.textContent=estado.resultado?estado.resultado.accion:'--';el.confianza.textContent=estado.resultado?estado.resultado.confianza:'--';
  }

  function renderizarResultado(){
    var r=estado.resultado||{fecha:'--',texto:'Sin comando procesado',accion:'--',categoria:'--',valor:'--',confianza:'--',estado:'--'};
    var items=[['Acción',r.accion],['Categoría',r.categoria],['Valor detectado',r.valor],['Confianza',r.confianza],['Texto',r.texto]];
    el.resultado.innerHTML='';items.forEach(function(item){var div=document.createElement('div');div.className='voas-result-item';div.innerHTML='<span>'+esc(item[0])+'</span><strong>'+esc(item[1])+'</strong>';el.resultado.appendChild(div);});
  }

  function renderizarFrases(){
    el.frases.innerHTML='';estado.frases.forEach(function(frase){var div=document.createElement('button');div.type='button';div.className='voas-phrase';div.innerHTML='<strong>'+esc(frase.titulo)+'</strong>'+esc(frase.ejemplo);div.addEventListener('click',function(){el.input.value=frase.ejemplo;estado.resultado=interpretarComando(frase.ejemplo);mostrarMensaje('Ejemplo cargado y procesado.',false);renderizarTodo();});el.frases.appendChild(div);});
  }

  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({historial:estado.historial}));el.modo.textContent='Datos locales';}
  function normalizarHistorial(lista){return lista.map(function(i){return{fecha:i.fecha||fechaHoraActual(),texto:i.texto||'',accion:i.accion||'Guardar nota',categoria:i.categoria||'Nota',valor:i.valor||'Texto libre',confianza:i.confianza||'Media',estado:i.estado||'Preparado'};});}
  function fechaHoraActual(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('voas-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
