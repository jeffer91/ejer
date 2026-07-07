/* =========================================================
Nombre completo: prrd-main.js
Ruta o ubicación: src/pantallas/01-progreso/03-registrar-datos/prrd-main.js
Función o funciones:
- Cargar datos físicos base guardados localmente.
- Registrar fecha, edad, altura, sexo, complexión y actividad semanal.
- Mostrar resumen e historial sin usar energía, agua, descanso ni peso.
Con qué se conecta:
- prrd-index.html
- prrd.css
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-prrd-datos-base';
  var estado={registros:[]};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){
    capturarElementos();
    ponerFechaHoy();
    cargarDatos();
    conectarEventos();
    cargarUltimoEnFormulario();
    renderizarTodo();
  }

  function capturarElementos(){
    el.fechaActual=document.getElementById('prrd-fecha-actual');
    el.edadActual=document.getElementById('prrd-edad-actual');
    el.alturaActual=document.getElementById('prrd-altura-actual');
    el.actividadActual=document.getElementById('prrd-actividad-actual');
    el.form=document.getElementById('prrd-form');
    el.inputFecha=document.getElementById('prrd-input-fecha');
    el.inputEdad=document.getElementById('prrd-input-edad');
    el.inputAltura=document.getElementById('prrd-input-altura');
    el.inputSexo=document.getElementById('prrd-input-sexo');
    el.inputActividad=document.getElementById('prrd-input-actividad');
    el.mensaje=document.getElementById('prrd-mensaje');
    el.insights=document.getElementById('prrd-insights');
    el.tabla=document.getElementById('prrd-tabla-body');
  }

  function ponerFechaHoy(){
    var hoy=new Date();
    el.inputFecha.value=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    estado.registros=guardado&&Array.isArray(guardado.registros)?normalizar(guardado.registros):[];
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){
      event.preventDefault();
      guardarRegistro();
    });
  }

  function cargarUltimoEnFormulario(){
    var ultimo=estado.registros[estado.registros.length-1];
    if(!ultimo){return;}
    el.inputEdad.value=ultimo.edad||'';
    el.inputAltura.value=ultimo.alturaCm||'';
    el.inputSexo.value=ultimo.sexo||'';
    el.inputActividad.value=ultimo.actividadSemanal||'';
    seleccionarComplexion(ultimo.complexion||'');
  }

  function guardarRegistro(){
    var registro={
      fecha:el.inputFecha.value,
      edad:numero(el.inputEdad.value),
      alturaCm:numero(el.inputAltura.value),
      sexo:el.inputSexo.value,
      complexion:leerComplexionSeleccionada(),
      actividadSemanal:el.inputActividad.value
    };

    if(!registro.fecha){mostrarMensaje('Selecciona una fecha.',true);return;}
    if(!Number.isFinite(registro.edad)||registro.edad<10||registro.edad>100){mostrarMensaje('Ingresa una edad válida.',true);return;}
    if(!Number.isFinite(registro.alturaCm)||registro.alturaCm<100||registro.alturaCm>230){mostrarMensaje('Ingresa una altura válida en centímetros.',true);return;}
    if(!registro.sexo){mostrarMensaje('Selecciona hombre o mujer.',true);return;}
    if(!registro.complexion){mostrarMensaje('Selecciona una complexión corporal aproximada.',true);return;}
    if(!registro.actividadSemanal){mostrarMensaje('Selecciona tu actividad semanal.',true);return;}

    estado.registros=estado.registros.filter(function(item){return item.fecha!==registro.fecha;});
    estado.registros.push(registro);
    estado.registros=normalizar(estado.registros);
    localStorage.setItem(STORAGE_KEY,JSON.stringify({registros:estado.registros}));
    mostrarMensaje('Datos base guardados correctamente.',false);
    renderizarTodo();
  }

  function renderizarTodo(){
    var ultimo=estado.registros[estado.registros.length-1];
    if(!ultimo){
      el.fechaActual.textContent='--';
      el.edadActual.textContent='--';
      el.alturaActual.textContent='-- cm';
      el.actividadActual.textContent='--';
      renderizarInsights(null);
      renderizarTabla();
      return;
    }
    el.fechaActual.textContent=formatearFecha(ultimo.fecha);
    el.edadActual.textContent=ultimo.edad+' años';
    el.alturaActual.textContent=ultimo.alturaCm+' cm';
    el.actividadActual.textContent=ultimo.actividadSemanal;
    renderizarInsights(ultimo);
    renderizarTabla();
  }

  function renderizarInsights(ultimo){
    el.insights.innerHTML='';
    var textos=!ultimo?[
      'Todavía no hay datos base guardados.',
      'Completa edad, altura, sexo, complexión aproximada y actividad semanal.',
      'El peso se registra aparte en la pantalla Progreso / Peso.'
    ]:[
      'Perfil base: '+ultimo.sexo+', '+ultimo.edad+' años, '+ultimo.alturaCm+' cm.',
      'Complexión aproximada registrada: '+ultimo.complexion+'.',
      'Actividad semanal registrada: '+ultimo.actividadSemanal+'.'
    ];
    textos.forEach(function(t){var li=document.createElement('li');li.textContent=t;el.insights.appendChild(li);});
  }

  function renderizarTabla(){
    el.tabla.innerHTML='';
    if(!estado.registros.length){
      var filaVacia=document.createElement('tr');
      filaVacia.innerHTML='<td colspan="6">Todavía no hay datos base guardados.</td>';
      el.tabla.appendChild(filaVacia);
      return;
    }
    estado.registros.slice().reverse().slice(0,10).forEach(function(item){
      var tr=document.createElement('tr');
      tr.innerHTML='<td>'+esc(formatearFecha(item.fecha))+'</td><td>'+esc(item.edad+' años')+'</td><td>'+esc(item.alturaCm+' cm')+'</td><td>'+esc(item.sexo)+'</td><td>'+esc(item.complexion)+'</td><td>'+esc(item.actividadSemanal)+'</td>';
      el.tabla.appendChild(tr);
    });
  }

  function leerComplexionSeleccionada(){
    var seleccionado=document.querySelector('input[name="prrd-complexion"]:checked');
    return seleccionado?seleccionado.value:'';
  }

  function seleccionarComplexion(valor){
    var opciones=Array.prototype.slice.call(document.querySelectorAll('input[name="prrd-complexion"]'));
    opciones.forEach(function(opcion){opcion.checked=opcion.value===valor;});
  }

  function normalizar(registros){
    return registros.map(function(item){
      return{fecha:item.fecha,edad:numero(item.edad),alturaCm:numero(item.alturaCm),sexo:item.sexo||'',complexion:item.complexion||'',actividadSemanal:item.actividadSemanal||''};
    }).filter(function(item){return item.fecha&&Number.isFinite(item.edad)&&Number.isFinite(item.alturaCm);}).sort(function(a,b){return a.fecha.localeCompare(b.fecha);});
  }

  function numero(valor){if(valor===''||valor===null||typeof valor==='undefined'){return null;}var n=Number(valor);return Number.isFinite(n)?Math.round(n):null;}
  function formatearFecha(fecha){var p=String(fecha).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:fecha;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('prrd-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();