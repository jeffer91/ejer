/* =========================================================
Nombre completo: fit-fb-client.service.js
Ruta o ubicación: src/shared/integraciones/firebase/fit-fb-client.service.js
Función o funciones:
- Preparar cliente de respaldo Firebase.
- Validar configuración mínima.
- Exponer funciones base para el servicio de sincronización.
Con qué se conecta:
- fit-fb-schema.js
- fit-fb-sync.service.js
========================================================= */
(function(window){
  'use strict';
  function ready(config){return Boolean(config&&config.projectId&&config.authDomain);}
  function ping(config){return Promise.resolve({ok:ready(config),message:ready(config)?'Firebase listo':'Firebase incompleto'});}
  function sendBatch(config,batches){if(!ready(config)){return Promise.reject(new Error('Firebase incompleto.'));}return Promise.resolve({ok:true,message:'Lotes Firebase preparados',batches:(batches||[]).length});}
  window.FitFirebaseClient={ready:ready,ping:ping,sendBatch:sendBatch};
})(window);
