# CHECKLIST DE PRUEBAS - FITJEFF

## 1. Arranque

```txt
Objetivo: confirmar que la app abre sin errores.
```

- [ ] Abrir `index.html` desde servidor local.
- [ ] Confirmar que aparece Inicio.
- [ ] Confirmar que el menú aparece arriba.
- [ ] Revisar consola.
- [ ] Confirmar que no hay errores rojos de importación.

Resultado esperado:

```txt
FitJeff inicia correctamente.
```

## 2. Navegación principal

- [ ] Inicio.
- [ ] Entrenar.
- [ ] Guiado.
- [ ] Rutinas.
- [ ] Medidas.
- [ ] Reportes.
- [ ] Jarvis.
- [ ] Peso.
- [ ] Estadísticas.
- [ ] Recomendaciones.
- [ ] Diagnóstico.
- [ ] Ajustes.

Resultado esperado:

```txt
Cada pantalla carga sin recargar toda la página.
El botón activo se marca correctamente.
```

## 3. Entrenamiento

- [ ] Entrar en Entrenar.
- [ ] Seleccionar día.
- [ ] Registrar series.
- [ ] Marcar energía inicial y final.
- [ ] Guardar entrenamiento.
- [ ] Volver a Inicio.

Resultado esperado:

```txt
El entrenamiento queda guardado localmente.
Inicio y Estadísticas actualizan datos.
```

## 4. Entrenamiento guiado

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

## 5. Rutinas

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

## 6. Medidas

- [ ] Entrar en Medidas.
- [ ] Registrar fecha.
- [ ] Registrar peso o medida.
- [ ] Guardar.
- [ ] Revisar historial.
- [ ] Revisar mini gráfico.

Resultado esperado:

```txt
Las medidas quedan guardadas localmente.
```

## 7. Reportes

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

## 8. Jarvis

- [ ] Entrar en Jarvis.
- [ ] Activar Jarvis.
- [ ] Probar botones manuales.
- [ ] Probar consulta escrita.
- [ ] Probar sugerencias.
- [ ] Revisar mensajes recientes.

Resultado esperado:

```txt
Jarvis responde localmente.
Si Firebase y Gemini están activos, puede responder por servicio remoto.
```

## 9. Peso

- [ ] Entrar en Peso.
- [ ] Guardar peso.
- [ ] Guardar segundo peso.
- [ ] Revisar tendencia.

Resultado esperado:

```txt
El registro de peso sigue funcionando.
```

## 10. Estadísticas

- [ ] Entrar en Estadísticas.
- [ ] Revisar tarjetas.
- [ ] Revisar gráficos.
- [ ] Revisar rendimiento por ejercicio.
- [ ] Revisar entrenamientos recientes.

Resultado esperado:

```txt
El dashboard visual carga sin errores.
```

## 11. Diagnóstico

- [ ] Entrar en Diagnóstico.
- [ ] Ejecutar diagnóstico.
- [ ] Copiar JSON.
- [ ] Copiar texto.

Resultado esperado:

```txt
Se muestra diagnóstico completo por áreas.
```

## 12. PWA

- [ ] Ejecutar servidor local.
- [ ] Confirmar service worker.
- [ ] Confirmar manifest.
- [ ] Instalar app si el navegador lo permite.
- [ ] Probar botón Actualizar app.

Resultado esperado:

```txt
La app puede instalarse y actualizar caché.
```

## 13. Firebase

- [ ] Confirmar que la app funciona local sin Firebase.
- [ ] Confirmar que Ajustes permite preparar Firebase.
- [ ] Si hay Auth y Functions, probar recomendación remota.
- [ ] Si hay Functions y clave, probar Jarvis remoto.

Resultado esperado:

```txt
La app no se rompe si Firebase está apagado.
```

## 14. Electron

```bash
npm install
npm start
```

- [ ] Confirmar ventana de escritorio.
- [ ] Navegar pantallas.
- [ ] Guardar entrenamiento.
- [ ] Guardar medidas.
- [ ] Entrar en Diagnóstico.

Resultado esperado:

```txt
Electron abre el mismo index.html.
```

## 15. Revisión final antes de publicar

```bash
npm run check:release
```

Resultado esperado:

```txt
Sin errores críticos.
Build sincronizado.
```
