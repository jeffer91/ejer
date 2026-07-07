/* =========================================================
Nombre completo: fit-gs-schema.js
Ruta o ubicación: src/shared/integraciones/google-sheets/fit-gs-schema.js
Función o funciones:
- Definir columnas para Google Sheets.
- Entregar nombres de tablas para sincronización.
Con qué se conecta:
- fit-gs-client.service.js
========================================================= */
(function(window){
  'use strict';
  var tables={
    Perfil:['id','nombre','actualizadoEn'],
    DatosBase:['id','fecha','edad','alturaCm','sexo','complexion','actividadSemanal','origen','actualizadoEn'],
    RegistrosDiarios:['id','fecha','valorKg','cinturaCm','actividad','origen','nota','actualizadoEn'],
    Entrenamientos:['id','fecha','dia','tipo','nombre','objetivo','duracionMin','nivel','equipo','origen','nota','actualizadoEn'],
    Hidratacion:['id','fecha','cantidadMl','nota','actualizadoEn'],
    Recomendaciones:['id','fecha','titulo','estado','texto','origen','actualizadoEn'],
    SyncLog:['id','fecha','accion','estado','mensaje']
  };
  function getTables(){return JSON.parse(JSON.stringify(tables));}
  function now(){return new Date().toISOString();}
  window.FitGoogleSheetsSchema={getTables:getTables,now:now};
})(window);