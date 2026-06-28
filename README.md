# FitJeff

App personal local-first para control corporal, actividad, entrenamiento, progreso visual, historial, backups, PWA y escritorio Electron.

## Estado actual

Fase visual 2026 cerrada.

Bloques completados de la fase visual: 12 de 12.

Bloques funcionales/correctivos aplicados:

- Bloque 13: revision para solucionar errores.
- Bloque 14: revision local completa.
- Bloque 15: Gemini persistencia blindada.
- Bloque 16: Medidas con popup visual.
- Bloque 17: Rutinas claro + pasos.
- Bloque 18: Jarvis claro.
- Bloque 19: Control corporal inteligente.
- Bloque 20: Dispositivos / Cubitt CT4 / Google Fit preparado.

La app queda con una base clara, simple y modular para continuar con conectores reales sin mezclar responsabilidades.

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

## Menu de Actividad

- Resumen
- Registrar
- Dispositivos

## Bloques visuales 2026 aplicados

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

Resultado: Actividad queda como modulo independiente con registro manual de pasos, minutos de bicicleta y kilometros de bicicleta.

### Bloque 12 - Cierre

Creado:

- `docs/fase-visual-2026-cierre.md`

Corregido:

- `scripts/check-structure.cjs`
- `README.md`

Resultado: fase visual cerrada, documentacion final creada y check de estructura actualizado para validar el cierre 12/12.

## Correcciones y nueva fase funcional

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

Resultado: Fechas locales corregidas para evitar desfases por UTC.

### Bloque 14 - Revision local completa

Creado:

- `scripts/check-local.cjs`

Corregido:

- `package.json`
- `README.md`

Resultado: comando `npm run check:local` para revisar herramientas, estructura modular y build de Vite.

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

Resultado: Gemini guarda API Key en almacenamiento separado y solo se borra desde accion explicita.

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

Resultado: cada boton ? abre un popup visual con muñeco, zona de medicion resaltada y explicacion clara.

### Bloque 17 - Rutinas claro + pasos

Creado:

- `src/features/entrenamiento/rutinas/rutinas.steps.js`
- `src/features/entrenamiento/rutinas/rutinas.stepper.view.js`
- `src/features/entrenamiento/rutinas/rutinas.stepper.css`

Corregido:

- `src/features/entrenamiento/rutinas/rutinas.view.js`
- `src/features/entrenamiento/rutinas/rutinas.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Rutinas queda en modo claro y se organiza por pasos: IA, Manual y Guardadas.

### Bloque 18 - Jarvis claro

Creado:

- `src/features/entrenamiento/jarvis/jarvis-panel.view.js`
- `src/features/entrenamiento/jarvis/jarvis-panel.css`

Corregido:

- `src/features/entrenamiento/diario/diario.css`
- `src/features/entrenamiento/hit/hit.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Jarvis de Diario y Jarvis HIT quedan en modo claro con panel compartido `jarvis-panel`.

### Bloque 19 - Control corporal inteligente

Creado:

- `src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js`
- `src/features/control-corporal/analisis-corporal/analisis-corporal.presenter.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.view.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.css`

Corregido:

- `src/features/control-corporal/registro.schema.js`
- `src/features/control-corporal/inicio/inicio.constants.js`
- `src/features/control-corporal/inicio/inicio.view.js`
- `src/features/control-corporal/inicio/inicio.validator.js`
- `src/features/control-corporal/inicio/inicio.service.js`
- `src/features/control-corporal/inicio/inicio.css`
- `src/features/control-corporal/registro/ingreso.constants.js`
- `src/features/control-corporal/registro/ayudas-medidas.constants.js`
- `src/features/control-corporal/registro/mapa-corporal.view.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-modal.constants.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-figura.svg.js`
- `src/features/control-corporal/registro/medidas-modal/medidas-modal.css`
- `src/features/control-corporal/estadisticas/estadisticas.calculations.js`
- `src/features/control-corporal/estadisticas/estadisticas.presenter.js`
- `src/features/control-corporal/estadisticas/estadisticas.view.js`
- `src/features/control-corporal/estadisticas/estadisticas.constants.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Progreso cruza IMC, cintura/altura, cuello y contexto muscular. También muestra un avatar corporal orientativo y evita juzgar el estado corporal solo por el peso.

### Bloque 20 - Dispositivos / Cubitt CT4 / Google Fit preparado

Creado:

- `src/features/actividad/dispositivos/dispositivos.constants.js`
- `src/features/actividad/dispositivos/dispositivos.repository.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.view.js`
- `src/features/actividad/dispositivos/dispositivos.css`
- `src/features/actividad/dispositivos/adapters/cubitt.adapter.js`
- `src/features/actividad/dispositivos/adapters/google-fit.adapter.js`

Corregido:

- `src/features/actividad/actividad.routes.js`
- `src/features/actividad/actividad.module.js`
- `src/features/actividad/actividad.constants.js`
- `src/features/actividad/actividad.service.js`
- `src/features/actividad/resumen/resumen.view.js`
- `src/features/actividad/resumen/resumen.css`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Actividad ahora tiene una pantalla Dispositivos para preparar Cubitt CT4, Google Fit y el puente de importacion. El identificador local del reloj se guarda desde la app en la PC y no queda fijo en el codigo.

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
- Actividad manual debe conservarse aunque existan conexiones automaticas.
- La API Key de Gemini debe conservarse en almacenamiento separado y solo borrarse desde la accion explicita.
- Las medidas corporales deben explicarse con popup visual, no solo con texto corto.
- Rutinas debe mantenerse en modo claro y por pasos, no como una pantalla larga saturada.
- Jarvis debe mantenerse en modo claro compartido para Diario y HIT.
- Control corporal debe cruzar IMC con medidas y contexto muscular antes de sacar conclusiones.
- Dispositivos debe guardar identificadores locales desde la app, no fijos en el codigo.

## Siguiente fase recomendada

Conectores reales y sincronizacion:

1. Confirmar fuente real de datos del reloj.
2. Implementar lectura real cuando exista fuente disponible.
3. Conectar Google Fit con autorizacion real.
4. Unificar datos importados con Actividad evitando duplicados.
