# FitJeff

App personal local-first para control corporal, actividad, entrenamiento, progreso visual, historial, backups, PWA y escritorio Electron.

## Estado actual

Fase visual 2026 cerrada: 12 de 12 bloques.

Bloques funcionales y correctivos aplicados:

- Bloque 13: revision para solucionar errores.
- Bloque 14: revision local completa.
- Bloque 15: Gemini persistencia blindada.
- Bloque 16: Medidas con popup visual.
- Bloque 17: Rutinas claro + pasos.
- Bloque 18: Jarvis claro.
- Bloque 19: Control corporal inteligente.
- Bloque 20: Dispositivos / Cubitt CT4 / Google Fit preparado.
- Bloque 21: Analisis y correccion de errores.

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

## Bloques aplicados

### Bloques 1 a 12 - Fase visual

Resultado general:

- Tema claro global.
- Shell simple.
- Pantalla Hoy.
- Registro con ayuda visual.
- Menu de Control corporal limpio.
- Progreso como vista de detalle.
- Inicio, Historial, Ajustes, Actualizaciones y Actividad manual en modo claro.
- Cierre documentado en `docs/fase-visual-2026-cierre.md`.

### Bloque 13 - Revision para solucionar errores

Resultado: fechas locales corregidas para evitar desfases por UTC.

### Bloque 14 - Revision local completa

Resultado: comando `npm run check:local` para revisar herramientas, estructura modular y build de Vite.

### Bloque 15 - Gemini persistencia blindada

Resultado: Gemini guarda API Key en almacenamiento separado y solo se borra desde accion explicita.

### Bloque 16 - Medidas con popup visual

Resultado: cada boton ? abre un popup visual con muñeco, zona de medicion resaltada y explicacion clara.

### Bloque 17 - Rutinas claro + pasos

Resultado: Rutinas queda en modo claro y se organiza por pasos: IA, Manual y Guardadas.

### Bloque 18 - Jarvis claro

Resultado: Jarvis de Diario y Jarvis HIT quedan en modo claro con panel compartido `jarvis-panel`.

### Bloque 19 - Control corporal inteligente

Archivos clave creados:

- `src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js`
- `src/features/control-corporal/analisis-corporal/analisis-corporal.presenter.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.view.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.css`

Resultado: Progreso cruza IMC, cintura/altura, cuello y contexto muscular antes de mostrar conclusiones.

### Bloque 20 - Dispositivos / Cubitt CT4 / Google Fit preparado

Archivos clave creados:

- `src/features/actividad/dispositivos/dispositivos.constants.js`
- `src/features/actividad/dispositivos/dispositivos.repository.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.view.js`
- `src/features/actividad/dispositivos/dispositivos.css`
- `src/features/actividad/dispositivos/adapters/cubitt.adapter.js`
- `src/features/actividad/dispositivos/adapters/google-fit.adapter.js`

Resultado: Actividad tiene pantalla Dispositivos para preparar Cubitt CT4, Google Fit y el puente de importacion.

### Bloque 21 - Analisis y correccion de errores

Corregido:

- `src/features/actividad/actividad.menu.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Actividad muestra el menu alineado con conexiones, Dispositivos refresca el panel despues de guardar y el service ayuda a preservar configuracion guardada.

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
- Pantalla Hoy debe seguir siendo la entrada principal.
- Registro debe mantener ayuda ? integrada.
- Progreso debe ser detalle, no dashboard saturado.
- Actividad manual debe conservarse aunque existan conexiones automaticas.
- La API Key de Gemini debe conservarse en almacenamiento separado.
- Rutinas debe mantenerse en modo claro y por pasos.
- Jarvis debe mantenerse en modo claro compartido para Diario y HIT.
- Control corporal debe cruzar IMC con medidas y contexto muscular antes de sacar conclusiones.

## Siguiente fase recomendada

Conectores reales y sincronizacion:

1. Confirmar fuente real de datos del reloj.
2. Implementar lectura real cuando exista fuente disponible.
3. Conectar Google Fit con autorizacion real.
4. Unificar datos importados con Actividad evitando duplicados.
