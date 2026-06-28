# FitJeff

App personal local-first para control corporal, registro de peso, medidas, progreso visual, historial, backups, PWA y escritorio Electron.

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

## Bloques originales de construccion

### Base inicial

Incluye:

- Vite
- HTML principal
- Manifest PWA
- Icono base
- App bootstrap
- Router base
- Estilos base
- Service worker reservado

### Base central de Registro

Incluye:

- Modulo central
- Constantes
- Estado
- Esquema de datos
- Repository local
- Service principal
- Estilos propios del modulo

### Inicio de primera vez

Incluye:

- Altura
- Fecha de nacimiento
- Peso inicial
- Peso objetivo
- Validacion inteligente basica
- Guardado en Registro
- Salto automatico a Hoy

### Registro e ingreso

Incluye:

- Peso diario maximo una vez por dia
- Medidas semanales
- Campos rapidos e inteligentes
- Validacion de rangos corporales
- Deteccion de cambios poco comunes
- Confirmacion antes de guardar datos raros
- Ayuda integrada con botones ?
- Mapa corporal visual

### Progreso

Incluye:

- Peso actual
- Peso objetivo
- Cambio desde el ultimo registro
- Tendencia desde 3 registros
- IMC con categoria
- Proxima medicion semanal
- Barra de progreso del objetivo
- Grafico simple de peso
- Tarjetas compactas de medidas corporales
- Vista de detalle conectada desde el menu Progreso

### Historial

Incluye:

- Lista compacta por fecha
- Visualizacion de peso y medidas guardadas
- Edicion de registros
- Confirmacion antes de borrar
- Envio a papelera interna
- Consulta simple de cambios
- Conexion real desde el menu Historial

### Ajustes

Incluye:

- Perfil simple
- Objetivo simple
- Editar altura
- Editar fecha de nacimiento
- Editar peso objetivo
- Reabrir Inicio desde Ajustes
- Conexion real desde el menu Ajustes

### Core local y control de datos

Incluye:

- Configuracion central de app
- Utilidades de fecha
- Utilidades de numeros
- Storage local seguro
- Estado visible Datos al dia
- Diagnostico interno oculto
- Manejo general de errores simples
- Conexion del manejador de errores al arranque

### Firebase y sync base

Incluye:

- Dependencia Firebase agregada
- Configuracion Firebase preparada
- Inicializacion segura de Firebase
- Servicio base Firestore
- Manejo simple de errores Firebase
- Cola local de sincronizacion
- Estado interno de sincronizacion
- Servicio coordinador de sincronizacion

### Backups y exportacion local

Incluye:

- Copia local automatica
- Lista corta de backups locales
- Exportar JSON desde Ajustes
- Importar JSON desde Ajustes
- Restaurar datos locales
- Copia previa antes de restaurar
- Proteccion contra perdida de informacion

### Electron base

Incluye:

- Main process de Electron
- Preload seguro
- Ventana principal de escritorio
- Menu simple de aplicacion
- IPC seguro basico
- Carga de Vite en desarrollo
- Carga de dist en produccion
- Scripts para escritorio e instalador Windows

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
- No tocar Firebase, Sync, Backup, Electron o Android cuando el bloque sea solo visual.
- Pantalla Hoy debe seguir siendo la entrada principal.
- Registro debe mantener ayuda ? integrada.
- Progreso debe ser detalle, no dashboard saturado.
