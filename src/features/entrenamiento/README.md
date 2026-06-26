# Entrenamiento

Módulo grande de FitJeff para rutinas, entrenamiento diario, estadísticas, HIT/cardio y conexión con IA.

## Pantallas

- `Stats`: dashboard de rendimiento.
- `Diario`: rutina del día según entrenamiento activo.
- `Rutinas`: creación y administración de planes.
- `HIT`: intervalos, caminata, bicicleta y cardio simple.
- `Ajustes`: Gemini, voz automática y conexión.

## Estado del bloque 1

Estructura visual conectada al menú principal.

## Estado del bloque 2

Capa local creada para guardar y leer:

- Rutinas.
- Sesiones de entrenamiento.
- Registros de cardio.
- Ajustes de Gemini, IA y voz.
- Historial de cambios.

Las pantallas `Stats`, `Diario`, `Rutinas` y `Ajustes` ya leen el estado local. El formulario editable y las acciones reales se completan en los siguientes bloques.

## Estado del bloque 3

`Stats` ahora tiene un dashboard real conectado a datos locales:

- Tarjetas de días, racha, ejercicios, series, tiempo, HIT, caminata y bicicleta.
- Barras de constancia, fuerza y cardio.
- Vista de los últimos 7 días.
- Alertas simples sobre rutina activa, registro de hoy y Gemini.

Los cálculos viven en `stats/stats.service.js` para no mezclar lógica con la vista.
