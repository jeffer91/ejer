# FitJeff

App personal local-first para control corporal, actividad, entrenamiento, progreso visual, historial, backups, PWA y escritorio Electron.

## Estado actual

Fase visual 2026 cerrada.

Bloques completados: 12 de 12.

Bloque 13 aplicado: revision para solucionar errores.

Bloque 14 aplicado: revision local completa.

Bloque 15 aplicado: Gemini persistencia blindada.

Bloque 16 aplicado: Medidas con popup visual.

La app queda con una base clara, simple y modular para continuar con mejoras funcionales sin mezclar responsabilidades.

## Pantalla principal

- Hoy

## Modulos visibles

- Control corporal
- Actividad
- Entrenamiento
- Sistema

## Menu de Control corporal

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

Resultado: modo claro global, tarjetas limpias, texto oscuro legible, sombras suaves e indicadores fuertes.

### Bloque 2 - Shell simple

Corregido:

- `src/shell/shell.view.js`

Resultado: menos lenguaje tecnico, menu como Secciones y submenu como Acciones.

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

Resultado: FitJeff abre en Hoy y muestra conclusion, accion recomendada, tarjetas compactas, mini grafico y accesos rapidos.

### Bloque 4 - Registro con ayuda integrada

Creado:

- `src/features/control-corporal/registro/ayudas-medidas.constants.js`
- `src/features/control-corporal/registro/mapa-corporal.view.js`
- `src/features/control-corporal/registro/mapa-corporal.css`

Corregido:

- `src/features/control-corporal/registro/ingreso.view.js`
- `src/features/control-corporal/registro/ingreso.css`
- `src/features/control-corporal/registro/ingreso.constants.js`

Resultado: cada campo importante tiene boton ?, explicacion integrada y mapa corporal visual.

### Bloque 5 - Menu de Control corporal limpio

Corregido:

- `src/features/control-corporal/control-corporal.routes.js`

Resultado: se quito Guia de medidas del menu visible porque la ayuda vive dentro de Registro.

### Bloque 6 - Progreso como vista de detalle

Creado:

- `src/features/control-corporal/estadisticas/estadisticas.presenter.js`

Corregido:

- `src/features/control-corporal/estadisticas/estadisticas.view.js`
- `src/features/control-corporal/estadisticas/estadisticas.css`
- `src/features/control-corporal/estadisticas/estadisticas.constants.js`

Resultado: Estadisticas pasa a funcionar visualmente como Progreso, con resumen, avance, grafico, detalle de peso y medidas.

### Bloque 7 - Estructura y documentacion

Corregido:

- `scripts/check-structure.cjs`
- `README.md`

Resultado: el check reconoce tema claro, Hoy, Registro visual y Progreso con presenter.

### Bloque 8 - Inicio claro y salida hacia Hoy

Corregido:

- `src/features/control-corporal/inicio/inicio.constants.js`
- `src/features/control-corporal/inicio/inicio.controller.js`
- `src/features/control-corporal/inicio/inicio.view.js`
- `src/features/control-corporal/inicio/inicio.css`
- `scripts/check-structure.cjs`

Resultado: Inicio usa modo claro y abre Hoy al completar la configuracion inicial.

### Bloque 9 - Historial y Ajustes claros

Corregido:

- `src/features/control-corporal/historial/historial.css`
- `src/modules/ajustes/ajustes.view.js`
- `src/modules/ajustes/ajustes.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Historial y Ajustes quedan alineados al modo claro.

### Bloque 10 - Revision visual e integracion final

Corregido:

- `src/modules/actualizaciones/actualizaciones.css`
- `src/features/entrenamiento/stats/stats.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Actualizaciones y Stats de Entrenamiento quedan alineados al modo claro.

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

Resultado: Actividad queda como modulo independiente con registro manual de pasos, minutos de bicicleta y kilometros de bicicleta.

### Bloque 12 - Cierre

Creado:

- `docs/fase-visual-2026-cierre.md`

Corregido:

- `scripts/check-structure.cjs`
- `README.md`

Resultado: fase visual cerrada, documentacion final creada y check de estructura actualizado para validar el cierre 12/12.

## Correccion de errores

### Bloque 13 - Revision para solucionar errores

Corregido:

- `src/core/utils/date.util.js`
- `src/features/control-corporal/registro/ingreso.parser.js`
- `src/features/control-corporal/registro/registro.controller.js`
- `src/features/control-corporal/registro.service.js`
- `src/features/control-corporal/inicio/inicio.service.js`
- `src/features/control-corporal/hoy/hoy.rules.js`
- `src/features/control-corporal/estadisticas/estadisticas.calculations.js`
- `src/features/actividad/actividad.constants.js`
- `src/features/actividad/actividad.service.js`
- `src/features/actividad/registro/registro.controller.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Fechas locales corregidas para evitar desfases por UTC en Hoy, Registro, Inicio, Progreso y Actividad.

### Bloque 14 - Revision local completa

Creado:

- `scripts/check-local.cjs`

Corregido:

- `package.json`
- `README.md`

Resultado: nuevo comando `npm run check:local` para revisar herramientas, estructura modular y build de Vite antes de abrir la app.

## Nueva fase funcional

### Bloque 15 - Gemini persistencia blindada

Creado:

- `src/features/entrenamiento/ajustes/gemini-settings.repository.js`
- `src/features/entrenamiento/ajustes/gemini-settings.service.js`
- `src/features/entrenamiento/ajustes/gemini-settings.migration.js`

Corregido:

- `src/features/entrenamiento/entrenamiento.constants.js`
- `src/features/entrenamiento/ajustes/ajustes.service.js`
- `src/features/entrenamiento/ajustes/ajustes.view.js`
- `src/features/entrenamiento/ajustes/ajustes.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Gemini ahora tiene almacenamiento separado para la API Key, migracion desde ajustes antiguos, conservacion cuando el campo queda vacio, estado visible de persistencia y boton de borrado explicito.

### Bloque 16 - Medidas con popup visual

Creado:

- `src/features/control-corporal/registro/medidas-modal/medidas-modal.constants.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-figura.svg.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-modal.view.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-modal.css`

Corregido:

- `src/features/control-corporal/registro/ayudas-medidas.constants.js`
- `src/features/control-corporal/registro/ingreso.view.js`
- `src/features/control-corporal/registro/ingreso.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: cada boton ? de Registro abre un popup visual con muñeco, zona de medicion resaltada, explicacion clara, errores comunes y consejo para repetir la medicion.

## Documento de cierre

El cierre detallado de la fase visual esta en:

```txt
 docs/fase-visual-2026-cierre.md
```

## Comandos

Instalar dependencias:

```bash
npm install
```

Revisar estructura:

```bash
npm run check:structure
```

Revisar estructura, herramientas y build local:

```bash
npm run check:local
```

Abrir en navegador:

```bash
npm run dev
```

Abrir en Electron:

```bash
npm run electron:dev
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
- La API Key de Gemini debe conservarse en almacenamiento separado y solo borrarse desde la accion explicita.
- Las medidas corporales deben explicarse con popup visual, no solo con texto corto.

## Siguiente fase recomendada

Fase funcional de Actividad y Entrenamiento:

1. Rutinas claro + pasos.
2. Jarvis claro.
3. Control corporal inteligente.
4. Dispositivos / Cubitt CT4 / Google Fit preparado.
