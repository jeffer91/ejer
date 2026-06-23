# FitJeff - Redisenio bloque 5

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Agregar controles de prueba y validacion antes de considerar pasar el redisenio a `main`.

## Cambios incluidos

1. Se actualizo `scripts/fitjeff-release-check.mjs`.
2. El release check ahora valida archivos nuevos del redisenio.
3. El release check ahora valida rutas nuevas:
   - Registrar
   - Progreso
   - Asistente
4. El release check ahora valida la estructura Firestore:
   - `fitjeff/jeff`
   - `firestore.paths.js`
   - `firestore.schema.js`
   - `sync-fitjeff.mapper.js`
5. Se actualizo `CHECKLIST-PRUEBAS.md` con la navegacion nueva.

## Comando de prueba

```bash
npm run check:release
```

## Resultado esperado

```txt
Sin errores criticos.
Build sincronizado entre public/version.json y service-worker.js.
Redisenio validado.
Firestore validado en fitjeff/jeff.
```

## Prueba manual minima

1. Abrir la app con servidor local.
2. Revisar que el menu principal sea corto:
   - Inicio
   - Entrenar
   - Registrar
   - Progreso
   - Asistente
   - Ajustes
3. Entrar a cada pantalla.
4. Guardar un peso desde Registrar.
5. Guardar un entrenamiento desde Entrenar.
6. Revisar que Progreso cambie.
7. Entrar a Ajustes y confirmar ruta base `fitjeff/jeff`.
8. Entrar a Diagnostico y confirmar Firebase sin errores de importacion.

## Nota

En este bloque no se subio `public/version.json` a un build nuevo. Se mantiene el build 16 porque `service-worker.js` tambien esta en build 16 y eso mantiene sincronizado el release check.
