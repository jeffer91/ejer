# Funcionalidades de FitJeff

Esta carpeta contiene las funcionalidades grandes de la app.

## Funcionalidad actual

- `control-corporal`: peso, medidas, progreso, registro e historial.

## Como agregar una nueva funcionalidad

1. Copiar la carpeta `src/features/_template`.
2. Cambiar nombres internos: id, rutas, labels y nombres de funciones.
3. Crear las pantallas reales dentro de la nueva carpeta.
4. Registrar el menu y el montador en `src/features/features.registry.js`.

## Archivo clave

`features.registry.js` es el punto central para agregar funcionalidades nuevas al menu superior.

La idea es no volver a modificar `app-router.js` cada vez que agregues un modulo grande.
