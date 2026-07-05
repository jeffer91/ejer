/* =========================================================
Nombre completo: fit-gs-webapp.gs
Ruta o ubicación: src/shared/integraciones/google-sheets/apps-script/fit-gs-webapp.gs
Función o funciones:
- Recibir datos enviados desde Fitness Jeff por Apps Script.
- Crear hojas si no existen.
- Agregar filas en Google Sheets.
Con qué se conecta:
- fit-gs-client.service.js
- fit-gs-sync.service.js
========================================================= */
function doPost(e){
  try{
    var payload=JSON.parse(e.postData.contents || '{}');
    var action=payload.action || '';
    if(action==='ping'){return jsonOutput({ok:true,message:'Google Sheets activo'});}
    if(action==='setup'){return setupTables(payload.tables || {});}
    if(action==='append'){return appendRows(payload.tableName,payload.records || []);}
    if(action==='batchAppend'){return batchAppend(payload.batches || []);}
    return jsonOutput({ok:false,message:'Acción no reconocida'});
  }catch(error){
    return jsonOutput({ok:false,message:String(error)});
  }
}

function setupTables(tables){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(tables).forEach(function(name){
    var sheet=ss.getSheetByName(name) || ss.insertSheet(name);
    if(sheet.getLastRow()===0){sheet.appendRow(tables[name]);}
  });
  return jsonOutput({ok:true,message:'Tablas listas'});
}

function appendRows(tableName,records){
  if(!tableName){return jsonOutput({ok:false,message:'Tabla faltante'});}
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var sheet=ss.getSheetByName(tableName) || ss.insertSheet(tableName);
  records.forEach(function(record){sheet.appendRow(objectToRow(record));});
  return jsonOutput({ok:true,message:'Filas agregadas',count:records.length});
}

function batchAppend(batches){
  var total=0;
  batches.forEach(function(batch){
    var records=batch.records || [];
    appendRows(batch.tableName,records);
    total+=records.length;
  });
  return jsonOutput({ok:true,message:'Lotes agregados',count:total});
}

function objectToRow(record){
  return Object.keys(record).map(function(key){return record[key];});
}

function jsonOutput(data){
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
