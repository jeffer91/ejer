/* =========================================================
Nombre completo: enru-main.js
Ruta o ubicación: src/pantallas/02-entrenamiento/03-rutinas/enru-main.js
Función o funciones:
- Cargar planificación semanal guardada localmente.
- Mostrar calendario semanal de ancho completo.
- Importar la semana completa desde un texto estructurado.
- Copiar el prompt vacío para generar rutinas personalizadas.
- Dividir cada día en calentamiento, ejercicios, cierre y notas.
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
    cargarSemanaEnCaja();
    renderizarTodo();
  }

  function capturarElementos(){
    el.semana=document.getElementById('enru-semana');
    el.totalEntrenos=document.getElementById('enru-total-entrenos');
    el.totalHiit=document.getElementById('enru-total-hiit');
    el.totalDescanso=document.getElementById('enru-total-descanso');
    el.calendario=document.getElementById('enru-calendario');
    el.form=document.getElementById('enru-form');
    el.inputRutina=document.getElementById('enru-input-rutina');
    el.btnLimpiarSemana=document.getElementById('enru-btn-limpiar-dia');
    el.btnCopiarFormato=document.getElementById('enru-btn-copiar-formato');
    el.formatoRutina=document.getElementById('enru-formato-rutina');
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
      cargarSemanaCompleta();
    });
    el.btnLimpiarSemana.addEventListener('click',limpiarSemanaCompleta);
    if(el.btnCopiarFormato){
      el.btnCopiarFormato.addEventListener('click',copiarFormatoRutina);
    }
  }

  function cargarSemanaEnCaja(){
    var cargadas=estado.dias.filter(function(item){return item.rutinaCargada;});
    if(cargadas.length){
      el.inputRutina.value=formatearSemanaParaTexto();
    }
  }

  function copiarFormatoRutina(){
    var texto=el.formatoRutina?el.formatoRutina.textContent:'';
    if(!texto){mostrarMensaje('No se encontró el prompt para copiar.',true);return;}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(texto).then(function(){
        mostrarMensaje('Prompt vacío copiado. Completa tus datos, genera la rutina con IA y pega la semana final.',false);
      }).catch(function(){copiarConFallback(texto);});
      return;
    }
    copiarConFallback(texto);
  }

  function copiarConFallback(texto){
    var area=document.createElement('textarea');
    area.value=texto;
    area.setAttribute('readonly','readonly');
    area.style.position='fixed';
    area.style.left='-9999px';
    document.body.appendChild(area);
    area.select();
    try{
      document.execCommand('copy');
      mostrarMensaje('Prompt vacío copiado. Completa tus datos, genera la rutina con IA y pega la semana final.',false);
    }catch(error){
      mostrarMensaje('No se pudo copiar automáticamente. Selecciona el prompt y cópialo manualmente.',true);
    }
    document.body.removeChild(area);
  }

  function cargarSemanaCompleta(){
    var texto=el.inputRutina.value.trim();
    if(!texto){mostrarMensaje('Pega el plan semanal completo antes de cargar.',true);return;}
    var resultado=parsearSemana(texto);
    if(resultado.error){mostrarMensaje(resultado.error,true);return;}
    estado.semana=resultado.semana||'Semana actual';
    estado.dias=normalizarDias(resultado.rutinas);
    estado.diaActivo='Lunes';
    guardarLocal();
    mostrarMensaje('Semana completa cargada correctamente: '+resultado.rutinas.length+' días guardados.',false);
    renderizarTodo();
  }

  function limpiarSemanaCompleta(){
    estado.semana='Semana actual';
    estado.dias=normalizarDias([]);
    estado.diaActivo='Lunes';
    el.inputRutina.value='';
    guardarLocal();
    mostrarMensaje('Semana limpiada correctamente.',false);
    renderizarTodo();
  }

  function parsearSemana(texto){
    var lineas=texto.split(/\r?\n/);
    var semana='Semana actual';
    var bloques=[];
    var actual=[];

    lineas.forEach(function(linea){
      var limpia=linea.trim();
      if(/^Semana\s*:/i.test(limpia)){
        semana=limpia.split(':').slice(1).join(':').trim()||'Semana actual';
        return;
      }
      if(/^D[ií]a\s*:/i.test(limpia)){
        if(actual.length){bloques.push(actual.join('\n'));}
        actual=[linea];
        return;
      }
      if(actual.length){actual.push(linea);}
    });
    if(actual.length){bloques.push(actual.join('\n'));}

    if(!bloques.length){return{error:'No encontré bloques de día. Cada rutina debe iniciar con Día: Lunes, Día: Martes, etc.'};}

    var rutinas=[];
    var errores=[];
    bloques.forEach(function(bloque,indice){
      var rutina=parsearRutina(bloque);
      if(!rutina.dia){errores.push('Bloque '+(indice+1)+': falta un día válido.');return;}
      if(!rutina.nombre){errores.push(rutina.dia+': falta Nombre.');return;}
      rutinas.push(rutina);
    });
    if(errores.length){return{error:errores.join(' ')}};

    var vistos={};
    rutinas.forEach(function(rutina){vistos[rutina.dia]=(vistos[rutina.dia]||0)+1;});
    var duplicados=Object.keys(vistos).filter(function(dia){return vistos[dia]>1;});
    if(duplicados.length){return{error:'Hay días duplicados: '+duplicados.join(', ')+'. Deja un solo bloque por día.'};}

    var faltantes=DIAS.filter(function(dia){return !vistos[dia];});
    if(faltantes.length){return{error:'Faltan estos días para cargar la semana completa: '+faltantes.join(', ')+'.'};}

    return{semana:semana,rutinas:rutinas};
  }

  function parsearRutina(texto){
    var rutina={dia:'',nombre:'',tipo:'Entrenamiento',objetivo:'',duracionMin:0,nivel:'',equipo:'',calentamiento:[],ejercicios:[],cierre:[],notas:[],rutinaCargada:true};
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
    if(!rutina.duracionMin){rutina.duracionMin=estimarDuracion(rutina);}
    return rutina;
  }

  function leerEtiqueta(linea){
    var partes=linea.split(':');
    if(partes.length<2){return null;}
    var clave=normalizarClave(partes.shift());
    var valor=partes.join(':').trim();
    var secciones=['calentamiento','ejercicios','cierre','notas'];
    if(secciones.indexOf(clave)!==-1){return{clave:clave,valor:valor,esSeccion:true};}
    if(['dia','nombre','tipo','objetivo','duracion','nivel','equipo'].indexOf(clave)!==-1){return{clave:clave,valor:valor,esSeccion:false};}
    return null;
  }

  function normalizarClave(clave){
    return String(clave).trim().toLowerCase()
      .replace('día','dia')
      .replace('duración','duracion')
      .replace('materiales','equipo')
      .replace('equipamiento','equipo')
      .replace('vuelta a la calma','cierre')
      .replace('enfriamiento','cierre');
  }

  function asignarEtiqueta(rutina,clave,valor){
    if(clave==='dia'){rutina.dia=normalizarDia(valor);}
    if(clave==='nombre'){rutina.nombre=valor;}
    if(clave==='tipo'){rutina.tipo=valor||'Entrenamiento';}
    if(clave==='objetivo'){rutina.objetivo=valor;}
    if(clave==='duracion'){rutina.duracionMin=numero(String(valor).replace(/[^0-9.]/g,''))||0;}
    if(clave==='nivel'){rutina.nivel=valor;}
    if(clave==='equipo'){rutina.equipo=valor;}
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
    return{nombre:partes[0]||texto,series:partes[1]||'',carga:partes[2]||'',descanso:partes[3]||'',indicacion:partes[4]||''};
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
    var objetivo=tieneRutina&&item.objetivo?'<p class="enru-goal">'+esc(item.objetivo)+'</p>':'';
    var ejercicios=tieneRutina&&item.ejercicios.length?'<ol>'+item.ejercicios.slice(0,4).map(function(e){return'<li>'+esc(e.nombre)+' <span>'+esc(e.series||'')+'</span></li>';}).join('')+'</ol>':'<p class="enru-empty">Semana sin cargar.</p>';
    return '<h3>'+esc(item.dia)+'</h3><p><span class="enru-pill">'+esc(tipo)+'</span></p><p><strong>'+esc(nombre)+'</strong></p><p class="enru-duration">'+esc(duracion)+'</p>'+objetivo+ejercicios;
  }

  function seleccionarDia(dia){
    estado.diaActivo=dia;
    renderizarCalendario();
  }

  function renderizarRutinas(){
    el.rutinas.innerHTML='';
    var cargadas=estado.dias.filter(function(item){return item.rutinaCargada;});
    if(!cargadas.length){
      el.rutinas.innerHTML='<p class="enru-empty-wide">Todavía no hay semana cargada. Copia el prompt vacío, completa tus datos, genera la rutina y pega el resultado.</p>';
      return;
    }
    cargadas.forEach(function(rutina){
      var card=document.createElement('article');
      card.className='enru-routine';
      card.innerHTML='<h3>'+esc(rutina.dia+' · '+rutina.nombre)+'</h3>'+crearMeta(rutina)+crearBloque('Calentamiento',rutina.calentamiento,'actividad')+crearBloque('Ejercicios',rutina.ejercicios,'ejercicio')+crearBloque('Cierre',rutina.cierre,'actividad')+crearNotas(rutina.notas);
      el.rutinas.appendChild(card);
    });
  }

  function crearMeta(rutina){
    var datos=[rutina.tipo,(rutina.duracionMin||0)+' min',rutina.nivel,rutina.equipo].filter(Boolean).join(' · ');
    return '<p>'+esc(datos)+'</p>'+(rutina.objetivo?'<p><strong>Objetivo:</strong> '+esc(rutina.objetivo)+'</p>':'');
  }

  function crearBloque(titulo,items,tipo){
    if(!items||!items.length){return '';}
    var lis=items.map(function(item){
      if(tipo==='ejercicio'){
        var detalle=[item.series,item.carga,item.descanso,item.indicacion].filter(Boolean).join(' · ');
        return '<li><strong>'+esc(item.nombre)+'</strong> '+esc(detalle)+'</li>';
      }
      return '<li><strong>'+esc(item.nombre)+'</strong> '+esc(item.duracion||'')+'</li>';
    }).join('');
    return '<h4>'+esc(titulo)+'</h4><ul>'+lis+'</ul>';
  }

  function crearNotas(notas){
    if(!notas||!notas.length){return '';}
    return '<h4>Notas</h4><p>'+esc(notas.join(' '))+'</p>';
  }

  function formatearSemanaParaTexto(){
    var bloques=['Semana: '+estado.semana,''];
    estado.dias.forEach(function(rutina){
      if(rutina.rutinaCargada){
        bloques.push(formatearRutinaParaTexto(rutina));
        bloques.push('');
      }
    });
    return bloques.join('\n').trim();
  }

  function formatearRutinaParaTexto(rutina){
    return ['Día: '+rutina.dia,'Nombre: '+rutina.nombre,'Tipo: '+rutina.tipo,'Objetivo: '+(rutina.objetivo||''),'Duración: '+(rutina.duracionMin||0),'Nivel: '+(rutina.nivel||''),'Equipo: '+(rutina.equipo||''),'','Calentamiento:'].concat(
      rutina.calentamiento.map(function(item){return '- '+item.nombre+(item.duracion?' | '+item.duracion:'');}),
      ['','Ejercicios:'],
      rutina.ejercicios.map(function(item){return '- '+item.nombre+(item.series?' | '+item.series:'')+(item.carga?' | '+item.carga:'')+(item.descanso?' | '+item.descanso:'')+(item.indicacion?' | '+item.indicacion:'');}),
      ['','Cierre:'],
      rutina.cierre.map(function(item){return '- '+item.nombre+(item.duracion?' | '+item.duracion:'');}),
      ['','Notas:',(rutina.notas||[]).join(' ')]
    ).join('\n');
  }

  function normalizarDias(dias){
    var mapa={};
    dias.forEach(function(item){if(item&&item.dia){mapa[item.dia]=normalizarDiaRegistro(item);}});
    return DIAS.map(function(dia){return mapa[dia]||crearDiaVacio(dia);});
  }

  function normalizarDiaRegistro(item){
    return{dia:item.dia,tipo:item.tipo||'Libre',nombre:item.nombre||item.enfoque||'',objetivo:item.objetivo||'',duracionMin:numero(item.duracionMin)||0,nivel:item.nivel||'',equipo:item.equipo||'',calentamiento:Array.isArray(item.calentamiento)?item.calentamiento:[],ejercicios:Array.isArray(item.ejercicios)?item.ejercicios:[],cierre:Array.isArray(item.cierre)?item.cierre:[],notas:Array.isArray(item.notas)?item.notas:(item.nota?[item.nota]:[]),rutinaCargada:Boolean(item.rutinaCargada||item.nombre)};
  }

  function crearDiaVacio(dia){return{dia:dia,tipo:'Libre',nombre:'',objetivo:'',duracionMin:0,nivel:'',equipo:'',calentamiento:[],ejercicios:[],cierre:[],notas:[],rutinaCargada:false};}
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