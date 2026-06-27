/*
  Nombre completo: rutinas.prompt.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.prompt.js

  Función o funciones:
    - Centralizar el prompt maestro para generar rutinas compatibles con FitJeff.
    - Definir el contrato FITJEFF_RUTINA_V1 que luego podrá interpretar el parser.
    - Obligar a la IA a devolver días, bloques y ejercicios en un formato estable.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/rutinas/rutinas.parser.js
*/

export const FITJEFF_RUTINA_FORMAT_VERSION = "FITJEFF_RUTINA_V1";

export const PROMPT_RUTINA_COPIABLE = `PROMPT PARA GENERAR UNA RUTINA COMPATIBLE CON FITJEFF

Actúa como entrenador personal y crea una rutina clara, segura, ordenada y fácil de interpretar por una app.
La rutina debe servir para copiar la respuesta y pegarla después en FitJeff.

DATOS QUE DEBES USAR
- Objetivo principal: [bajar grasa / ganar fuerza / ganar músculo / resistencia / salud general / rendimiento deportivo]
- Nivel: [principiante / intermedio / avanzado]
- Lugar de entrenamiento: [casa / gimnasio / parque / cancha]
- Equipo disponible: [mancuernas / barra / máquinas / ligas / balón / sin equipo]
- Días por semana: [4]
- Duración por sesión: [45 a 60 minutos]
- Limitaciones o molestias: [ninguna / rodilla / espalda / hombro / tobillo / otra]
- Actividad complementaria: [fútbol / carrera / bicicleta / caminata / ninguna]
- Enfoque deseado: [fuerza / cardio / movilidad / cuerpo completo / tren superior / tren inferior / fútbol]

REGLAS IMPORTANTES
1. Devuelve únicamente el texto desde FITJEFF_RUTINA_V1 hasta FIN_RUTINA.
2. No uses markdown, tablas, emojis, explicaciones largas ni texto fuera del formato.
3. Respeta exactamente los nombres de las claves: nombre, objetivo, nivel, lugar, equipo, dias, duracion_sesion, numero, enfoque, calentamiento, tipo, ejercicio, series, repeticiones, descanso, duracion, intensidad, notas.
4. Cada ejercicio debe estar en una sola línea y empezar con: - ejercicio=
5. En cada ejercicio conserva todas las claves aunque alguna no aplique. Si no aplica, deja el valor vacío.
6. Los tipos permitidos son: fuerza, cardio, futbol, movilidad, tecnica, core, calentamiento, descanso_activo, otro.
7. Si agregas fútbol, conducción, tiros, pases, coordinación o agilidad, usa tipo=futbol o tipo=tecnica.
8. Si agregas caminata, trote, bicicleta, cuerda o cardio final, usa tipo=cardio.
9. Si agregas estiramientos, movilidad articular o activación, usa tipo=movilidad o tipo=calentamiento.
10. Usa descansos en segundos con s. Ejemplo: 60s.
11. Usa duración en minutos con min. Ejemplo: 15min.
12. Evita ejercicios peligrosos o demasiado avanzados si el nivel no corresponde.
13. Cada día debe tener al menos un bloque y cada bloque al menos un ejercicio.

FORMATO OBLIGATORIO
FITJEFF_RUTINA_V1

[RUTINA]
nombre=
objetivo=
nivel=
lugar=
equipo=
dias=
duracion_sesion=
notas_generales=
[FIN_RUTINA_DATOS]

[DIA]
numero=1
nombre=Día 1 - [nombre del día]
enfoque=
calentamiento=

[BLOQUE]
tipo=fuerza
nombre=[nombre del bloque]
- ejercicio=Nombre del ejercicio | tipo=fuerza | series=3 | repeticiones=12 | descanso=60s | duracion= | intensidad=media | notas=controlar técnica
- ejercicio=Nombre del ejercicio | tipo=fuerza | series=3 | repeticiones=10 | descanso=60s | duracion= | intensidad=media | notas=
[FIN_BLOQUE]

[BLOQUE]
tipo=cardio
nombre=[nombre del bloque]
- ejercicio=Nombre del cardio | tipo=cardio | series= | repeticiones= | descanso= | duracion=15min | intensidad=suave | notas=
[FIN_BLOQUE]
[FIN_DIA]

[DIA]
numero=2
nombre=Día 2 - [nombre del día]
enfoque=
calentamiento=

[BLOQUE]
tipo=futbol
nombre=[nombre del bloque]
- ejercicio=Conducción de balón | tipo=futbol | series= | repeticiones= | descanso= | duracion=10min | intensidad=media | notas=trabajo técnico
- ejercicio=Pases contra pared | tipo=futbol | series=3 | repeticiones=20 | descanso=45s | duracion= | intensidad=media | notas=
[FIN_BLOQUE]
[FIN_DIA]

Repite la misma estructura para todos los días solicitados.

FIN_RUTINA`;