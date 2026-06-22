# CHECKLIST DE PRUEBAS - FITJEFF

## 1. Prueba de arranque en Live Server

- [ ] Abrir el proyecto en VS Code.
- [ ] Abrir `index.html`.
- [ ] Ejecutar **Open with Live Server**.
- [ ] Ver pantalla principal sin error rojo.
- [ ] Revisar consola.
- [ ] Confirmar mensaje: `FitJeff diagnóstico de arranque OK`.

Resultado esperado:

```txt
La app abre en Inicio.
El menú aparece arriba.
No hay error de imports faltantes.
```

## 2. Prueba de navegación

- [ ] Clic en Inicio.
- [ ] Clic en Entrenar.
- [ ] Clic en Peso.
- [ ] Clic en Estadísticas.
- [ ] Clic en Recomendaciones.
- [ ] Clic en Ajustes.

Resultado esperado:

```txt
Cada pantalla carga sin recargar la página.
El botón activo del menú se marca correctamente.
La última vista queda guardada.
```

## 3. Prueba de entrenamiento

- [ ] Entrar en Entrenar.
- [ ] Seleccionar Día 1.
- [ ] Llenar algunas series.
- [ ] Marcar fallo técnico en una serie.
- [ ] Guardar entrenamiento.
- [ ] Confirmar mensaje de guardado.
- [ ] Volver a Inicio.

Resultado esperado:

```txt
El entrenamiento queda guardado localmente.
El próximo día sugerido cambia.
Estadísticas empiezan a mostrar datos.
```

## 4. Prueba de peso

- [ ] Entrar en Peso.
- [ ] Guardar un peso.
- [ ] Guardar un segundo peso con otra fecha.
- [ ] Revisar resumen y gráfica.

Resultado esperado:

```txt
Los pesos quedan guardados.
La tendencia aparece cuando hay al menos dos registros.
```

## 5. Prueba de recomendaciones

- [ ] Entrar en Recomendaciones.
- [ ] Escribir una observación.
- [ ] Clic en Guardar recomendación local.
- [ ] Revisar historial.

Resultado esperado:

```txt
La recomendación local se guarda.
No necesita Gemini para funcionar.
```

## 6. Prueba de exportación

- [ ] Entrar en Ajustes.
- [ ] Clic en Exportar datos.
- [ ] Confirmar descarga de JSON.
- [ ] Confirmar descarga de TXT.

Resultado esperado:

```txt
Se descargan dos archivos de respaldo.
```

## 7. Prueba PWA

- [ ] Abrir la app desde Live Server o Hosting.
- [ ] Revisar consola.
- [ ] Confirmar que no aparezca error de scope del service worker.
- [ ] Entrar en Ajustes.
- [ ] Clic en Buscar actualización.
- [ ] Clic en Actualizar app.

Resultado esperado:

```txt
El service worker se registra desde /service-worker.js.
El botón de actualización limpia caché y recarga.
```

## 8. Prueba Electron

```bash
npm install
npm start
```

- [ ] Confirmar que abre ventana de escritorio.
- [ ] Navegar por pantallas.
- [ ] Guardar peso.
- [ ] Guardar entrenamiento.
- [ ] Entrar en Ajustes y revisar entorno.

Resultado esperado:

```txt
La app abre en Electron usando el mismo index.html.
No se activa nodeIntegration.
El preload expone FitJeffDesktop.
```

## 9. Prueba Firebase

Estado actual:

```txt
Firebase está preparado, pero desactivado por defecto.
firestore.rules exige autenticación.
```

Prueba segura:

- [ ] Ir a Ajustes.
- [ ] Confirmar que Firebase está en No.
- [ ] Guardar datos localmente.
- [ ] No debe aparecer error por permisos de Firestore.

Cuando se agregue Auth:

- [ ] Activar Firebase.
- [ ] Activar sincronización automática.
- [ ] Probar sincronizar ahora.
- [ ] Confirmar documentos en Firestore.

## 10. Errores conocidos corregidos

- [x] Import faltante de `src/data/usuario-base.js`.
- [x] Import faltante de `src/data/rutina-base.js`.
- [x] Registro incorrecto de service worker en `/public`.
- [x] Ruta incorrecta de `version.json`.
- [x] Firebase intentando sincronizar automáticamente sin Auth.

## 11. Próximo bloque recomendado

```txt
Crear módulo de Firebase Auth simple para usuario personal.
Conectar login anónimo o email/password.
Activar sincronización real con reglas seguras.
Agregar pantalla Diagnóstico completa.
```
