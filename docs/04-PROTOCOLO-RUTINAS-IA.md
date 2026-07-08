# Protocolo IA para Rutinas

## Objetivo

La pantalla **Entrenamiento / Rutinas** carga una rutina semanal completa usando un protocolo fijo, fácil de generar para una IA y fácil de interpretar para la app.

La app no debe recibir el prompt completo. Solo debe recibir el bloque final generado entre:

```text
===INICIO_RUTINA_APP===
...
===FIN_RUTINA_APP===
```

## Flujo correcto

1. El usuario copia el prompt desde la pantalla de Rutinas.
2. El usuario pega ese prompt en una IA.
3. La IA hace una entrevista corta antes de crear la rutina.
4. El usuario responde las preguntas.
5. La IA genera una rutina semanal en el protocolo fijo.
6. El usuario pega en la app únicamente el bloque final generado.

## Entrevista previa de la IA

La IA debe hacer exactamente 6 preguntas antes de generar la rutina:

1. Objetivo principal, con tres opciones A/B/C.
2. Nivel actual de entrenamiento, con tres opciones A/B/C.
3. Disponibilidad semanal, con tres opciones A/B/C.
4. Lugar principal de entrenamiento, con tres opciones A/B/C.
5. Enfoque preferido de la rutina, con tres opciones A/B/C.
6. Pregunta abierta para recursos reales, equipo disponible, pesos, espacio, bicicleta, mancuernas, ligas, banco, máquinas, molestias, lesiones o ejercicios a evitar.

La IA debe esperar la respuesta del usuario antes de generar la rutina.

## Protocolo final que entiende la app

```text
===INICIO_RUTINA_APP===
SEMANA|Semana actual

DIA|Lunes
NOMBRE|nombre real de la rutina del día
TIPO|Entrenamiento / HIIT / Cardio / Caminata / Movilidad / Descanso
OBJETIVO|objetivo real del día
DURACION|número en minutos
NIVEL|nivel real
EQUIPO|equipo real a usar
CALENTAMIENTO|
- ejercicio | tiempo
EJERCICIOS|
- ejercicio | series x repeticiones o tiempo | carga o intensidad | descanso | indicación técnica
CIERRE|
- ejercicio o estiramiento | tiempo
NOTAS|nota breve del día
---
DIA|Martes
...
===FIN_RUTINA_APP===
```

## Reglas del parser

El archivo principal del parser es:

```text
src/pantallas/02-entrenamiento/03-rutinas/enru-main.js
```

La app:

- Detecta el bloque entre `===INICIO_RUTINA_APP===` y `===FIN_RUTINA_APP===`.
- Lee campos con separador `|`.
- Divide cada día con `---`.
- Exige los siete días de la semana.
- Exige que cada día tenga nombre.
- Acepta listas con guion `-` o asterisco `*`.
- Mantiene compatibilidad con el formato clásico anterior como respaldo.

## Archivos relacionados

```text
src/pantallas/02-entrenamiento/03-rutinas/enru-index.html
src/pantallas/02-entrenamiento/03-rutinas/enru-main.js
```
