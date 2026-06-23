# FitJeff - Redisenio bloque 6

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Corregir detalles de integracion entre el redisenio diario y el controlador principal de la app.

## Cambios incluidos

1. `app-controller.js` ahora importa directamente:
   - `renderRegistrarView`
   - `renderProgresoView`
   - `renderAsistenteView`

2. `app-controller.js` ahora registra directamente las vistas:
   - `VISTAS_APP.REGISTRAR`
   - `VISTAS_APP.PROGRESO`
   - `VISTAS_APP.ASISTENTE`

3. Guardar peso desde `Registrar` ya no manda obligatoriamente a la pantalla antigua `Peso`.

4. Acciones de Jarvis usadas desde `Asistente` ya no mandan obligatoriamente a la pantalla antigua `Jarvis`.

5. Se agregaron validaciones al release check para revisar:
   - registro de nuevas vistas en `app-controller.js`
   - retorno correcto desde Registrar
   - retorno correcto desde Asistente
   - uso de `obtenerVistaActual`

## Pruebas puntuales

1. Entrar a `Registrar`.
2. Guardar peso.
3. Confirmar que la app se queda en `Registrar`.
4. Entrar a `Peso completo`.
5. Guardar peso.
6. Confirmar que la app se queda en `Peso`.
7. Entrar a `Asistente`.
8. Usar Activar voz o Guardar nota.
9. Confirmar que la app se queda en `Asistente`.
10. Entrar a `Jarvis completo`.
11. Usar una accion.
12. Confirmar que la app se queda en `Jarvis`.

## Comando de revision

```bash
npm run check:release
```

## Resultado esperado

```txt
Sin errores criticos.
Build sincronizado.
Integracion de app-controller validada.
```
