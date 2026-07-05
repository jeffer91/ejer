/* =========================================================
Nombre completo: vohi-main.js
Ruta o ubicación: src/pantallas/06-voz/02-historial/vohi-main.js
Función o funciones:
- Cargar historial demo o historial guardado localmente por Voz / Asistente.
- Filtrar comandos por texto, categoría y estado.
- Preparar una exportación JSON del historial visible.
Con qué se conecta:
- vohi-index.html
- vohi.css
- data/vohi-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_ASISTENTE='fitness-jeff-voas-historial';
  var STORAGE_HISTORIAL='fitness-jeff-vohi-historial';
  var estado={historial:[],filtrados:[]};
  var demoFallback={historial:[{fecha:'2026-07-05 08:30',texto:'Registrar agua de la mañana',accion:'Registrar agua',categoria:'Hidratación',valor:'500 ml',confianza:'Alta',estado:'Preparado'},{fecha:'2026-07-05 20:15',texto:'Registrar entrenamiento con esfuerzo moderado',accion:'Registrar entrenamiento',categoria:'Entrenamiento',valor:'Esfuerzo 4/5',confianza:'Media',estado:'Preparado'}]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();aplicarFiltros();});}

  function capturarElementos(){
    el.modo=document.getElementById('vohi-modo-datos');el.total=document.getElementById('vohi-total');el.agua=document.getElementById('vohi-agua');el.entrenamiento=document.getElementById('vohi-entrenamiento');el.notas=document.getElementById('vohi-notas');el.buscar=document.getElementById('vohi-input-buscar');el.categoria=document.getElementById('vohi-select-categoria');el.estado=document.getElementById('vohi-select-estado');el.btnLimpiar=document.getElementById('vohi-btn-limpiar');el.btnExportar=document.getElementById('vohi-btn-exportar');el.btnDemo=document.getElementById('vohi-btn-restaurar-demo');el.mensaje=document.getElementById('vohi-mensaje');el.exportJson=document.getElementById('vohi-export-json');el.tabla=document.getElementById('vohi-tabla-body');
  }

  function cargarDatos(){
    var asistente=leerJson(STORAGE_ASISTENTE);
    if(asistente&&Array.isArray(asistente.historial)&&asistente.historial.length){estado.historial=normalizarHistorial(asistente.historial);el.modo.textContent='Datos del asistente';return Promise.resolve();}
    var guardado=leerJson(STORAGE_HISTORIAL);
    if(guardado&&Array.isArray(guardado.historial)){estado.historial=normalizarHistorial(guardado.historial);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/vohi-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.historial=normalizarHistorial(data.historial||demoFallback.historial);el.modo.textContent='Modo demo';}).catch(function(){estado.historial=normalizarHistorial(demoFallback.historial);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.buscar.addEventListener('input',aplicarFiltros);el.categoria.addEventListener('change',aplicarFiltros);el.estado.addEventListener('change',aplicarFiltros);
    el.btnLimpiar.addEventListener('click',function(){el.buscar.value='';el.categoria.value='Todas';el.estado.value='Todos';aplicarFiltros();mostrarMensaje('Filtros limpiados.',false);});
    el.btnExportar.addEventListener('click',function(){prepararExportacion();mostrarMensaje('Exportación preparada.',false);});
    el.btnDemo.addEventListener('click',function(){estado.historial=normalizarHistorial(demoFallback.historial);guardarLocal();el.modo.textContent='Modo demo restaurado';aplicarFiltros();mostrarMensaje('Historial demo restaurado.',false);});
  }

  function aplicarFiltros(){
    var texto=normalizarTexto(el.buscar.value);var categoria=el.categoria.value;var estadoFiltro=el.estado.value;
    estado.filtrados=estado.historial.filter(function(item){
      var coincideTexto=!texto||normalizarTexto(item.texto+' '+item.accion+' '+item.valor).indexOf(texto)>=0;
      var coincideCategoria=categoria==='Todas'||item.categoria===categoria;
      var coincideEstado=estadoFiltro==='Todos'||item.estado===estadoFiltro;
      return coincideTexto&&coincideCategoria&&coincideEstado;
    });
    renderizarTodo();
  }

  function renderizarTodo(){renderizarResumen();renderizarTabla();prepararExportacion(false);}

  function renderizarResumen(){
    el.total.textContent=String(estado.historial.length);el.agua.textContent=String(contarCategoria('Hidratación'));el.entrenamiento.textContent=String(contarCategoria('Entrenamiento'));el.notas.textContent=String(contarCategoria('Nota'));
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';
    if(!estado.filtrados.length){var tr=document.createElement('tr');tr.innerHTML='<td colspan="7"><div class="vohi-empty">No hay comandos con esos filtros.</div></td>';el.tabla.appendChild(tr);return;}
    estado.filtrados.forEach(function(item){var tr=document.createElement('tr');tr.innerHTML='<td>'+esc(item.fecha)+'</td><td>'+esc(item.accion)+'</td><td><span class="vohi-pill">'+esc(item.categoria)+'</span></td><td>'+esc(item.valor)+'</td><td>'+esc(item.confianza)+'</td><td>'+esc(item.estado)+'</td><td>'+esc(item.texto)+'</td>';el.tabla.appendChild(tr);});
  }

  function prepararExportacion(mostrar){
    el.exportJson.value=JSON.stringify({generadoEn:fechaHoraActual(),total:estado.filtrados.length,historial:estado.filtrados},null,2);
  }

  function contarCategoria(categoria){return estado.historial.filter(function(item){return item.categoria===categoria;}).length;}
  function guardarLocal(){localStorage.setItem(STORAGE_HISTORIAL,JSON.stringify({historial:estado.historial}));}
  function normalizarHistorial(lista){return lista.map(function(i){return{fecha:i.fecha||fechaHoraActual(),texto:i.texto||'',accion:i.accion||'Guardar nota',categoria:i.categoria||'Nota',valor:i.valor||'Texto libre',confianza:i.confianza||'Media',estado:i.estado||'Preparado'};});}
  function fechaHoraActual(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function normalizarTexto(texto){return String(texto||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('vohi-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
