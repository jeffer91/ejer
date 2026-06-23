# FitJeff - Redisenio bloque 3

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Ordenar Firebase y Firestore para que FitJeff use una estructura limpia y exclusiva:

```txt
fitjeff / jeff
```

## Cambios incluidos

1. Se creo `src/firebase/firestore.paths.js`.
2. Se creo `src/firebase/firestore.schema.js`.
3. Se creo `src/sincronizacion/sync-fitjeff.mapper.js`.
4. `firestore.service.js` ya no usa `usuarios/jeff`; ahora usa `fitjeff/jeff`.
5. `sincronizacion.service.js` usa mapper propio y guarda resumen de sincronizacion.
6. `diagnostico.firebase.service.js` muestra la ruta base activa de Firestore.
7. `ajustes.view.js` muestra proyecto, app web, usuario y ruta base.
8. `firestore.rules` se actualizo para proteger `fitjeff/{usuarioId}`.
9. `version.json` subio a build 16.

## Estructura Firestore esperada

```txt
fitjeff
└── jeff
    ├── perfil
    ├── rutina
    ├── ajustes
    ├── estadisticas
    ├── sincronizacion
    ├── entrenamientos
    ├── pesos
    ├── recomendaciones
    ├── medidas
    ├── reportes
    └── asistente
```

## Importante

Las reglas `firestore.rules` requieren Firebase Auth. Si la app sigue sin login, Firebase debe permanecer desactivado en Ajustes hasta integrar autenticacion o una estrategia segura equivalente.

## Pendiente tecnico

`service-worker.js` todavia debe actualizarse para precachear los nuevos archivos del redisenio cuando el conector permita modificarlo sin bloqueo.
