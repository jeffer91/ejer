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
- [ ] Clic en Jarvis.
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

## 4. Prueba de Jarvis básico

- [ ] Entrar en Jarvis desde el menú.
- [ ] Confirmar que aparece la pantalla de Jarvis.
- [ ] Clic en Activar Jarvis.
- [ ] Confirmar mensaje hablado o visual.
- [ ] Clic en Iniciar entrenamiento.
- [ ] Confirmar que Jarvis guía el primer paso.
- [ ] Usar botón Sí / hecho.
- [ ] Usar botón Repetir.
- [ ] Usar botón Pausar.
- [ ] Usar botón Continuar.
- [ ] Usar botón Terminar.

Resultado esperado:

```txt
Jarvis funciona localmente.
No necesita Gemini.
Si la voz no está disponible, los botones manuales siguen funcionando.
```

## 5. Prueba de micrófono

- [ ] Entrar en Jarvis.
- [ ] Clic en Escuchar.
- [ ] Permitir micrófono si el navegador lo pide.
- [ ] Decir: Jarvis inicia entrenamiento.
- [ ] Confirmar que la app interpreta el comando.

Resultado esperado:

```txt
Si el navegador soporta reconocimiento de voz, Jarvis recibe el comando.
Si no lo soporta, aparece un mensaje y se puede usar control manual.
```

## 6. Prueba de nota rápida Jarvis

- [ ] Entrar en Jarvis.
- [ ] Escribir una observación.
- [ ] Clic en Guardar nota.
- [ ] Revisar mensajes recientes.

Resultado esperado:

```txt
La nota queda guardada localmente.
No se pierde al navegar.
```

## 7. Prueba de peso

- [ ] Entrar en Peso.
- [ ] Guardar un peso.
- [ ] Guardar un segundo peso con otra fecha.
- [ ] Revisar resumen y gráfica.

Resultado esperado:

```txt
Los pesos quedan guardados.
La tendencia aparece cuando hay al menos dos registros.
```

## 8. Prueba de recomendaciones

- [ ] Entrar en Recomendaciones.
- [ ] Escribir una observación.
- [ ] Clic en Guardar recomendación local.
- [ ] Revisar historial.

Resultado esperado:

```txt
La recomendación local se guarda.
No necesita Gemini para funcionar.
```

## 9. Prueba de exportación

- [ ] Entrar en Ajustes.
- [ ] Clic en Exportar datos.
- [ ] Confirmar descarga de JSON.
- [ ] Confirmar descarga de TXT.

Resultado esperado:

```txt
Se descargan dos archivos de respaldo.
```

## 10. Prueba PWA

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
Jarvis queda incluido en caché.
```

## 11. Prueba Electron

```bash
npm install
npm start
```

- [ ] Confirmar que abre ventana de escritorio.
- [ ] Navegar por pantallas.
- [ ] Entrar en Jarvis.
- [ ] Guardar peso.
- [ ] Guardar entrenamiento.
- [ ] Entrar en Ajustes y revisar entorno.

Resultado esperado:

```txt
La app abre en Electron usando el mismo index.html.
No se activa nodeIntegration.
El preload expone FitJeffDesktop.
```

## 12. Prueba Firebase

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

## 13. Errores conocidos corregidos

- [x] Import faltante de `src/data/usuario-base.js`.
- [x] Import faltante de `src/data/rutina-base.js`.
- [x] Registro incorrecto de service worker en `/public`.
- [x] Ruta incorrecta de `version.json`.
- [x] Firebase intentando sincronizar automáticamente sin Auth.
- [x] Jarvis creado y conectado al menú.

## 14. Próximo bloque recomendado

```txt
Crear entrenamiento guiado visual completo.
Conectar guiado.service.js.
Crear pantalla entrenamiento-guiado.view.js.
Conectar resumen final automático.
```
