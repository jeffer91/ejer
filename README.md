# FitJeff

App personal local-first para control corporal, actividad, registro de peso, medidas, progreso visual, historial, backups, PWA y escritorio Electron.

La app se trabaja por bloques para evitar cambios mezclados y mantener cada modulo separado.

## Estado actual del redisenio visual

La app esta migrando de un estilo oscuro/tecnico a una experiencia clara, simple y visual.

Pantalla principal definida:

- Hoy

Menu principal de Control corporal:

- Hoy
- Registrar
- Progreso
- Historial

Modulos principales visibles:

- Control corporal
- Actividad
- Entrenamiento
- Sistema

## Redisenio 2026 - Bloques aplicados

### Bloque 1 - Tema claro global

Creado y conectado:

- `src/app/theme-light.css`
- `src/app/status-colors.css`
- `src/app/app.css`
- `src/shell/shell.css`

Resultado:

- Modo claro global
- Tarjetas limpias
- Texto oscuro legible
- Sombras suaves
- Indicadores fuertes: verde, azul, amarillo, rojo y gris

### Bloque 2 - Shell simple

Corregido:

- `src/shell/shell.view.js`

Resultado:

- Menos lenguaje tecnico
- Cambio de "App modular" a "Tu control diario"
- Menu principal como "Secciones"
- Submenu como "Acciones"

### Bloque 3 - Pantalla Hoy

Creado:

- `src/features/control-corporal/hoy/hoy.controller.js`
- `src/features/control-corporal/hoy/hoy.service.js`
- `src/features/control-corporal/hoy/hoy.rules.js`
- `src/features/control-corporal/hoy/hoy.view.js`
- `src/features/control-corporal/hoy/hoy.constants.js`
- `src/features/control-corporal/hoy/hoy.css`

Corregido:

- `src/features/control-corporal/control-corporal.routes.js`
- `src/features/control-corporal/control-corporal.menu.js`
- `src/features/control-corporal/control-corporal.module.js`
- `src/features/features.registry.js`
- `src/app/app-router.js`

Resultado:

- FitJeff abre en Hoy
- Hoy muestra conclusion, accion recomendada, tarjetas compactas, mini grafico y accesos rapidos
- Botones internos navegan a Registrar, Progreso e Historial

### Bloque 4 - Registro con ayuda integrada

Creado:

- `src/features/control-corporal/registro/ayudas-medidas.constants.js`
- `src/features/control-corporal/registro/mapa-corporal.view.js`
- `src/features/control-corporal/registro/mapa-corporal.css`

Corregido:

- `src/features/control-corporal/registro/ingreso.view.js`
- `src/features/control-corporal/registro/ingreso.css`
- `src/features/control-corporal/registro/ingreso.constants.js`

Resultado:

- Cada campo importante tiene boton ?
- La explicacion se abre debajo del campo
- Registro incluye mapa corporal visual
- No hace falta abrir una pantalla separada para entender medidas basicas

### Bloque 5 - Menu de Control corporal limpio

Corregido:

- `src/features/control-corporal/control-corporal.routes.js`

Resultado:

- Se quito Guia de medidas del menu visible
- La guia queda integrada dentro de Registro con ayuda ?
- El menu queda: Hoy, Registrar, Progreso, Historial

### Bloque 6 - Progreso como vista de detalle

Creado:

- `src/features/control-corporal/estadisticas/estadisticas.presenter.js`

Corregido:

- `src/features/control-corporal/estadisticas/estadisticas.view.js`
- `src/features/control-corporal/estadisticas/estadisticas.css`
- `src/features/control-corporal/estadisticas/estadisticas.constants.js`

Resultado:

- Estadisticas pasa a funcionar visualmente como Progreso
- La pantalla se organiza por secciones
- Primero muestra resumen principal
- Luego avance hacia la meta, grafico, detalle de peso y medidas
- Se reduce la saturacion visual

### Bloque 7 - Estructura y documentacion

Corregido:

- `scripts/check-structure.cjs`
- `README.md`

Resultado:

- El check de estructura reconoce tema claro, Hoy, Registro visual y Progreso con presenter
- La documentacion refleja la arquitectura actual del redisenio

### Bloque 8 - Inicio claro y salida hacia Hoy

Corregido:

- `src/features/control-corporal/inicio/inicio.constants.js`
- `src/features/control-corporal/inicio/inicio.controller.js`
- `src/features/control-corporal/inicio/inicio.view.js`
- `src/features/control-corporal/inicio/inicio.css`
- `scripts/check-structure.cjs`

Resultado:

- Inicio usa modo claro
- El boton dice Guardar y abrir Hoy
- El mensaje de exito indica que abre Hoy
- El check valida que Inicio este alineado al nuevo flujo

### Bloque 9 - Historial y Ajustes claros

Corregido:

- `src/features/control-corporal/historial/historial.css`
- `src/modules/ajustes/ajustes.view.js`
- `src/modules/ajustes/ajustes.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado:

- Historial ya no usa estilo oscuro
- Ajustes ya no usa estilo oscuro
- Botones de editar, cambios y borrar tienen indicadores claros
- Formularios de Ajustes usan inputs claros y teclado decimal cuando corresponde
- El check valida Historial y Ajustes dentro del redisenio visual

### Bloque 10 - Revision visual e integracion final

Corregido:

- `src/modules/actualizaciones/actualizaciones.css`
- `src/features/entrenamiento/stats/stats.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado:

- Actualizaciones ya no usa estilo oscuro/neon
- Stats de Entrenamiento queda alineado al modo claro
- El check valida Actualizaciones y Stats como parte del redisenio visual
- La app mantiene una base visual coherente antes de crear Actividad

### Bloque 11 - Actividad manual

Creado:

- `src/features/actividad/actividad.constants.js`
- `src/features/actividad/actividad.routes.js`
- `src/features/actividad/actividad.menu.js`
- `src/features/actividad/actividad.module.js`
- `src/features/actividad/actividad.repository.js`
- `src/features/actividad/actividad.service.js`
- `src/features/actividad/resumen/resumen.controller.js`
- `src/features/actividad/resumen/resumen.view.js`
- `src/features/actividad/resumen/resumen.css`
- `src/features/actividad/registro/registro.controller.js`
- `src/features/actividad/registro/registro.view.js`
- `src/features/actividad/registro/registro.css`

Corregido:

- `src/features/features.registry.js`
- `src/shell/shell.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado:

- Actividad queda como modulo independiente
- Permite registro manual de pasos, minutos de bicicleta y kilometros de bicicleta
- Tiene resumen de hoy, resumen semanal y registros recientes
- Guarda localmente en `localStorage`
- No toca Firebase, Sync, Backup, Electron ni Android

## Bloques originales de construccion

### Base inicial

Incluye Vite, HTML principal, Manifest PWA, icono base, bootstrap, router, estilos base y service worker reservado.

### Base central de Registro

Incluye modulo central, constantes, estado, esquema de datos, repository local, service principal y estilos propios del modulo.

### Inicio de primera vez

Incluye altura, fecha de nacimiento, peso inicial, peso objetivo, validacion inteligente basica, guardado en Registro y salto automatico a Hoy.

### Registro e ingreso

Incluye peso diario, medidas semanales, validacion de rangos, deteccion de cambios poco comunes, ayuda integrada con botones ? y mapa corporal visual.

### Progreso

Incluye peso actual, objetivo, cambios, tendencia, IMC, proxima medicion, barra de progreso, grafico simple y tarjetas compactas de medidas.

### Actividad

Incluye registro manual de pasos, minutos de bicicleta, kilometros de bicicleta, resumen diario, resumen semanal y registros recientes.

### Historial

Incluye lista compacta por fecha, visualizacion de peso y medidas, edicion, confirmacion antes de borrar, papelera interna y consulta simple de cambios.

### Ajustes

Incluye perfil, objetivo, editar altura, editar fecha de nacimiento, editar peso objetivo, reabrir Inicio, backups locales, exportacion e importacion JSON.

### Core local, Firebase, backups y Electron

Incluye configuracion central, storage local seguro, diagnostico, Firebase base, cola de sincronizacion, backups, exportacion local y escritorio Electron.

## Comandos

Instalar dependencias:

```bash
npm install
```

Abrir en navegador:

```bash
npm run dev
```

Abrir en Electron:

```bash
npm run electron:dev
```

Revisar herramientas y estructura antes de abrir Electron:

```bash
npm run electron:dev:check
```

Revisar solo estructura:

```bash
npm run check:structure
```

Probar modo escritorio con dist:

```bash
npm run electron:build
```

Crear instalador Windows:

```bash
npm run desktop:win
```

## Reglas de crecimiento

- Mantener cada modulo separado.
- No mezclar Control corporal con Actividad.
- No tocar Firebase, Sync, Backup, Electron o Android cuando el bloque sea solo visual o manual.
- Pantalla Hoy debe seguir siendo la entrada principal.
- Registro debe mantener ayuda ? integrada.
- Progreso debe ser detalle, no dashboard saturado.
- Actividad manual debe crecer antes de conectar sensores o apps externas.
