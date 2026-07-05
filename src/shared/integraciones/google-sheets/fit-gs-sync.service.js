/* =========================================================
Nombre completo: fit-gs-sync.service.js
Ruta o ubicación: src/shared/integraciones/google-sheets/fit-gs-sync.service.js
Función o funciones:
- Leer datos locales de la app Fitness Jeff.
- Convertirlos en lotes organizados para Google Sheets.
- Ejecutar sincronización real usando FitGoogleSheetsClient.
Con qué se conecta:
- fit-gs-schema.js
- fit-gs-client.service.js
- pantallas/05-ajustes/02-google-sheets/ajgs-main.js
========================================================= */
(function(window){
  'use strict';
  var CONFIG_KEY='fitness-jeff-ajgs-config';
  var LOCAL_SOURCES=[
    {key:'fitness-jeff-ajpe-perfil',tableName:'Perfil',field:'perfil',single:true},
    {key:'fitness-jeff-prpe-registros',tableName:'RegistrosDiarios',field:'registros',tag:'peso'},
    {key:'fitness-jeff-prme-registros',tableName:'RegistrosDiarios',field:'registros',tag:'medidas'},
    {key:'fitness-jeff-prrd-registros',tableName:'RegistrosDiarios',field:'registros',tag:'registro-diario'},
    {key:'fitness-jeff-enho-sesion',tableName:'Entrenamientos',field:'sesiones',tag:'entrenamiento-hoy'},
    {key:'fitness-jeff-enhi-datos',tableName:'Entrenamientos',field:'sesiones',tag:'hiit'},
    {key:'fitness-jeff-enru-plan',tableName:'Entrenamientos',field:'plan',tag:'rutinas'},
    {key:'fitness-jeff-ayay-datos',tableName:'RegistrosDiarios',field:'registros',tag:'horarios'},
    {key:'fitness-jeff-ayag-datos',tableName:'Hidratacion',field:'registros',tag:'agua'},
    {key:'fitness-jeff-reag-recomendaciones',tableName:'Recomendaciones',field:'recomendaciones',tag:'analisis-general'},
    {key:'fitness-jeff-reen-recomendaciones',tableName:'Recomendaciones',field:'recomendaciones',tag:'entrenamiento'},
    {key:'fitness-jeff-real-recomendaciones',tableName:'Recomendaciones',field:'recomendaciones',tag:'alimentacion'},
    {key:'fitness-jeff-reha-recomendaciones',tableName:'Recomendaciones',field:'recomendaciones',tag:'habitos'},
    {key:'fitness-jeff-voas-historial',tableName:'SyncLog',field:'historial',tag:'voz-asistente'},
    {key:'fitness-jeff-vohi-historial',tableName:'SyncLog',field:'historial',tag:'voz-historial'},
    {key:'fitness-jeff-gemini-ultima-respuesta',tableName:'Recomendaciones',field:null,single:true,tag:'gemini'}
  ];
  function readJson(key){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null;}catch(error){return null;}}
  function getConfig(){var saved=readJson(CONFIG_KEY);return saved&&saved.configuracion?saved.configuracion:null;}
  function list(value){if(Array.isArray(value)){return value;}if(value&&typeof value==='object'){return [value];}return [];}
  function normalizeRecord(source,record){var output=Object.assign({},record||{});output.origen=output.origen||source.tag||source.key;output.syncKey=source.key;output.actualizadoEn=output.actualizadoEn||new Date().toISOString();return output;}
  function recordsFromSource(source){
    var saved=readJson(source.key);
    if(!saved){return [];}
    var value=source.field?saved[source.field]:saved;
    if(source.single){value=source.field?saved[source.field]:saved;return value?[normalizeRecord(source,value)]:[];}
    return list(value).map(function(item){return normalizeRecord(source,item);});
  }
  function addBatch(batches,tableName,records){if(!records.length){return;}var found=batches.filter(function(batch){return batch.tableName===tableName;})[0];if(found){found.records=found.records.concat(records);return;}batches.push({tableName:tableName,records:records});}
  function collect(){var batches=[];LOCAL_SOURCES.forEach(function(source){addBatch(batches,source.tableName,recordsFromSource(source));});return batches;}
  function syncNow(){
    var config=getConfig();
    if(!config||!config.webAppUrl){return Promise.reject(new Error('Configura la URL de Apps Script.'));}
    var client=window.FitGoogleSheetsClient;
    if(!client){return Promise.reject(new Error('Cliente Google Sheets no cargado.'));}
    var batches=collect();
    if(!batches.length){return Promise.resolve({ok:true,message:'No hay datos locales para enviar.',batches:0});}
    return client.batchAppend(config.webAppUrl,batches).then(function(result){return Object.assign({batches:batches.length},result||{});});
  }
  window.FitGoogleSheetsSync={getConfig:getConfig,collect:collect,syncNow:syncNow};
})(window);
