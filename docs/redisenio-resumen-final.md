# FitJeff - Resumen final del redisenio

Rama de trabajo: `fitjeff-redesign-v1`

## Objetivo general

Reorganizar FitJeff para que la app sea mas simple, bonita, diaria y automatizada, sin eliminar funciones existentes.

Flujo principal definido:

```txt
Inicio -> Entrenar -> Registrar -> Progreso -> Asistente -> Ajustes
```

## Resultado principal

La app deja de mostrar demasiadas pantallas tecnicas en el menu principal. Las funciones antiguas no se eliminan; quedan agrupadas dentro de procesos diarios.

## Bloques realizados

### Bloque 1 - Navegacion y pantallas principales

- Menu principal reducido.
- Nuevas rutas:
  - Registrar
  - Progreso
  - Asistente
- Nuevas vistas:
  - `src/vistas/registrar.view.js`
  - `src/vistas/progreso.view.js`
  - `src/vistas/asistente.view.js`
- Inicio reorganizado como panel diario.

### Bloque 2 - Automatizacion base

- Registrar y Progreso leen estado local real.
- Inicio usa servicios de acciones y pendientes.
- Entrenar agrupa:
  - Entrenamiento guiado
  - HIIT
  - Rutinas
  - Registro manual

### Bloque 3 - Firebase / Firestore

- Firestore migrado de `usuarios/jeff` a `fitjeff/jeff`.
- Nuevos archivos:
  - `src/firebase/firestore.paths.js`
  - `src/firebase/firestore.schema.js`
  - `src/sincronizacion/sync-fitjeff.mapper.js`
- Ajustes muestra proyecto, app web, usuario y ruta base.
- Diagnostico valida rutas Firestore.
- Reglas Firestore actualizadas para `fitjeff/{usuarioId}`.

### Bloque 4 - Estilos y PWA

- CSS aislado del redisenio:
  - `public/fit-redesign.css`
- `index.html` carga el CSS nuevo.
- `service-worker.js` actualizado a build 16 compacto.
- Cache incluye archivos nuevos del redisenio.

### Bloque 5 - Pruebas

- `scripts/fitjeff-release-check.mjs` actualizado.
- `CHECKLIST-PRUEBAS.md` actualizado al nuevo flujo.
- Validaciones nuevas:
  - Registrar
  - Progreso
  - Asistente
  - Firestore `fitjeff/jeff`
  - Service Worker con archivos nuevos

### Bloque 6 - Integracion fina

- `app-controller.js` registra directamente las nuevas vistas.
- Guardar peso desde Registrar vuelve a Registrar.
- Acciones de Jarvis desde Asistente vuelven a Asistente.
- Las pantallas antiguas Peso y Jarvis siguen funcionando si se abren directamente.

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

## Menu principal actual

```txt
Inicio
Entrenar
Registrar
Progreso
Asistente
Ajustes
```

## Funciones que siguen disponibles internamente

```txt
Guiado
HIIT
Audio remoto
Rutinas
Medidas
Reportes
Diagnostico
Peso
Estadisticas
Recomendaciones
Jarvis
```

## Comando de revision

```bash
npm run check:release
```

## Nota importante

No se debe hacer merge a `main` hasta probar localmente la rama `fitjeff-redesign-v1`.

Firebase debe mantenerse desactivado si todavia no hay autenticacion segura configurada.
