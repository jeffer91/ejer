/* =========================================================
Nombre completo: fit-shell-main.js
Ruta o ubicación: src/app/fit-shell-main.js
Función o funciones:
- Manejar el menú superior de la app.
- Abrir subpantallas independientes dentro del iframe principal.
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
    conectarSanitizadorVisual();
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

  function conectarSanitizadorVisual(){
    if(!frame){
      return;
    }
    frame.addEventListener('load',function(){
      limpiarTextosPruebaEnIframe();
    });
  }

  function limpiarTextosPruebaEnIframe(){
    try{
      var doc=frame.contentDocument||frame.contentWindow.document;
      if(!doc||!doc.body||doc.__fitnessJeffSinTextosPrueba){
        return;
      }
      doc.__fitnessJeffSinTextosPrueba=true;
      limpiarTextosEnNodo(doc.body);
      observarCambiosDeTexto(doc);
    }catch(error){
      console.warn('No se pudo limpiar textos de prueba:',error);
    }
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