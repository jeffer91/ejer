/* =========================================================
Nombre completo: fit-fb-schema.js
Ruta o ubicación: src/shared/integraciones/firebase/fit-fb-schema.js
Función o funciones:
- Definir colecciones oficiales para Firebase.
- Preparar documentos básicos para respaldo.
- Exponer utilidades globales en window.FitFirebaseSchema.
Con qué se conecta:
- fit-fb-client.service.js
- fit-fb-sync.service.js
========================================================= */
(function(window){
  'use strict';
  var collections=['perfil','registrosDiarios','entrenamientos','hidratacion','recomendaciones','syncPendiente','syncLog'];
  function getCollections(){return collections.slice();}
  function now(){return new Date().toISOString();}
  function makeId(prefix){return String(prefix||'doc')+'-'+Date.now()+'-'+Math.random().toString(16).slice(2,8);}
  function clean(value){
    if(value===undefined||value===null){return '';}
    if(typeof value==='number'||typeof value==='boolean'||typeof value==='string'){return value;}
    try{return JSON.stringify(value);}catch(error){return String(value);}
  }
  function normalize(collection,item){var out=Object.assign({},item||{});out.id=out.id||makeId(collection);out.actualizadoEn=out.actualizadoEn||now();out.origen=out.origen||'Fitness Jeff';return out;}
  window.FitFirebaseSchema={getCollections:getCollections,now:now,makeId:makeId,clean:clean,normalize:normalize};
})(window);
