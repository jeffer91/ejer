/* =========================================================
Nombre completo: fit-gm-recommendations.service.js
Ruta o ubicación: src/shared/integraciones/gemini/fit-gm-recommendations.service.js
Función o funciones:
- Reunir datos locales de Fitness Jeff.
- Pedir recomendaciones reales a Gemini.
- Guardar la última respuesta de Gemini en localStorage.
Con qué se conecta:
- fit-gm-prompts.js
- fit-gm-client.service.js
- pantallas/05-ajustes/04-gemini/ajgm-main.js
========================================================= */
(function(window){
  'use strict';
  var CONFIG_KEY='fitness-jeff-ajgm-config';
  var LAST_KEY='fitness-jeff-gemini-ultima-respuesta';
  var KEYS=['fitness-jeff-ajpe-perfil','fitness-jeff-prrd-registros','fitness-jeff-enho-sesion','fitness-jeff-ayag-datos','fitness-jeff-reha-recomendaciones'];
  function readJson(key){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null;}catch(error){return null;}}
  function getConfig(){var saved=readJson(CONFIG_KEY);return saved&&saved.configuracion?saved.configuracion:null;}
  function collect(){var data={};KEYS.forEach(function(key){data[key]=readJson(key)||null;});return data;}
  function generate(){
    var config=getConfig();
    if(!config){return Promise.reject(new Error('Configura Gemini primero.'));}
    var prompts=window.FitGeminiPrompts;
    var client=window.FitGeminiClient;
    if(!prompts||!client){return Promise.reject(new Error('Servicios Gemini no cargados.'));}
    var input=prompts.buildInput(collect());
    return client.call(config,input,prompts.systemPrompt).then(function(raw){var text=client.getText(raw);var saved={fecha:new Date().toISOString(),texto:text,raw:raw};localStorage.setItem(LAST_KEY,JSON.stringify(saved));return saved;});
  }
  window.FitGeminiRecommendations={getConfig:getConfig,collect:collect,generate:generate};
})(window);
