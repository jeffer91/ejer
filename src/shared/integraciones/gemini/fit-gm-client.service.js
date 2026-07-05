/* =========================================================
Nombre completo: fit-gm-client.service.js
Ruta o ubicación: src/shared/integraciones/gemini/fit-gm-client.service.js
Función o funciones:
- Enviar solicitudes REST a Gemini Interactions API.
- Probar conexión real con el modelo configurado.
- Extraer texto de respuesta para la app.
Con qué se conecta:
- fit-gm-prompts.js
- fit-gm-recommendations.service.js
========================================================= */
(function(window){
  'use strict';
  var ENDPOINT='https://generativelanguage.googleapis.com/v1beta/interactions';
  function call(config,input,systemPrompt){
    if(!config||!config.apiKey){return Promise.reject(new Error('API Key faltante.'));}
    if(!config.modelo){return Promise.reject(new Error('Modelo faltante.'));}
    return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':config.apiKey},body:JSON.stringify({model:config.modelo,input:input,system_instruction:systemPrompt||'',generation_config:{temperature:Number(config.temperatura||0.4)}})}).then(function(res){return res.text().then(function(text){var data={};try{data=JSON.parse(text||'{}');}catch(error){throw new Error('Respuesta Gemini no válida.');}if(!res.ok){throw new Error(data.error&&data.error.message?data.error.message:'Error Gemini');}return data;});});
  }
  function getText(data){return data&&data.output_text?data.output_text:JSON.stringify(data||{});}
  function ping(config){return call(config,'Responde solo: OK','Responde de forma mínima.').then(function(data){return{ok:true,message:getText(data),raw:data};});}
  window.FitGeminiClient={call:call,ping:ping,getText:getText};
})(window);
