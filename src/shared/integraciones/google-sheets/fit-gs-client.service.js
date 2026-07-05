/* =========================================================
Nombre completo: fit-gs-client.service.js
Ruta o ubicación: src/shared/integraciones/google-sheets/fit-gs-client.service.js
Función o funciones:
- Enviar datos a Apps Script mediante fetch.
- Probar conexión real con Google Sheets.
- Detectar respuestas inválidas o errores devueltos por Apps Script.
Con qué se conecta:
- fit-gs-schema.js
- fit-gs-sync.service.js
========================================================= */
(function(window){
  'use strict';
  function post(url,payload){
    if(!url){return Promise.reject(new Error('URL faltante.'));}
    return fetch(url,{method:'POST',body:JSON.stringify(payload||{})}).then(function(res){
      return res.text().then(function(text){
        var data={};
        try{data=JSON.parse(text||'{}');}catch(error){throw new Error('Respuesta no válida de Apps Script.');}
        if(!res.ok||data.ok===false){throw new Error(data.message||'Error en Apps Script.');}
        return data;
      });
    });
  }
  function ping(url){return post(url,{action:'ping',app:'Fitness Jeff'});}
  function setup(url,tables){return post(url,{action:'setup',tables:tables||{}});}
  function append(url,tableName,records){return post(url,{action:'append',tableName:tableName,records:records||[]});}
  function batchAppend(url,batches){return post(url,{action:'batchAppend',batches:batches||[]});}
  window.FitGoogleSheetsClient={post:post,ping:ping,setup:setup,append:append,batchAppend:batchAppend};
})(window);
