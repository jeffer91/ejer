/* =========================================================
Nombre completo: fit-gm-prompts.js
Ruta o ubicación: src/shared/integraciones/gemini/fit-gm-prompts.js
Función o funciones:
- Definir prompts seguros para recomendaciones con Gemini.
- Preparar instrucciones de salida en JSON.
- Exponer utilidades globales en window.FitGeminiPrompts.
Con qué se conecta:
- fit-gm-client.service.js
- fit-gm-recommendations.service.js
========================================================= */
(function(window){
  'use strict';
  var SYSTEM_PROMPT=[
    'Eres un asistente para una app personal de bienestar.',
    'Da recomendaciones breves, prudentes y sostenibles.',
    'No des dietas estrictas, retos extremos, comparaciones corporales ni promesas irreales.',
    'Si faltan datos, recomienda registrar mejor antes de decidir.',
    'Devuelve solo JSON válido.'
  ].join(' ');
  function buildInput(data){
    return [
      'Analiza estos datos locales de Fitness Jeff y genera 3 recomendaciones prudentes.',
      'Formato JSON: {"recomendaciones":[{"titulo":"","prioridad":"Alta|Media|Baja","categoria":"","explicacion":"","accionSugerida":""}]}',
      'Datos:',
      JSON.stringify(data||{})
    ].join('\n');
  }
  window.FitGeminiPrompts={systemPrompt:SYSTEM_PROMPT,buildInput:buildInput};
})(window);
