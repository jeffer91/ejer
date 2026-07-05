/* =========================================================
Nombre completo: ajpe-main.js
Ruta o ubicación: src/pantallas/05-ajustes/01-perfil/ajpe-main.js
Función o funciones:
- Cargar perfil demo o perfil guardado localmente.
- Guardar datos generales y preferencias en localStorage.
- Mostrar resumen y vista previa del perfil activo.
Con qué se conecta:
- ajpe-index.html
- ajpe.css
- data/ajpe-demo-data.json
========================================================= */
(function(){
  'use strict';

  var STORAGE_KEY='fitness-jeff-ajpe-perfil';
  var estado={perfil:null};
  var demoFallback={perfil:{nombreVisible:'Jeff',unidadPrincipal:'kg/cm',modoVisual:'Claro',diasActivosSemana:5,metaAguaMl:2500,enfoquePrincipal:'Constancia',horarioPreferido:'Noche',notaPersonal:'Prefiero una app clara, simple y con registros rápidos.'}};
  var el={};

  document.addEventListener('DOMContentLoaded',iniciar);

  function iniciar(){capturarElementos();cargarDatos().then(function(){conectarEventos();llenarFormulario();renderizarTodo();});}

  function capturarElementos(){
    el.modo=document.getElementById('ajpe-modo-datos');el.resumenNombre=document.getElementById('ajpe-resumen-nombre');el.resumenModo=document.getElementById('ajpe-resumen-modo');el.resumenDias=document.getElementById('ajpe-resumen-dias');el.resumenAgua=document.getElementById('ajpe-resumen-agua');el.form=document.getElementById('ajpe-form');el.inputNombre=document.getElementById('ajpe-input-nombre');el.inputUnidad=document.getElementById('ajpe-input-unidad');el.inputModo=document.getElementById('ajpe-input-modo');el.inputDias=document.getElementById('ajpe-input-dias');el.inputAgua=document.getElementById('ajpe-input-agua');el.inputEnfoque=document.getElementById('ajpe-input-enfoque');el.inputHorario=document.getElementById('ajpe-input-horario');el.inputNota=document.getElementById('ajpe-input-nota');el.btnDemo=document.getElementById('ajpe-btn-restaurar-demo');el.mensaje=document.getElementById('ajpe-mensaje');el.profileCard=document.getElementById('ajpe-profile-card');
  }

  function cargarDatos(){
    var guardado=leerJson(STORAGE_KEY);
    if(guardado&&guardado.perfil){estado.perfil=normalizarPerfil(guardado.perfil);el.modo.textContent='Datos locales';return Promise.resolve();}
    return fetch('./data/ajpe-demo-data.json').then(function(res){if(!res.ok){throw new Error('demo no disponible');}return res.json();}).then(function(data){estado.perfil=normalizarPerfil(data.perfil||demoFallback.perfil);el.modo.textContent='Modo demo';}).catch(function(){estado.perfil=normalizarPerfil(demoFallback.perfil);el.modo.textContent='Modo demo interno';});
  }

  function conectarEventos(){
    el.form.addEventListener('submit',function(event){event.preventDefault();guardarPerfil();});
    el.btnDemo.addEventListener('click',function(){localStorage.removeItem(STORAGE_KEY);estado.perfil=normalizarPerfil(demoFallback.perfil);el.modo.textContent='Modo demo restaurado';llenarFormulario();mostrarMensaje('Perfil demo restaurado.',false);renderizarTodo();});
  }

  function llenarFormulario(){
    var p=estado.perfil;el.inputNombre.value=p.nombreVisible;el.inputUnidad.value=p.unidadPrincipal;el.inputModo.value=p.modoVisual;el.inputDias.value=p.diasActivosSemana;el.inputAgua.value=p.metaAguaMl;el.inputEnfoque.value=p.enfoquePrincipal;el.inputHorario.value=p.horarioPreferido;el.inputNota.value=p.notaPersonal;
  }

  function guardarPerfil(){
    var perfil=normalizarPerfil({nombreVisible:el.inputNombre.value.trim(),unidadPrincipal:el.inputUnidad.value,modoVisual:el.inputModo.value,diasActivosSemana:el.inputDias.value,metaAguaMl:el.inputAgua.value,enfoquePrincipal:el.inputEnfoque.value,horarioPreferido:el.inputHorario.value,notaPersonal:el.inputNota.value.trim()});
    if(!perfil.nombreVisible){mostrarMensaje('Escribe un nombre visible.',true);return;}
    if(perfil.diasActivosSemana<1||perfil.diasActivosSemana>7){mostrarMensaje('Los días activos deben estar entre 1 y 7.',true);return;}
    if(perfil.metaAguaMl<500||perfil.metaAguaMl>6000){mostrarMensaje('La meta de agua debe estar entre 500 y 6000 ml.',true);return;}
    estado.perfil=perfil;localStorage.setItem(STORAGE_KEY,JSON.stringify({perfil:estado.perfil}));el.modo.textContent='Datos locales';mostrarMensaje('Perfil guardado correctamente.',false);renderizarTodo();
  }

  function renderizarTodo(){renderizarResumen();renderizarVistaPerfil();}

  function renderizarResumen(){
    var p=estado.perfil;el.resumenNombre.textContent=p.nombreVisible;el.resumenModo.textContent=p.modoVisual;el.resumenDias.textContent=String(p.diasActivosSemana);el.resumenAgua.textContent=p.metaAguaMl+' ml';
  }

  function renderizarVistaPerfil(){
    var p=estado.perfil;var items=[['Nombre',p.nombreVisible],['Unidad',p.unidadPrincipal],['Modo visual',p.modoVisual],['Días activos por semana',p.diasActivosSemana],['Meta agua diaria',p.metaAguaMl+' ml'],['Enfoque principal',p.enfoquePrincipal],['Horario preferido',p.horarioPreferido],['Nota',p.notaPersonal||'Sin nota']];
    el.profileCard.innerHTML='';items.forEach(function(item){var div=document.createElement('div');div.className='ajpe-profile-item';div.innerHTML='<span>'+esc(item[0])+'</span><strong>'+esc(item[1])+'</strong>';el.profileCard.appendChild(div);});
  }

  function normalizarPerfil(p){return{nombreVisible:String(p.nombreVisible||'Jeff'),unidadPrincipal:p.unidadPrincipal||'kg/cm',modoVisual:p.modoVisual||'Claro',diasActivosSemana:numero(p.diasActivosSemana)||5,metaAguaMl:numero(p.metaAguaMl)||2500,enfoquePrincipal:p.enfoquePrincipal||'Constancia',horarioPreferido:p.horarioPreferido||'Variable',notaPersonal:p.notaPersonal||'Sin nota'};}
  function numero(valor){var n=Number(valor);return Number.isFinite(n)?n:null;}
  function leerJson(clave){try{var v=localStorage.getItem(clave);return v?JSON.parse(v):null;}catch(error){console.error('No se pudo leer almacenamiento local:',error);return null;}}
  function mostrarMensaje(mensaje,error){el.mensaje.textContent=mensaje;el.mensaje.classList.toggle('ajpe-error',Boolean(error));}
  function esc(valor){return String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
})();
