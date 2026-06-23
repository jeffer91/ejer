# FitJeff - Redisenio bloque 1

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo

Ordenar la experiencia diaria de FitJeff para que la app se sienta como un flujo simple:

Inicio -> Entrenar -> Registrar -> Progreso -> Asistente -> Ajustes

## Cambios incluidos

1. Nueva navegacion diaria corta.
2. Nuevas rutas: registrar, progreso y asistente.
3. Inicio mas simple, enfocado en la accion recomendada.
4. Encabezado mas limpio.
5. Vista Registrar para peso y accesos a medidas.
6. Vista Progreso para resumen, estadisticas, reportes y recomendaciones.
7. Vista Asistente para voz, comandos y notas.
8. Servicio base para calcular el resumen de hoy.
9. Version remota marcada como build 14.

## Cambios pendientes del bloque

- Compactar completamente `entrenar.view.js`.
- Ajustar `service-worker.js` a build 14.
- Ajustar estilos responsive para las nuevas tarjetas.
- Conectar los servicios de automatizacion en Inicio.

## Regla tecnica

No se borra funcionalidad existente. Las funciones anteriores quedan disponibles como rutas internas, pero el menu principal se mantiene corto y claro.
