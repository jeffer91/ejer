/* =========================================================
Nombre completo: fit-shell-main.js
Ruta o ubicación: src/app/fit-shell-main.js
Función o funciones:
- Manejar el menú superior de la app.
- Abrir subpantallas independientes dentro del iframe principal.
- Compactar los títulos superiores de todas las subpantallas.
- Limpiar textos de prueba para que la app se vea en modo funcional.
Con qué se conecta:
- src/index.html
- src/app/fit-shell.css
========================================================= */
(function(){
  'use strict';

  var frame=document.getElementById('fit-shell-frame');
  var menuButtons=Array.prototype.slice.call(document.querySelectorAll('.fit-shell-menu-button'));
  var submenus=Array.prototype.slice.call(document.querySelectorAll('.fit-shell-submenu'));

  iniciarShell();

  function iniciarShell(){
    conectarMenus();
    conectarOpcionesSubmenu();
    conectarAjustesVisualesIframe();
    marcarMenuActivo('progreso');
  }

  function conectarMenus(){
    menuButtons.forEach(function(button){
      button.addEventListener('click',function(){
        var menu=button.getAttribute('data-menu');
        alternarSubmenu(menu);
      });
    });

    document.addEventListener('click',function(event){
      var hizoClickDentroMenu=event.target.closest('.fit-shell-menu-item');
      if(!hizoClickDentroMenu){
        cerrarSubmenus();
      }
    });
  }

  function conectarOpcionesSubmenu(){
    var opciones=Array.prototype.slice.call(document.querySelectorAll('.fit-shell-submenu button'));
    opciones.forEach(function(opcion){
      opcion.addEventListener('click',function(){
        var ruta=opcion.getAttribute('data-screen');
        var pendiente=opcion.getAttribute('data-pending')==='true';
        if(pendiente){
          cerrarSubmenus();
          return;
        }
        if(ruta){
          frame.setAttribute('src',ruta);
          marcarMenuActivoPorOpcion(opcion);
          cerrarSubmenus();
        }
      });
    });
  }

  function conectarAjustesVisualesIframe(){
    if(!frame){
      return;
    }
    frame.addEventListener('load',function(){
      aplicarAjustesVisualesIframe();
    });
  }

  function aplicarAjustesVisualesIframe(){
    try{
      var doc=frame.contentDocument||frame.contentWindow.document;
      if(!doc||!doc.body||doc.__fitnessJeffAjustesVisuales){
        return;
      }
      doc.__fitnessJeffAjustesVisuales=true;
      inyectarEstiloCompacto(doc);
      compactarTitulosSuperiores(doc);
      limpiarTextosEnNodo(doc.body);
      observarCambiosDeTexto(doc);
    }catch(error){
      console.warn('No se pudieron aplicar ajustes visuales:',error);
    }
  }

  function inyectarEstiloCompacto(doc){
    if(doc.getElementById('fitness-jeff-titulos-compactos')){
      return;
    }
    var style=doc.createElement('style');
    style.id='fitness-jeff-titulos-compactos';
    style.textContent=[
      'section[class*="-hero"]{padding:10px 14px!important;margin-bottom:12px!important;min-height:0!important;align-items:center!important;gap:10px!important;border-radius:16px!important;box-shadow:0 8px 20px rgba(15,23,42,.05)!important;}',
      'section[class*="-hero"]>div:first-child{min-width:0!important;}',
      'section[class*="-hero"] h1{margin:0!important;font-size:15px!important;line-height:1.2!important;font-weight:800!important;color:#2563eb!important;letter-spacing:.01em!important;}',
      'section[class*="-hero"] [class$="-eyebrow"],section[class*="-hero"] [class$="-subtitle"],section[class*="-hero"] [class$="-mode"]{display:none!important;}',
      'section[class*="-hero"] p{margin:0!important;}',
      '@media(max-width:900px){section[class*="-hero"]{padding:10px 12px!important;margin-bottom:10px!important;}}'
    ].join('\n');
    doc.head.appendChild(style);
  }

  function compactarTitulosSuperiores(doc){
    var heroes=Array.prototype.slice.call(doc.querySelectorAll('section[class*="-hero"]'));
    heroes.forEach(function(hero){
      var h1=hero.querySelector('h1');
      if(h1){
        return;
      }
      var titulo=obtenerTituloCompacto(hero,doc);
      if(!titulo){
        return;
      }
      var contenedor=hero.querySelector('div')||hero;
      h1=doc.createElement('h1');
      h1.textContent=titulo;
      contenedor.insertBefore(h1,contenedor.firstChild);
    });
  }

  function obtenerTituloCompacto(hero,doc){
    var texto='';
    var etiqueta=hero.querySelector('[class$="-eyebrow"]');
    if(etiqueta){
      texto=etiqueta.textContent||'';
    }
    if(!texto&&doc.title){
      texto=doc.title;
    }
    if(texto.indexOf('/')!==-1){
      var partes=texto.split('/');
      texto=partes[partes.length-1];
    }
    return texto.trim();
  }

  function observarCambiosDeTexto(doc){
    var MutationObserver=frame.contentWindow&&frame.contentWindow.MutationObserver;
    if(!MutationObserver){
      return;
    }
    var observador=new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        if(mutation.type==='characterData'){
          limpiarNodoTexto(mutation.target);
        }
        if(mutation.type==='attributes'){
          limpiarAtributosElemento(mutation.target);
        }
        Array.prototype.slice.call(mutation.addedNodes||[]).forEach(function(nodo){
          limpiarTextosEnNodo(nodo);
        });
      });
      compactarTitulosSuperiores(doc);
    });
    observador.observe(doc.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','value','title','aria-label']});
  }

  function limpiarTextosEnNodo(nodo){
    if(!nodo){
      return;
    }
    var doc=nodo.ownerDocument||document;
    var win=doc.defaultView||window;
    if(nodo.nodeType===win.Node.TEXT_NODE){
      limpiarNodoTexto(nodo);
      return;
    }
    if(nodo.nodeType!==win.Node.ELEMENT_NODE&&nodo.nodeType!==win.Node.DOCUMENT_FRAGMENT_NODE){
      return;
    }
    if(nodo.nodeType===win.Node.ELEMENT_NODE){
      limpiarAtributosElemento(nodo);
    }
    var elementos=nodo.querySelectorAll?Array.prototype.slice.call(nodo.querySelectorAll('*')):[];
    elementos.forEach(limpiarAtributosElemento);
    var walker=doc.createTreeWalker(nodo,win.NodeFilter.SHOW_TEXT,null);
    var textos=[];
    while(walker.nextNode()){
      textos.push(walker.currentNode);
    }
    textos.forEach(limpiarNodoTexto);
  }

  function limpiarAtributosElemento(elemento){
    ['placeholder','value','title','aria-label'].forEach(function(atributo){
      if(elemento.hasAttribute&&elemento.hasAttribute(atributo)){
        var actual=elemento.getAttribute(atributo);
        var limpio=normalizarTextoPrueba(actual);
        if(limpio!==actual){
          elemento.setAttribute(atributo,limpio);
        }
      }
    });
  }

  function limpiarNodoTexto(nodoTexto){
    var limpio=normalizarTextoPrueba(nodoTexto.nodeValue);
    if(limpio!==nodoTexto.nodeValue){
      nodoTexto.nodeValue=limpio;
    }
  }

  function normalizarTextoPrueba(texto){
    return String(texto)
      .replace(/Semana\s+demo/gi,'Semana actual')
      .replace(/Modo\s+demo\s+interno/gi,'Modo funcional')
      .replace(/Modo\s+demo\s+restaurado/gi,'Datos restablecidos')
      .replace(/Modo\s+demo/gi,'Modo funcional')
      .replace(/Datos\s+demo/gi,'Datos locales')
      .replace(/Registro\s+demo/gi,'Registro local')
      .replace(/Restaurar\s+demo/gi,'Restablecer datos')
      .replace(/\bdemo\b/gi,'actual');
  }

  function alternarSubmenu(menu){
    var submenuActual=document.querySelector('[data-submenu="'+menu+'"]');
    var estabaAbierto=submenuActual&&submenuActual.classList.contains('fit-shell-open');
    cerrarSubmenus();
    if(submenuActual&&!estabaAbierto){
      submenuActual.classList.add('fit-shell-open');
      marcarMenuActivo(menu);
    }
  }

  function cerrarSubmenus(){
    submenus.forEach(function(submenu){
      submenu.classList.remove('fit-shell-open');
    });
  }

  function marcarMenuActivo(menu){
    menuButtons.forEach(function(button){
      var esActivo=button.getAttribute('data-menu')===menu;
      button.classList.toggle('fit-shell-active',esActivo);
    });
  }

  function marcarMenuActivoPorOpcion(opcion){
    var contenedor=opcion.closest('.fit-shell-menu-item');
    var boton=contenedor?contenedor.querySelector('.fit-shell-menu-button'):null;
    if(!boton){
      return;
    }
    marcarMenuActivo(boton.getAttribute('data-menu'));
  }
})();