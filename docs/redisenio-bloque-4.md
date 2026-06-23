# FitJeff - Redisenio bloque 4

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Estabilizar el redisenio visual y la PWA despues de los bloques 1, 2 y 3.

## Cambios incluidos

1. Se creo `public/fit-redesign.css`.
2. Se conecto `public/fit-redesign.css` desde `index.html`.
3. Se actualizo `service-worker.js` a cache compacto de build 16.
4. El service worker ahora incluye archivos nuevos del redisenio:
   - registrar.view.js
   - progreso.view.js
   - asistente.view.js
   - firestore.paths.js
   - firestore.schema.js
   - sync-fitjeff.mapper.js
   - fit-redesign.css

## Resultado

La app ahora tiene estilos adicionales aislados, sin modificar de forma agresiva los CSS principales. Esto hace el redisenio mas facil de probar y revertir si algo no se ve bien.

## Pendiente

`public/version.json` debe subirse a build 17. El conector bloqueo la escritura de ese archivo en este bloque, por eso se mantiene pendiente aunque `service-worker.js` ya fue actualizado.
