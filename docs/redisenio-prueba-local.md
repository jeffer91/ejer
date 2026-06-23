# FitJeff - Prueba local de la rama redisenio

Rama a probar:

```bash
git checkout fitjeff-redesign-v1
```

## 1. Descargar cambios

```bash
git fetch origin
git checkout fitjeff-redesign-v1
git pull origin fitjeff-redesign-v1
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Ejecutar revision automatica

```bash
npm run check:release
```

Resultado esperado:

```txt
Sin errores criticos.
Build sincronizado.
Redisenio validado.
Firestore validado en fitjeff/jeff.
```

## 4. Probar en navegador

```bash
npm run serve
```

Abrir la direccion local que indique la terminal.

## 5. Prueba visual minima

Confirmar menu principal:

```txt
Inicio
Entrenar
Registrar
Progreso
Asistente
Ajustes
```

## 6. Prueba funcional minima

### Inicio

- Confirmar saludo.
- Confirmar accion recomendada.
- Confirmar tarjetas de peso, constancia y tiempo semanal.

### Entrenar

- Entrar a Entrenar.
- Cambiar dia de rutina.
- Confirmar accesos a Guiado, HIIT y Rutinas.
- Guardar entrenamiento.
- Confirmar que vuelve a Inicio.

### Registrar

- Entrar a Registrar.
- Guardar peso.
- Confirmar que se queda en Registrar.
- Abrir Peso completo.
- Volver a Registrar.
- Abrir Medidas.

### Progreso

- Entrar a Progreso.
- Confirmar peso actual.
- Confirmar constancia.
- Confirmar tiempo semanal.
- Abrir Estadisticas, Reportes y Recomendaciones.

### Asistente

- Entrar a Asistente.
- Probar Guardar nota.
- Confirmar que se queda en Asistente.
- Abrir Jarvis completo.
- Abrir Audio remoto.

### Ajustes

- Confirmar proyecto Firebase: Jeff.
- Confirmar app web: personal.
- Confirmar usuario: jeff.
- Confirmar ruta base: fitjeff/jeff.
- Mantener Firebase desactivado si no hay Auth.

## 7. Prueba PWA

- Confirmar que no hay errores del service worker.
- Probar Actualizar app.
- Confirmar que `public/fit-redesign.css` carga bien.

## 8. No hacer merge todavia

Despues de probar, revisar visualmente en celular y computador antes de pasar a `main`.
