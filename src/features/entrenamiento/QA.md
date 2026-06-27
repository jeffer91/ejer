# QA Entrenamiento - Bloque 10

## Estado general

Primera versión funcional del módulo Entrenamiento.

## Pantallas revisadas

- Stats.
- Rutinas.
- Diario.
- HIT.
- Ajustes.

## Flujo mínimo recomendado

1. Abrir la app.
2. Entrar a Entrenamiento.
3. Abrir Rutinas.
4. Crear una rutina y marcarla como activa.
5. Abrir Diario.
6. Iniciar sesión.
7. Marcar ejercicios y guardar progreso.
8. Completar sesión.
9. Abrir HIT y registrar cardio.
10. Abrir Stats y verificar que suban los datos.
11. Abrir Ajustes y guardar configuración de voz o Gemini.

## Comandos de prueba en PC

```bash
npm run dev
npm run build
npm run electron:dev
```

## Revisión esperada

- El menú Entrenamiento debe aparecer.
- Las rutas deben abrir sin pantalla vacía.
- Rutinas debe crear, editar, duplicar, archivar y restaurar.
- Diario debe leer la rutina activa.
- Diario debe guardar progreso sin duplicar sesiones del día.
- HIT debe registrar cardio y mostrar últimos registros.
- Ajustes debe guardar IA, voz y Gemini en localStorage.
- Stats debe mostrar datos y alertas.

## Pendiente después de primera versión

- Probar en Windows con Electron.
- Revisar consola del navegador.
- Conectar voz automática a Diario/HIT durante sesiones.
- Conectar Gemini con sugerencias reales en Diario.
- Agregar exportación de reporte.
