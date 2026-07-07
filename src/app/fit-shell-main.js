/* =========================================================
Nombre completo: fit-shell-main.js
Ruta o ubicación: src/app/fit-shell-main.js
Función o funciones:
- Manejar el menú superior de la app.
- Abrir subpantallas independientes dentro del iframe principal.
- Compactar los títulos superiores de todas las subpantallas.
- Inyectar tema visual tecnológico y colorido en todas las subpantallas.
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
      doc.body.classList.add('fj-tech-theme');
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
      ':root{--fj-primary:#2563eb;--fj-cyan:#06b6d4;--fj-violet:#7c3aed;--fj-emerald:#10b981;--fj-amber:#f59e0b;--fj-rose:#f43f5e;--fj-text:#101828;--fj-muted:#667085;--fj-line:rgba(148,163,184,.34);--fj-shadow:0 18px 46px rgba(15,23,42,.12);}',
      'body.fj-tech-theme{background:radial-gradient(circle at 10% 8%,rgba(37,99,235,.14),transparent 28%),radial-gradient(circle at 90% 12%,rgba(124,58,237,.13),transparent 25%),radial-gradient(circle at 55% 92%,rgba(6,182,212,.13),transparent 28%),linear-gradient(135deg,#f8fbff 0%,#eef4ff 45%,#fff7ed 100%)!important;color:var(--fj-text)!important;}',
      'body.fj-tech-theme main[class*="-page"]{padding-top:14px!important;}',
      'body.fj-tech-theme section[class*="-hero"]{padding:10px 14px!important;margin-bottom:12px!important;min-height:0!important;align-items:center!important;gap:10px!important;border-radius:18px!important;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(232,240,255,.92))!important;border:1px solid rgba(37,99,235,.14)!important;box-shadow:0 12px 30px rgba(37,99,235,.09)!important;}',
      'body.fj-tech-theme section[class*="-hero"]>div:first-child{min-width:0!important;}',
      'body.fj-tech-theme section[class*="-hero"] h1{margin:0!important;font-size:16px!important;line-height:1.2!important;font-weight:900!important;color:var(--fj-text)!important;letter-spacing:.01em!important;}',
      'body.fj-tech-theme section[class*="-hero"] h1:before,body.fj-tech-theme [class*="-titlebar"] h1:before{content:"";display:inline-block;width:10px;height:10px;margin-right:8px;border-radius:999px;background:linear-gradient(135deg,var(--fj-primary),var(--fj-cyan));box-shadow:0 0 0 5px rgba(37,99,235,.10);vertical-align:middle;}',
      'body.fj-tech-theme section[class*="-hero"] [class$="-eyebrow"],body.fj-tech-theme section[class*="-hero"] [class$="-subtitle"],body.fj-tech-theme section[class*="-hero"] [class$="-mode"]{display:none!important;}',
      'body.fj-tech-theme [class*="-titlebar"]{background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(238,246,255,.94))!important;border:1px solid rgba(37,99,235,.16)!important;border-left:6px solid var(--fj-primary)!important;box-shadow:0 12px 30px rgba(37,99,235,.10)!important;}',
      'body.fj-tech-theme [class*="-titlebar"] span{background:linear-gradient(135deg,rgba(37,99,235,.11),rgba(6,182,212,.12))!important;color:var(--fj-primary)!important;}',
      'body.fj-tech-theme article[class*="-card"],body.fj-tech-theme section[class*="-card"]{position:relative!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,251,255,.96))!important;border:1px solid var(--fj-line)!important;box-shadow:var(--fj-shadow)!important;}',
      'body.fj-tech-theme article[class*="-card"]:before,body.fj-tech-theme section[class*="-card"]:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--fj-primary),var(--fj-cyan),var(--fj-violet),var(--fj-emerald));opacity:.92;}',
      'body.fj-tech-theme article[class*="-card-main"],body.fj-tech-theme section[class*="-card-main"]{background:linear-gradient(135deg,rgba(37,99,235,.13),rgba(6,182,212,.10),rgba(255,255,255,.95))!important;border-color:rgba(37,99,235,.22)!important;}',
      'body.fj-tech-theme [class*="-label"]{display:inline-flex!important;align-items:center!important;gap:6px!important;border-radius:999px!important;padding:5px 9px!important;background:rgba(37,99,235,.09)!important;color:#1d4ed8!important;font-size:11px!important;letter-spacing:.05em!important;}',
      'body.fj-tech-theme [class*="-label"]:before{content:"";width:7px;height:7px;border-radius:999px;background:var(--fj-cyan);box-shadow:0 0 0 4px rgba(6,182,212,.12);}',
      'body.fj-tech-theme [class*="-card"] strong{color:var(--fj-text)!important;text-shadow:0 1px 0 rgba(255,255,255,.7);}',
      'body.fj-tech-theme [class*="-pill"]{background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(6,182,212,.13))!important;color:#1d4ed8!important;border:1px solid rgba(37,99,235,.12)!important;}',
      'body.fj-tech-theme button{box-shadow:0 10px 22px rgba(37,99,235,.12);transition:transform .16s ease,box-shadow .16s ease,filter .16s ease;}',
      'body.fj-tech-theme button:hover{transform:translateY(-1px);filter:brightness(.98);}',
      'body.fj-tech-theme form button:not([class*="light"]):not([class*="secondary"]),body.fj-tech-theme [class*="actions"] button:first-child{background:linear-gradient(135deg,var(--fj-primary),var(--fj-cyan))!important;color:#fff!important;}',
      'body.fj-tech-theme input,body.fj-tech-theme textarea,body.fj-tech-theme select{background:rgba(255,255,255,.92)!important;border:1px solid rgba(148,163,184,.38)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)!important;}',
      'body.fj-tech-theme input:focus,body.fj-tech-theme textarea:focus,body.fj-tech-theme select:focus{border-color:rgba(37,99,235,.55)!important;box-shadow:0 0 0 4px rgba(37,99,235,.12)!important;}',
      'body.fj-tech-theme table{background:#fff!important;border-radius:16px!important;overflow:hidden!important;}',
      'body.fj-tech-theme th{background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(6,182,212,.08))!important;color:#1d4ed8!important;}',
      'body.fj-tech-theme td{background:rgba(255,255,255,.74)!important;}',
      'body.fj-tech-theme svg{filter:drop-shadow(0 8px 16px rgba(37,99,235,.10));}',
      'body.fj-tech-theme article[class*="-day"],body.fj-tech-theme [class*="-routine"],body.fj-tech-theme [class*="-format-box"]{background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,251,255,.96))!important;border:1px solid rgba(148,163,184,.34)!important;box-shadow:0 10px 26px rgba(15,23,42,.07)!important;}',
      'body.fj-tech-theme article[class*="-day"]:hover,body.fj-tech-theme article[class*="-day-active"]{border-color:rgba(37,99,235,.55)!important;box-shadow:0 0 0 4px rgba(37,99,235,.12),0 14px 30px rgba(37,99,235,.14)!important;}',
      'body.fj-tech-theme [class*="-message"]{border-radius:12px!important;padding:9px 11px!important;background:rgba(16,185,129,.09)!important;border:1px solid rgba(16,185,129,.18)!important;color:#047857!important;}',
      'body.fj-tech-theme [class*="-error"]{background:rgba(244,63,94,.08)!important;border-color:rgba(244,63,94,.18)!important;color:#be123c!important;}',
      '@media(max-width:900px){body.fj-tech-theme section[class*="-hero"]{padding:10px 12px!important;margin-bottom:10px!important;}}'
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