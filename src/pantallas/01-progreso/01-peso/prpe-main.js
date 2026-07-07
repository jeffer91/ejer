/* =========================================================
Nombre completo: prpe-main.js
Ruta o ubicación: src/pantallas/01-progreso/01-peso/prpe-main.js
Función o funciones:
- Cargar registros guardados localmente.
- Calcular registro actual, IMC referencial y total de registros.
- Registrar el peso del día en localStorage.
- Dibujar un gráfico simple sin depender de librerías externas.
Con qué se conecta:
- prpe-index.html
- prpe.css
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-prpe-registros';
  var CONFIG_KEY='fitness-jeff-prpe-config';
  var perfilBase={nombre:'Jeff',estaturaCm:175};
  var estado={perfil:perfilBase,registros:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){
    capturarElementos();
    ponerFechaHoy();
    cargarDatos();
    renderizarTodo();
    conectarEventos();
  }

  function capturarElementos(){
    el.actual=document.getElementById('prpe-peso-actual');
    el.fecha=document.getElementById('prpe-fecha-actual');
    el.imc=document.getElementById('prpe-imc');
    el.imcCategoria=document.getElementById('prpe-imc-categoria');
    el.total=document.getElementById('prpe-total-registros');
    el.svg=document.getElementById('prpe-chart-svg');
    el.form=document.getElementById('prpe-form');
    el.inputFecha=document.getElementById('prpe-input-fecha');
    el.inputPeso=document.getElementById('prpe-input-peso');
    el.mensaje=document.getElementById('prpe-mensaje');
    el.tabla=document.getElementById('prpe-tabla-body');
  }

  function ponerFechaHoy(){
    var hoy=new Date();
    el.inputFecha.value=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    var config=leerJson(CONFIG_KEY);
    estado.perfil=config||perfilBase;
    estado.registros=guardado&&Array.isArray(guardado.registros)?normalizar(guardado.registros):[];
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarRegistro();});
  }

  function guardarRegistro(){
    var fecha=el.inputFecha.value;
    var valor=Number(el.inputPeso.value);
    if(!fecha){mostrarMensaje('Selecciona una fecha.',true);return;}
    if(!Number.isFinite(valor)||valor<30||valor>250){mostrarMensaje('Ingresa un valor válido en kilogramos.',true);return;}
    estado.registros=estado.registros.filter(function(item){return item.fecha!==fecha;});
    estado.registros.push({fecha:fecha,valorKg:redondear(valor,1)});
    estado.registros=normalizar(estado.registros);
    localStorage.setItem(STORAGE_KEY,JSON.stringify({registros:estado.registros}));
    localStorage.setItem(CONFIG_KEY,JSON.stringify(estado.perfil));
    mostrarMensaje('Registro guardado correctamente.',false);
    renderizarTodo();
  }

  function renderizarTodo(){
    el.total.textContent=String(estado.registros.length);
    if(!estado.registros.length){
      el.actual.textContent='-- kg';
      el.fecha.textContent='Sin registro';
      el.imc.textContent='--';
      el.imcCategoria.textContent='Referencia general';
      renderizarTabla();
      limpiarSvg();
      textoSvg(215,130,'Registra tu primer peso para ver la tendencia.');
      return;
    }
    var ultimo=estado.registros[estado.registros.length-1];
    var estaturaM=Number(estado.perfil.estaturaCm)/100;
    var imc=calcularImc(ultimo.valorKg,estaturaM);
    el.actual.textContent=formatoKg(ultimo.valorKg);
    el.fecha.textContent=formatearFecha(ultimo.fecha);
    el.imc.textContent=imc?imc.toFixed(1):'--';
    el.imcCategoria.textContent=imc?categoriaImc(imc):'Referencia general';
    dibujarGrafico();
    renderizarTabla();
  }

  function dibujarGrafico(){
    var registros=estado.registros.slice(-10);
    limpiarSvg();
    if(registros.length<2){textoSvg(220,130,'Se necesitan al menos 2 registros.');return;}
    var w=640,h=260,p=34;
    var valores=registros.map(function(r){return r.valorKg;});
    var min=Math.min.apply(null,valores)-0.5;
    var max=Math.max.apply(null,valores)+0.5;
    lineaSvg(p,h-p,w-p,h-p,'#d9e2ef',2);lineaSvg(p,p,p,h-p,'#d9e2ef',2);
    var puntos=registros.map(function(r,i){var x=p+i*((w-p*2)/(registros.length-1));var y=h-p-((r.valorKg-min)/(max-min))*(h-p*2);return{x:x,y:y,r:r};});
    var path=puntos.map(function(pt,i){return(i===0?'M ':'L ')+pt.x+' '+pt.y;}).join(' ');
    var pathEl=svgEl('path');pathEl.setAttribute('d',path);pathEl.setAttribute('fill','none');pathEl.setAttribute('stroke','#2563eb');pathEl.setAttribute('stroke-width','4');pathEl.setAttribute('stroke-linecap','round');pathEl.setAttribute('stroke-linejoin','round');el.svg.appendChild(pathEl);
    puntos.forEach(function(pt){circuloSvg(pt.x,pt.y,6,'#2563eb');textoSvg(pt.x-18,pt.y-14,pt.r.valorKg+' kg','12px');});
    textoSvg(p,22,'Últimos '+registros.length+' registros','13px');
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';
    if(!estado.registros.length){
      var filaVacia=document.createElement('tr');
      filaVacia.innerHTML='<td colspan="2">Todavía no hay registros guardados.</td>';
      el.tabla.appendChild(filaVacia);
      return;
    }
    estado.registros.slice().reverse().slice(0,8).forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td><strong>'+esc(formatoKg(item.valorKg))+'</strong></td>';el.tabla.appendChild(tr);});
  }

  function normalizar(registros){return registros.map(function(item){return{fecha:item.fecha,valorKg:Number(item.valorKg||item.pesoKg)};}).filter(function(item){return item.fecha&&Number.isFinite(item.valorKg);}).sort(function(a,b){return a.fecha.localeCompare(b.fecha);});}
  function calcularImc(kg,m){if(!Number.isFinite(kg)||!Number.isFinite(m)||m<=0){return 0;}return kg/(m*m);}
  function categoriaImc(imc){if(imc<18.5){return'Referencia: bajo';}if(imc<25){return'Referencia: medio';}if(imc<30){return'Referencia: alto';}return'Referencia: revisar';}
  function formatoKg(valor){return redondear(Number(valor),1).toFixed(1)+' kg';}
  function redondear(valor,decimales){var factor=Math.pow(10,decimales);return Math.round(valor*factor)/factor;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('prpe-error',Boolean(error));}
  function limpiarSvg(){while(el.svg.firstChild){el.svg.removeChild(el.svg.firstChild);}}
  function svgEl(nombre){return document.createElementNS('http://www.w3.org/2000/svg',nombre);}
  function lineaSvg(x1,y1,x2,y2,color,ancho){var l=svgEl('line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',color);l.setAttribute('stroke-width',ancho);el.svg.appendChild(l);}
  function circuloSvg(cx,cy,r,color){var c=svgEl('circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('fill',color);el.svg.appendChild(c);}
  function textoSvg(x,y,texto,size){var t=svgEl('text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill','#667085');t.setAttribute('font-size',size||'14px');t.setAttribute('font-family','Arial, Helvetica, sans-serif');t.textContent=texto;el.svg.appendChild(t);}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();