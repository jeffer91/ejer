/* =========================================================
Nombre completo: fit-fb-sync.service.js
Ruta o ubicación: src/shared/integraciones/firebase/fit-fb-sync.service.js
Función o funciones:
- Leer configuración local de Firebase.
- Reunir datos locales importantes de Fitness Jeff por módulo.
- Ejecutar respaldo usando FitFirebaseClient.
Con qué se conecta:
- fit-fb-schema.js
- fit-fb-client.service.js
- pantallas/05-ajustes/03-firebase/ajfb-main.js
========================================================= */
(function(window){
  'use strict';
  var CONFIG_KEY='fitness-jeff-ajfb-config';
  var LOCAL_SOURCES=[
    {key:'fitness-jeff-ajpe-perfil',collection:'perfil',field:'perfil',single:true},
    {key:'fitness-jeff-prrd-datos-base',collection:'datosBase',field:'registros',tag:'datos-base'},
    {key:'fitness-jeff-prpe-registros',collection:'registrosDiarios',field:'registros',tag:'peso'},
    {key:'fitness-jeff-prme-registros',collection:'registrosDiarios',field:'registros',tag:'medidas'},
    {key:'fitness-jeff-enho-sesion',collection:'entrenamientos',field:'sesiones',tag:'entrenamiento-hoy'},
    {key:'fitness-jeff-enhi-datos',collection:'entrenamientos',field:'sesiones',tag:'hiit'},
    {key:'fitness-jeff-enru-plan',collection:'entrenamientos',field:'dias',tag:'rutinas'},
    {key:'fitness-jeff-ayay-datos',collection:'registrosDiarios',field:'registros',tag:'horarios'},
    {key:'fitness-jeff-ayag-datos',collection:'hidratacion',field:'registros',tag:'agua'},
    {key:'fitness-jeff-reag-recomendaciones',collection:'recomendaciones',field:'recomendaciones',tag:'analisis-general'},
    {key:'fitness-jeff-reen-recomendaciones',collection:'recomendaciones',field:'recomendaciones',tag:'entrenamiento'},
    {key:'fitness-jeff-real-recomendaciones',collection:'recomendaciones',field:'recomendaciones',tag:'alimentacion'},
    {key:'fitness-jeff-reha-recomendaciones',collection:'recomendaciones',field:'recomendaciones',tag:'habitos'},
    {key:'fitness-jeff-voas-historial',collection:'syncLog',field:'historial',tag:'voz-asistente'},
    {key:'fitness-jeff-vohi-historial',collection:'syncLog',field:'historial',tag:'voz-historial'},
    {key:'fitness-jeff-gemini-ultima-respuesta',collection:'recomendaciones',field:null,single:true,tag:'gemini'}
  ];
  function readJson(key){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null;}catch(error){return null;}}
  function getConfig(){var saved=readJson(CONFIG_KEY);return saved&&saved.configuracion?saved.configuracion:null;}
  function list(value){if(Array.isArray(value)){return value;}if(value&&typeof value==='object'){return [value];}return [];}
  function normalizeRecord(source,record){var output=Object.assign({},record||{});output.origen=output.origen||source.tag||source.key;output.syncKey=source.key;output.actualizadoEn=output.actualizadoEn||new Date().toISOString();return output;}
  function recordsFromSource(source){var saved=readJson(source.key);if(!saved){return [];}var value=source.field?saved[source.field]:saved;if(source.single){return value?[normalizeRecord(source,value)]:[];}return list(value).map(function(item){return normalizeRecord(source,item);});}
  function addBatch(batches,collection,records){if(!records.length){return;}var found=batches.filter(function(batch){return batch.collection===collection;})[0];if(found){found.records=found.records.concat(records);return;}batches.push({collection:collection,records:records});}
  function collect(){var batches=[];LOCAL_SOURCES.forEach(function(source){addBatch(batches,source.collection,recordsFromSource(source));});return batches;}
  function syncNow(){var config=getConfig();var client=window.FitFirebaseClient;if(!client){return Promise.reject(new Error('Cliente Firebase no cargado.'));}var batches=collect();if(!batches.length){return Promise.resolve({ok:true,message:'No hay datos para respaldar.',batches:0});}return client.sendBatch(config,batches).then(function(result){return Object.assign({batches:batches.length},result||{});});}
  window.FitFirebaseSync={getConfig:getConfig,collect:collect,syncNow:syncNow};
})(window);