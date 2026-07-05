/* =========================================================
Nombre completo: fit-fb-sync.service.js
Ruta o ubicación: src/shared/integraciones/firebase/fit-fb-sync.service.js
Función o funciones:
- Leer configuración local de Firebase.
- Reunir datos locales importantes de Fitness Jeff.
- Ejecutar respaldo usando FitFirebaseClient.
Con qué se conecta:
- fit-fb-schema.js
- fit-fb-client.service.js
- pantallas/05-ajustes/03-firebase/ajfb-main.js
========================================================= */
(function(window){
  'use strict';
  var CONFIG_KEY='fitness-jeff-ajfb-config';
  var PROFILE_KEY='fitness-jeff-ajpe-perfil';
  var DAILY_KEY='fitness-jeff-prrd-registros';
  var WATER_KEY='fitness-jeff-ayag-datos';
  var VOICE_KEY='fitness-jeff-voas-historial';
  function readJson(key){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null;}catch(error){return null;}}
  function getConfig(){var saved=readJson(CONFIG_KEY);return saved&&saved.configuracion?saved.configuracion:null;}
  function list(value){return Array.isArray(value)?value:[];}
  function collect(){
    var batches=[];
    var profile=readJson(PROFILE_KEY);
    if(profile&&profile.perfil){batches.push({collection:'perfil',records:[profile.perfil]});}
    var daily=readJson(DAILY_KEY);
    if(daily&&daily.registros){batches.push({collection:'registrosDiarios',records:list(daily.registros)});}
    var water=readJson(WATER_KEY);
    if(water&&water.registros){batches.push({collection:'hidratacion',records:list(water.registros)});}
    var voice=readJson(VOICE_KEY);
    if(voice&&voice.historial){batches.push({collection:'syncLog',records:list(voice.historial)});}
    return batches;
  }
  function syncNow(){
    var config=getConfig();
    var client=window.FitFirebaseClient;
    if(!client){return Promise.reject(new Error('Cliente Firebase no cargado.'));}
    var batches=collect();
    if(!batches.length){return Promise.resolve({ok:true,message:'No hay datos para respaldar.',batches:0});}
    return client.sendBatch(config,batches).then(function(result){return Object.assign({batches:batches.length},result||{});});
  }
  window.FitFirebaseSync={getConfig:getConfig,collect:collect,syncNow:syncNow};
})(window);
