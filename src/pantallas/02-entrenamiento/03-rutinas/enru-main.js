/* =========================================================
Nombre completo: enru-main.js
Ruta o ubicación: src/pantallas/02-entrenamiento/03-rutinas/enru-main.js
Función o funciones:
- Cargar planificación semanal guardada localmente.
- Mostrar calendario semanal de ancho completo.
- Importar rutinas rápidas desde texto estructurado.
- Dividir rutinas en calentamiento, ejercicios, cierre y notas.
Con qué se conecta:
- enru-index.html
- enru.css
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-enru-plan';
  var DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var estado={semana:'Semana actual',dias:[],diaActivo:'Lunes'};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){
    capturarElementos();
    cargarDatos();
    conectarEventos();
    llenarSelectorDias();
    renderizarTodo();
  }

  function capturarElementos(){
    el.semana=document.getElementById('enru-semana');
    el.totalEntrenos=document.getElementById('enru-total-entrenos');
    el.totalHiit=document.getElementById('enru-total-hiit');
    el.totalDescanso=document.getElementById('enru-total-descanso');
    el.calendario=document.getElementById('enru-calendario');
    el.form=document.getElementById('enru-form');
    el.inputDia=document.getElementById('enru-input-dia');
    el.inputRutina=document.getElementById('enru-input-rutina');
    el.btnLimpiarDia=document.getElementById('enru-btn-limpiar-dia');
    el.mensaje=document.getElementById('enru-mensaje');
    el.rutinas=document.getElementById('enru-rutinas-base');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    estado.semana=guardado&&guardado.semana?guardado.semana:'Semana actual';
    estado.dias=normalizarDias(guardado&&Array.isArray(guardado.dias)?guardado.dias:[]);
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){
      event.preventDefault();
      cargarRutinaRapida();
    });
    el.inputDia.addEventListener('change',function(){
      estado.diaActivo=el.inputDia.value;
      cargarTextoDelDia(estado.diaActivo);
      renderizarCalendario();
    });
    el.btnLimpiarDia.addEventListener('click',function(){
      limpiarDiaActual();
    });
  }

  function llenarSelectorDias(){
    el.inputDia.innerHTML='';
    DIAS.forEach(function(dia){
      var option=document.createElement('option');
      option.value=dia;
      option.textContent=dia;
      el.inputDia.appendChild(option);
    });
    el.inputDia.value=estado.diaActivo;
    cargarTextoDelDia(estado.diaActivo);
  }

  function cargarRutinaRapida(){
    var texto=el.inputRutina.value.trim();
    if(!texto){mostrarMensaje('Pega una rutina usando el formato indicado.',true);return;}
    var rutina=parsearRutina(texto);
    var dia=rutina.dia||el.inputDia.value||estado.diaActivo;
    if(DIAS.indexOf(dia)===-1){mostrarMensaje('El día no es válido. Usa Lunes, Martes, Miércoles, Jueves, Viernes, Sábado o Domingo.',true);return;}
    if(!rutina.nombre){mostrarMensaje('La rutina necesita una línea Nombre.',true);return;}
    rutina.dia=dia;
    estado.diaActivo=dia;
    estado.dias=estado.dias.filter(function(item){return item.dia!==dia;});
    estado.dias.push(rutina);
    estado.dias=normalizarDias(estado.dias);
    el.inputDia.value=dia;
    guardarLocal();
    mostrarMensaje('Rutina cargada correctamente en '+dia+'.',false);
    renderizarTodo();
  }

  function limpiarDiaActual(){
    var dia=el.inputDia.value||estado.diaActivo;
    estado.diaActivo=dia;
    estado.dias=estado.dias.filter(function(item){return item.dia!==dia;});
    estado.dias=normalizarDias(estado.dias);
    el.inputRutina.value='';
    guardarLocal();
    mostrarMensaje('Día limpiado correctamente.',false);
    renderizarTodo();
  }

  function cargarTextoDelDia(dia){
    var registro=buscarDia(dia);
    el.inputRutina.value=registro&&registro.rutinaCargada?formatearRutinaParaTexto(registro):'';
  }

  function parsearRutina(texto){
    var rutina={dia:'',nombre:'',tipo:'Entrenamiento',duracionMin:0,calentamiento:[],ejercicios:[],cierre:[],notas:[],rutinaCargada:true};
    var seccion='';
    texto.split(/\r?\n/).forEach(function(lineaOriginal){
      var linea=lineaOriginal.trim();
      if(!linea){return;}
      var etiqueta=leerEtiqueta(linea);
      if(etiqueta){
        asignarEtiqueta(rutina,etiqueta.clave,etiqueta.valor);
        seccion=etiqueta.esSeccion?etiqueta.clave:seccion;
        return;
      }
      if(linea.charAt(0)==='-'){
        agregarItemSeccion(rutina,seccion,linea.slice(1).trim());
        return;
      }
      if(seccion==='notas'){
        rutina.notas.push(linea);
      }
    });
    if(!rutina.duracionMin){
      rutina.duracionMin=estimarDuracion(rutina);
    }
    return rutina;
  }

  function leerEtiqueta(linea){
    var partes=linea.split(':');
    if(partes.length<2){return null;}
    var clave=normalizarClave(partes.shift());
    var valor=partes.join(':').trim();
    var secciones=['calentamiento','ejercicios','cierre','notas'];
    if(secciones.indexOf(clave)!==-1){return{clave:clave,valor:valor,esSeccion:true};}
    if(['dia','nombre','tipo','duracion'].indexOf(clave)!==-1){return{clave:clave,valor:valor,esSeccion:false};}
    return null;
  }

  function normalizarClave(clave){
    return String(clave).trim().toLowerCase()
      .replace('día','dia')
      .replace('duración','duracion')
      .replace('vuelta a la calma','cierre')
      .replace('enfriamiento','cierre');
  }

  function asignarEtiqueta(rutina,clave,valor){
    if(clave==='dia'){rutina.dia=normalizarDia(valor);}
    if(clave==='nombre'){rutina.nombre=valor;}
    if(clave==='tipo'){rutina.tipo=valor||'Entrenamiento';}
    if(clave==='duracion'){rutina.duracionMin=numero(String(valor).replace(/[^0-9.]/g,''))||0;}
  }

  function agregarItemSeccion(rutina,seccion,texto){
    if(seccion==='calentamiento'){rutina.calentamiento.push(parsearActividad(texto));return;}
    if(seccion==='ejercicios'){rutina.ejercicios.push(parsearEjercicio(texto));return;}
    if(seccion==='cierre'){rutina.cierre.push(parsearActividad(texto));return;}
    if(seccion==='notas'){rutina.notas.push(texto);}
  }

  function parsearActividad(texto){
    var partes=texto.split('|').map(limpiarTexto).filter(Boolean);
    return{nombre:partes[0]||texto,duracion:partes[1]||''};
  }

  function parsearEjercicio(texto){
    var partes=texto.split('|').map(limpiarTexto).filter(Boolean);
    return{nombre:partes[0]||texto,series:partes[1]||'',descanso:partes[2]||''};
  }

  function renderizarTodo(){
    renderizarResumen();
    renderizarCalendario();
    renderizarRutinas();
  }

  function renderizarResumen(){
    el.semana.textContent=estado.semana;
    el.totalEntrenos.textContent=String(contarTipo('Entrenamiento'));
    el.totalHiit.textContent=String(contarTipo('HIIT'));
    el.totalDescanso.textContent=String(contarTipo('Descanso'));
  }

  function renderizarCalendario(){
    el.calendario.innerHTML='';
    DIAS.forEach(function(dia){
      var item=buscarDia(dia)||crearDiaVacio(dia);
      var card=document.createElement('article');
      card.className='enru-day'+(dia===estado.diaActivo?' enru-day-active':'');
      card.setAttribute('tabindex','0');
      card.innerHTML=crearHtmlDia(item);
      card.addEventListener('click',function(){seleccionarDia(dia);});
      card.addEventListener('keydown',function(event){if(event.key==='Enter'){seleccionarDia(dia);}});
      el.calendario.appendChild(card);
    });
  }

  function crearHtmlDia(item){
    var tieneRutina=Boolean(item.rutinaCargada);
    var nombre=tieneRutina?item.nombre:'Sin rutina';
    var tipo=tieneRutina?item.tipo:'Libre';
    var duracion=tieneRutina&&item.duracionMin?item.duracionMin+' min':'Sin duración';
    var ejercicios=tieneRutina&&item.ejercicios.length?'<ol>'+item.ejercicios.slice(0,4).map(function(e){return'<li>'+esc(e.nombre)+' <span>'+esc(e.series||'')+'</span></li>';}).join('')+'</ol>':'<p class="enru-empty">Clic para cargar.</p>';
    return '<h3>'+esc(item.dia)+'</h3><p><span class="enru-pill">'+esc(tipo)+'</span></p><p><strong>'+esc(nombre)+'</strong></p><p class="enru-duration">'+esc(duracion)+'</p>'+ejercicios;
  }

  function seleccionarDia(dia){
    estado.diaActivo=dia;
    el.inputDia.value=dia;
    cargarTextoDelDia(dia);
    renderizarCalendario();
  }

  function renderizarRutinas(){
    el.rutinas.innerHTML='';
    var cargadas=estado.dias.filter(function(item){return item.rutinaCargada;});
    if(!cargadas.length){
      el.rutinas.innerHTML='<p class="enru-empty-wide">Todavía no hay rutinas cargadas. Usa el formato rápido para crear la primera.</p>';
      return;
    }
    cargadas.forEach(function(rutina){
      var card=document.createElement('article');
      card.className='enru-routine';
      card.innerHTML='<h3>'+esc(rutina.dia+' · '+rutina.nombre)+'</h3><p>'+esc(rutina.tipo+' · '+(rutina.duracionMin||0)+' min')+'</p>'+crearBloque('Calentamiento',rutina.calentamiento,'actividad')+crearBloque('Ejercicios',rutina.ejercicios,'ejercicio')+crearBloque('Cierre',rutina.cierre,'actividad')+crearNotas(rutina.notas);
      el.rutinas.appendChild(card);
    });
  }

  function crearBloque(titulo,items,tipo){
    if(!items||!items.length){return '';}
    var lis=items.map(function(item){
      if(tipo==='ejercicio'){
        return '<li><strong>'+esc(item.nombre)+'</strong> '+esc(item.series||'')+' '+esc(item.descanso||'')+'</li>';
      }
      return '<li><strong>'+esc(item.nombre)+'</strong> '+esc(item.duracion||'')+'</li>';
    }).join('');
    return '<h4>'+esc(titulo)+'</h4><ul>'+lis+'</ul>';
  }

  function crearNotas(notas){
    if(!notas||!notas.length){return '';}
    return '<h4>Notas</h4><p>'+esc(notas.join(' '))+'</p>';
  }

  function formatearRutinaParaTexto(rutina){
    return ['Día: '+rutina.dia,'Nombre: '+rutina.nombre,'Tipo: '+rutina.tipo,'Duración: '+(rutina.duracionMin||0),'','Calentamiento:'].concat(
      rutina.calentamiento.map(function(item){return '- '+item.nombre+(item.duracion?' | '+item.duracion:'');}),
      ['','Ejercicios:'],
      rutina.ejercicios.map(function(item){return '- '+item.nombre+(item.series?' | '+item.series:'')+(item.descanso?' | '+item.descanso:'');}),
      ['','Cierre:'],
      rutina.cierre.map(function(item){return '- '+item.nombre+(item.duracion?' | '+item.duracion:'');}),
      ['','Notas:',(rutina.notas||[]).join(' ')]
    ).join('\n');
  }

  function normalizarDias(dias){
    var mapa={};
    dias.forEach(function(item){
      if(item&&item.dia){mapa[item.dia]=normalizarDiaRegistro(item);}
    });
    return DIAS.map(function(dia){return mapa[dia]||crearDiaVacio(dia);});
  }

  function normalizarDiaRegistro(item){
    return{dia:item.dia,tipo:item.tipo||'Libre',nombre:item.nombre||item.enfoque||'',duracionMin:numero(item.duracionMin)||0,calentamiento:Array.isArray(item.calentamiento)?item.calentamiento:[],ejercicios:Array.isArray(item.ejercicios)?item.ejercicios:[],cierre:Array.isArray(item.cierre)?item.cierre:[],notas:Array.isArray(item.notas)?item.notas:(item.nota?[item.nota]:[]),rutinaCargada:Boolean(item.rutinaCargada||item.nombre)};
  }

  function crearDiaVacio(dia){return{dia:dia,tipo:'Libre',nombre:'',duracionMin:0,calentamiento:[],ejercicios:[],cierre:[],notas:[],rutinaCargada:false};}
  function buscarDia(dia){return estado.dias.find(function(item){return item.dia===dia;});}
  function contarTipo(tipo){return estado.dias.filter(function(item){return item.rutinaCargada&&item.tipo===tipo;}).length;}
  function guardarLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify({semana:estado.semana,dias:estado.dias}));}
  function estimarDuracion(rutina){return rutina.calentamiento.length*5+rutina.ejercicios.length*8+rutina.cierre.length*5;}
  function normalizarDia(valor){var limpio=limpiarTexto(valor).toLowerCase();return DIAS.find(function(dia){return dia.toLowerCase()===limpio;})||'';}
  function limpiarTexto(valor){return String(valor||'').trim();}
  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?n:null;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('enru-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();