/* =========================================================
Nombre completo: prme-main.js
Ruta o ubicación: src/pantallas/01-progreso/02-medidas/prme-main.js
Función o funciones:
- Cargar datos demo o datos guardados localmente.
- Registrar medidas de referencia por fecha.
- Mostrar resumen, historial y gráfico simple por zona.
Con qué se conecta:
- prme-index.html
- prme.css
- data/prme-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-prme-registros';
  var estado={registros:[],zonaActiva:'cinturaCm'};
  var demoFallback={registros:[{fecha:'2026-07-01',cinturaCm:94.5,pechoCm:105,brazoCm:36,musloCm:60,nota:'Registro inicial demo.'},{fecha:'2026-07-08',cinturaCm:94,pechoCm:105.2,brazoCm:36.1,musloCm:60.1,nota:'Registro semanal demo.'},{fecha:'2026-07-15',cinturaCm:93.6,pechoCm:105.1,brazoCm:36.2,musloCm:60,nota:'Registro semanal demo.'}]};
  var etiquetas={cinturaCm:'Cintura',pechoCm:'Pecho',brazoCm:'Brazo',musloCm:'Muslo'};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){
    capturarElementos();
    ponerFechaHoy();
    cargarDatos().then(function(){conectarEventos();renderizarTodo();});
  }

  function capturarElementos(){
    el.modo=document.getElementById('prme-modo-datos');
    el.fechaActual=document.getElementById('prme-fecha-actual');
    el.cinturaActual=document.getElementById('prme-cintura-actual');
    el.pechoActual=document.getElementById('prme-pecho-actual');
    el.total=document.getElementById('prme-total-registros');
    el.svg=document.getElementById('prme-chart-svg');
    el.form=document.getElementById('prme-form');
    el.inputFecha=document.getElementById('prme-input-fecha');
    el.inputCintura=document.getElementById('prme-input-cintura');
    el.inputPecho=document.getElementById('prme-input-pecho');
    el.inputBrazo=document.getElementById('prme-input-brazo');
    el.inputMuslo=document.getElementById('prme-input-muslo');
    el.inputNota=document.getElementById('prme-input-nota');
    el.btnDemo=document.getElementById('prme-btn-restaurar-demo');
    el.mensaje=document.getElementById('prme-mensaje');
    el.tabla=document.getElementById('prme-tabla-body');
    el.botonesZona=Array.prototype.slice.call(document.querySelectorAll('.prme-zone-button'));
  }

  function ponerFechaHoy(){
    var hoy=new Date();
    el.inputFecha.value=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&Array.isArray(guardado.registros)){
      estado.registros=normalizar(guardado.registros);
      el.modo.textContent='Datos locales';
      return Promise.resolve();
    }
    return fetch('./data/prme-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.registros=normalizar(data.registros||[]);el.modo.textContent='Modo demo';}).catch(function(){estado.registros=normalizar(demoFallback.registros);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarRegistro();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.registros=normalizar(demoFallback.registros);el.modo.textContent='Modo demo restaurado';mostrarMensaje('Datos demo restaurados.',false);renderizarTodo();});
    el.botonesZona.forEach(function(btn){btn.addEventListener('click',function(){estado.zonaActiva=btn.getAttribute('data-zona');el.botonesZona.forEach(function(item){item.classList.toggle('prme-zone-active',item===btn);});dibujarGrafico();});});
  }

  function guardarRegistro(){
    var registro={fecha:el.inputFecha.value,cinturaCm:numero(el.inputCintura.value),pechoCm:numero(el.inputPecho.value),brazoCm:numero(el.inputBrazo.value),musloCm:numero(el.inputMuslo.value),nota:el.inputNota.value.trim()||'Sin nota'};
    if(!registro.fecha){mostrarMensaje('Selecciona una fecha.',true);return;}
    if(!Number.isFinite(registro.cinturaCm)){mostrarMensaje('Ingresa al menos la cintura en cm.',true);return;}
    estado.registros=estado.registros.filter(function(item){return item.fecha!==registro.fecha;});
    estado.registros.push(registro);
    estado.registros=normalizar(estado.registros);
    localStorage.setItem(STORAGE_KEY,JSON.stringify({registros:estado.registros}));
    el.inputNota.value='';
    el.modo.textContent='Datos locales';
    mostrarMensaje('Medidas guardadas correctamente.',false);
    renderizarTodo();
  }

  function renderizarTodo(){
    var ultimo=estado.registros[estado.registros.length-1];
    if(!ultimo){return;}
    el.fechaActual.textContent=formatearFecha(ultimo.fecha);
    el.cinturaActual.textContent=formatoCm(ultimo.cinturaCm);
    el.pechoActual.textContent=formatoCm(ultimo.pechoCm);
    el.total.textContent=String(estado.registros.length);
    dibujarGrafico();
    renderizarTabla();
  }

  function dibujarGrafico(){
    var registros=estado.registros.filter(function(r){return Number.isFinite(r[estado.zonaActiva]);}).slice(-10);
    limpiarSvg();
    if(registros.length<2){textoSvg(230,130,'Se necesitan al menos 2 registros de '+etiquetas[estado.zonaActiva]+'.');return;}
    var w=640,h=260,p=34;
    var valores=registros.map(function(r){return r[estado.zonaActiva];});
    var min=Math.min.apply(null,valores)-0.5;
    var max=Math.max.apply(null,valores)+0.5;
    lineaSvg(p,h-p,w-p,h-p,'#d9e2ef',2);lineaSvg(p,p,p,h-p,'#d9e2ef',2);
    var puntos=registros.map(function(r,i){var x=p+i*((w-p*2)/(registros.length-1));var y=h-p-((r[estado.zonaActiva]-min)/(max-min))*(h-p*2);return{x:x,y:y,r:r};});
    var path=puntos.map(function(pt,i){return(i===0?'M ':'L ')+pt.x+' '+pt.y;}).join(' ');
    var pathEl=svgEl('path');pathEl.setAttribute('d',path);pathEl.setAttribute('fill','none');pathEl.setAttribute('stroke','#2563eb');pathEl.setAttribute('stroke-width','4');pathEl.setAttribute('stroke-linecap','round');pathEl.setAttribute('stroke-linejoin','round');el.svg.appendChild(pathEl);
    puntos.forEach(function(pt){circuloSvg(pt.x,pt.y,6,'#2563eb');textoSvg(pt.x-18,pt.y-14,pt.r[estado.zonaActiva]+' cm','12px');});
    textoSvg(p,22,etiquetas[estado.zonaActiva]+' - últimos '+registros.length+' registros','13px');
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';
    estado.registros.slice().reverse().slice(0,8).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td><strong>'+esc(formatoCm(item.cinturaCm))+'</strong></td><td>'+esc(formatoCm(item.pechoCm))+'</td><td>'+esc(formatoCm(item.brazoCm))+'</td><td>'+esc(formatoCm(item.musloCm))+'</td><td>'+esc(item.nota||'Sin nota')+'</td>';el.tabla.appendChild(tr);});
  }

  function normalizar(registros){return registros.map(function(item){return{fecha:item.fecha,cinturaCm:numero(item.cinturaCm),pechoCm:numero(item.pechoCm),brazoCm:numero(item.brazoCm),musloCm:numero(item.musloCm),nota:item.nota||'Sin nota'};}).filter(function(item){return item.fecha&&Number.isFinite(item.cinturaCm);}).sort(function(a,b){return a.fecha.localeCompare(b.fecha);});}
  function numero(valor){var n=Number(valor);return Number.isFinite(n)?redondear(n,1):null;}
  function redondear(valor,decimales){var factor=Math.pow(10,decimales);return Math.round(valor*factor)/factor;}
  function formatoCm(valor){return Number.isFinite(valor)?redondear(valor,1).toFixed(1)+' cm':'--';}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('prme-error',Boolean(error));}
  function limpiarSvg(){while(el.svg.firstChild){el.svg.removeChild(el.svg.firstChild);}}
  function svgEl(nombre){return document.createElementNS('http://www.w3.org/2000/svg',nombre);}
  function lineaSvg(x1,y1,x2,y2,color,ancho){var l=svgEl('line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',color);l.setAttribute('stroke-width',ancho);el.svg.appendChild(l);}
  function circuloSvg(cx,cy,r,color){var c=svgEl('circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('fill',color);el.svg.appendChild(c);}
  function textoSvg(x,y,texto,size){var t=svgEl('text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill','#667085');t.setAttribute('font-size',size||'14px');t.setAttribute('font-family','Arial, Helvetica, sans-serif');t.textContent=texto;el.svg.appendChild(t);}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
