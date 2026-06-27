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

## Estado del bloque 4

`Rutinas` ahora permite crear y activar rutinas locales:

- Nombre.
- Número de días.
- Calentamiento.
- Ejercicios por líneas.
- Descanso en segundos.
- Series.
- Repeticiones.
- Opción para guardar como rutina activa.

La validación vive en `rutinas/rutinas.validator.js` y la conversión del formulario vive en `rutinas/rutinas.service.js`.

## Estado del bloque 5

`Diario` ahora carga la rutina activa del día y permite:

- Ver rutina y día asignado.
- Ver ejercicios preparados.
- Ver series, repeticiones y tiempo estimado.
- Iniciar sesión diaria.
- Completar sesión diaria.
- Guardar el resultado localmente.

La lógica vive en `diario/diario.service.js` para mantener separada la pantalla de los cálculos y el guardado.

## Estado del bloque 6

`HIT` ahora registra cardio y maneja temporizador simple:

- HIT / intervalos.
- Caminata.
- Bicicleta.
- Otro cardio.
- Tiempo.
- Distancia opcional.
- Intensidad.
- Rondas, actividad y descanso.
- Últimos registros.

La lógica de guardado vive en `hit/hit.service.js` y el reloj vive en `hit/hit.timer.js`.

## Estado del bloque 7

`Ajustes` ahora permite configurar IA y voz:

- Guardar API Key de Gemini localmente.
- Configurar modelo Gemini.
- Activar o desactivar IA.
- Activar o desactivar voz automática.
- Seleccionar voz del sistema cuando esté disponible.
- Ajustar volumen y velocidad.
- Probar Gemini.
- Probar voz.
- Borrar API Key.

Gemini vive en `ajustes/gemini.service.js`, la voz vive en `ajustes/voice.service.js` y la coordinación vive en `ajustes/ajustes.service.js`.

## Estado del bloque 8

`Diario` ahora permite registro avanzado de sesión:

- Marcar ejercicio por ejercicio.
- Registrar series hechas.
- Registrar repeticiones hechas.
- Registrar dificultad por ejercicio.
- Agregar notas por ejercicio.
- Registrar tiempo real.
- Registrar dificultad general.
- Registrar molestias o señales de alerta.
- Guardar progreso sin cerrar sesión.
- Completar sesión con datos reales.

La conversión del formulario vive en `diario/diario.mapper.js` y `entrenamiento.service.js` ahora puede actualizar sesiones existentes.
