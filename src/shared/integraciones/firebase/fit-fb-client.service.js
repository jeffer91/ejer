/* =========================================================
Nombre completo: fit-fb-client.service.js
Ruta o ubicación: src/shared/integraciones/firebase/fit-fb-client.service.js
Función o funciones:
- Cargar Firebase SDK desde CDN cuando haya internet.
- Probar conexión real con Firestore.
- Guardar documentos por lotes en colecciones de Firebase.
Con qué se conecta:
- fit-fb-schema.js
- fit-fb-sync.service.js
========================================================= */
(function(window){
  'use strict';
  var sdkPromise=null;
  var appCache={};

  function ready(config){return Boolean(config&&config.apiKey&&config.projectId&&config.authDomain&&config.appId);}
  function loadSdk(){
    if(sdkPromise){return sdkPromise;}
    sdkPromise=Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(mods){return{app:mods[0],db:mods[1]};});
    return sdkPromise;
  }
  function getApp(config,sdk){
    var name='fitness-jeff-'+config.projectId;
    if(appCache[name]){return appCache[name];}
    var existing=sdk.app.getApps().filter(function(item){return item.name===name;})[0];
    appCache[name]=existing||sdk.app.initializeApp({apiKey:config.apiKey,authDomain:config.authDomain,projectId:config.projectId,storageBucket:config.storageBucket,appId:config.appId},name);
    return appCache[name];
  }
  function normalizeRecord(collection,record){
    var schema=window.FitFirebaseSchema;
    return schema?schema.normalize(collection,record):Object.assign({},record||{});
  }
  function ping(config){
    if(!ready(config)){return Promise.reject(new Error('Configuración Firebase incompleta.'));}
    return loadSdk().then(function(sdk){
      var app=getApp(config,sdk);
      var db=sdk.db.getFirestore(app);
      var id='ping-'+Date.now();
      return sdk.db.setDoc(sdk.db.doc(db,'syncLog',id),{id:id,fecha:new Date().toISOString(),accion:'ping',estado:'ok',mensaje:'Firebase conectado',origen:'Fitness Jeff'},{merge:true});
    }).then(function(){return{ok:true,message:'Firebase conectado y Firestore respondió.'};});
  }
  function sendBatch(config,batches){
    if(!ready(config)){return Promise.reject(new Error('Configuración Firebase incompleta.'));}
    return loadSdk().then(function(sdk){
      var app=getApp(config,sdk);
      var db=sdk.db.getFirestore(app);
      var batch=sdk.db.writeBatch(db);
      var total=0;
      (batches||[]).forEach(function(group){
        var collection=group.collection||'syncLog';
        (group.records||[]).forEach(function(record){
          var docData=normalizeRecord(collection,record);
          var ref=sdk.db.doc(db,collection,String(docData.id));
          batch.set(ref,docData,{merge:true});
          total+=1;
        });
      });
      return batch.commit().then(function(){return{ok:true,message:'Respaldo enviado a Firebase.',count:total,batches:(batches||[]).length};});
    });
  }
  window.FitFirebaseClient={ready:ready,ping:ping,sendBatch:sendBatch};
})(window);
