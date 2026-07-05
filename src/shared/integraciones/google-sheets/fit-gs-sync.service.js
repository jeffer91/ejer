/* =========================================================
Nombre completo: fit-gs-sync.service.js
Ruta o ubicación: src/shared/integraciones/google-sheets/fit-gs-sync.service.js
Función o funciones:
- Leer datos locales de la app Fitness Jeff.
- Convertirlos en lotes para Google Sheets.
- Ejecutar sincronización real usando FitGoogleSheetsClient.
Con qué se conecta:
- fit-gs-schema.js
- fit-gs-client.service.js
- pantallas/05-ajustes/02-google-sheets/ajgs-main.js
========================================================= */
(function(window){
  'use strict';
  var CONFIG_KEY='fitness-jeff-ajgs-config';
  var PROFILE_KEY='fitness-jeff-ajpe-perfil';
  var DAILY_KEY='fitness-jeff-prrd-registros';
  var WATER_KEY='fitness-jeff-ayag-datos';
  var VOICE_KEY='fitness-jeff-voas-historial';

  function readJson(key){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null;}catch(error){return null;}}
  function getConfig(){var saved=readJson(CONFIG_KEY);return saved&&saved.configuracion?saved.configuracion:null;}
  function toArray(value){return Array.isArray(value)?value:[];}

  function collect(){
    var batches=[];
    var profile=readJson(PROFILE_KEY);
    if(profile&&profile.perfil){batches.push({tableName:'Perfil',records:[profile.perfil]});}
    var daily=readJson(DAILY_KEY);
    if(daily&&daily.registros){batches.push({tableName:'RegistrosDiarios',records:toArray(daily.registros)});}
    var water=readJson(WATER_KEY);
    if(water&&water.registros){batches.push({tableName:'Hidratacion',records:toArray(water.registros)});}
    var voice=readJson(VOICE_KEY);
    if(voice&&voice.historial){batches.push({tableName:'SyncLog',records:toArray(voice.historial)});}
    return batches;
  }

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
