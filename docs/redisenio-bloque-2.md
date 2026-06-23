# FitJeff - Redisenio bloque 2

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Hacer funcional el redisenio del bloque 1 y preparar automatizacion basica para el flujo diario.

## Cambios incluidos

1. `Registrar` ahora lee el estado local real si se carga como vista dinamica.
2. `Progreso` ahora lee el estado local real si se carga como vista dinamica.
3. Se creo `hoy-acciones.service.js` para centralizar acciones rapidas.
4. Se creo `hoy-pendientes.service.js` para calcular pendientes simples.
5. `Inicio` ahora usa los servicios de acciones y pendientes.
6. `Entrenar` quedo mas compacto y agrupa Guiado, HIIT y Rutinas.
7. `version.json` subio a build 15.

## Pendientes tecnicos

- Actualizar `service-worker.js` a build 15 cuando el conector permita tocarlo completo.
- Ajustar estilos en `styles/` cuando el conector permita crear o modificar CSS sin bloqueo.
- Revisar visualmente la app en navegador antes de pasar a `main`.

## Regla tecnica

El redisenio no elimina funcionalidades. Solo reduce el menu principal y agrupa pantallas antiguas dentro de procesos diarios.
