# CHECKLIST DE PRUEBAS - FITJEFF

## 1. Arranque

```txt
Objetivo: confirmar que la app abre sin errores.
```

- [ ] Abrir `index.html` desde servidor local.
- [ ] Confirmar que aparece Inicio.
- [ ] Confirmar que el menú aparece arriba.
- [ ] Confirmar que el menú principal muestra: Inicio, Entrenar, Registrar, Progreso, Asistente y Ajustes.
- [ ] Revisar consola.
- [ ] Confirmar que no hay errores rojos de importación.

Resultado esperado:

```txt
FitJeff inicia correctamente.
```

## 2. Navegación principal rediseñada

- [ ] Inicio.
- [ ] Entrenar.
- [ ] Registrar.
- [ ] Progreso.
- [ ] Asistente.
- [ ] Ajustes.

Resultado esperado:

```txt
Cada pantalla carga sin recargar toda la página.
El botón activo se marca correctamente.
```

## 3. Accesos internos

- [ ] Desde Entrenar abrir Guiado.
- [ ] Desde Entrenar abrir HIIT.
- [ ] Desde Entrenar abrir Rutinas.
- [ ] Desde Registrar abrir Medidas.
- [ ] Desde Registrar abrir Peso completo.
- [ ] Desde Progreso abrir Estadísticas.
- [ ] Desde Progreso abrir Reportes.
- [ ] Desde Progreso abrir Recomendaciones.
- [ ] Desde Asistente abrir Jarvis completo.
- [ ] Desde Asistente abrir Audio remoto.

Resultado esperado:

```txt
Las pantallas antiguas siguen disponibles como módulos internos.
```

## 4. Entrenamiento

- [ ] Entrar en Entrenar.
- [ ] Seleccionar día.
- [ ] Confirmar que aparece Entrenamiento guiado, HIIT y Rutinas.
- [ ] Registrar series o valores.
- [ ] Guardar entrenamiento.
- [ ] Volver a Inicio.
- [ ] Entrar en Progreso y confirmar actualización.

Resultado esperado:

```txt
El entrenamiento queda guardado localmente.
Inicio y Progreso actualizan datos.
```

## 5. Registrar

- [ ] Entrar en Registrar.
- [ ] Confirmar que aparece peso rápido.
- [ ] Guardar peso.
- [ ] Abrir Medidas.
- [ ] Abrir Peso completo.

Resultado esperado:

```txt
Registrar permite guardar peso y acceder a módulos corporales completos.
```

## 6. Progreso

- [ ] Entrar en Progreso.
- [ ] Revisar peso actual.
- [ ] Revisar constancia.
- [ ] Revisar tiempo semanal.
- [ ] Abrir Estadísticas.
- [ ] Abrir Reportes.
- [ ] Abrir Recomendaciones.

Resultado esperado:

```txt
Progreso muestra resumen simple y mantiene accesos a datos completos.
```

## 7. Asistente

- [ ] Entrar en Asistente.
- [ ] Activar voz.
- [ ] Probar Escuchar.
- [ ] Probar Iniciar entrenamiento.
- [ ] Probar Pausar.
- [ ] Probar Continuar.
- [ ] Probar Terminar.
- [ ] Guardar nota rápida.
- [ ] Abrir Jarvis completo.
- [ ] Abrir Audio remoto.

Resultado esperado:

```txt
Asistente funciona como centro de voz, comandos y notas.
```

## 8. Entrenamiento guiado

- [ ] Entrar en Guiado.
- [ ] Iniciar sesión.
- [ ] Avanzar ejercicio.
- [ ] Pausar.
- [ ] Continuar.
- [ ] Finalizar.
- [ ] Revisar resumen.

Resultado esperado:

```txt
El guiado funciona sin bloquear la app.
```

## 9. Rutinas

- [ ] Entrar en Rutinas.
- [ ] Copiar formato para IA.
- [ ] Pegar una rutina en formato FitJeff.
- [ ] Validar.
- [ ] Aplicar.
- [ ] Revisar entrenamiento.

Resultado esperado:

```txt
La rutina importada se puede validar y aplicar.
```

## 10. Medidas

- [ ] Entrar en Medidas.
- [ ] Registrar fecha.
- [ ] Registrar medidas.
- [ ] Guardar.
- [ ] Revisar historial.
- [ ] Revisar mini gráfico.

Resultado esperado:

```txt
Las medidas quedan guardadas localmente.
```

## 11. Reportes

- [ ] Entrar en Reportes.
- [ ] Generar semanal.
- [ ] Generar mensual.
- [ ] Generar completo.
- [ ] Guardar reporte.
- [ ] Exportar TXT.
- [ ] Exportar JSON.
- [ ] Exportar CSV.

Resultado esperado:

```txt
Los reportes se generan y descargan.
```

## 12. Diagnóstico

- [ ] Entrar en Diagnóstico.
- [ ] Ejecutar diagnóstico.
- [ ] Confirmar que Firebase muestra ruta base `fitjeff/jeff`.
- [ ] Copiar JSON.
- [ ] Copiar texto.

Resultado esperado:

```txt
Se muestra diagnóstico completo por áreas.
```

## 13. PWA

- [ ] Ejecutar servidor local.
- [ ] Confirmar service worker.
- [ ] Confirmar manifest.
- [ ] Confirmar que `public/fit-redesign.css` carga correctamente.
- [ ] Instalar app si el navegador lo permite.
- [ ] Probar botón Actualizar app.

Resultado esperado:

```txt
La app puede instalarse y actualizar caché.
```

## 14. Firebase / Firestore

- [ ] Confirmar que la app funciona local sin Firebase.
- [ ] Entrar en Ajustes.
- [ ] Confirmar Proyecto: Jeff.
- [ ] Confirmar App web: personal.
- [ ] Confirmar Usuario: jeff.
- [ ] Confirmar Ruta base: `fitjeff/jeff`.
- [ ] Mantener Firebase desactivado si no hay Auth.
- [ ] Si hay Auth, probar Sincronizar ahora.

Resultado esperado:

```txt
La app no se rompe si Firebase está apagado.
Si Firebase se activa, usa la estructura fitjeff/jeff.
```

## 15. Electron

```bash
npm install
npm start
```

- [ ] Confirmar ventana de escritorio.
- [ ] Navegar pantallas principales.
- [ ] Guardar entrenamiento.
- [ ] Guardar peso.
- [ ] Entrar en Diagnóstico.

Resultado esperado:

```txt
Electron abre el mismo index.html.
```

## 16. Revisión final antes de publicar

```bash
npm run check:release
```

Resultado esperado:

```txt
Sin errores críticos.
Build sincronizado.
Rediseño validado.
Firestore validado en fitjeff/jeff.
```
