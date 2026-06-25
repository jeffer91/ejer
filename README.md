# FitJeff

Repositorio limpio para rehacer la app desde cero.

## Bloque 1

Base inicial creada:

- Vite
- HTML principal
- Manifest PWA
- Icono base
- App bootstrap
- Router base
- Estilos base
- Service worker reservado

## Bloque 2

Base central del modulo Registro creada:

- Modulo central
- Constantes
- Estado
- Esquema de datos
- Repository local
- Service principal
- Estilos propios del modulo

## Bloque 3

Inicio de primera vez creado:

- Altura
- Fecha de nacimiento
- Peso inicial
- Peso objetivo
- Validacion inteligente basica
- Guardado en Registro
- Salto automatico a Estadisticas

## Bloque 4

Registro e Ingreso creado:

- Peso diario maximo una vez por dia
- Medidas semanales
- Campos rapidos e inteligentes
- Validacion de rangos corporales
- Deteccion de cambios poco comunes
- Confirmacion antes de guardar datos raros
- Conexion real desde el menu Registro

## Bloque 5

Estadisticas creado:

- Peso actual
- Peso objetivo
- Cambio desde el ultimo registro
- Tendencia desde 3 registros
- IMC con categoria
- Proxima medicion semanal
- Barra de progreso del objetivo
- Grafico simple de peso
- Tarjetas compactas de medidas corporales
- Conexion real como pantalla principal por defecto

## Bloque 6

Historial creado:

- Lista compacta por fecha
- Visualizacion de peso y medidas guardadas
- Edicion de registros
- Confirmacion antes de borrar
- Envio a papelera interna
- Consulta simple de cambios
- Conexion real desde el menu Historial

## Bloque 7

Ajustes creado:

- Perfil simple
- Objetivo simple
- Editar altura
- Editar fecha de nacimiento
- Editar peso objetivo
- Reabrir Inicio desde Ajustes
- Conexion real desde el menu Ajustes

## Bloque 8

Core local y control de datos creado:

- Configuracion central de app
- Utilidades de fecha
- Utilidades de numeros
- Storage local seguro
- Estado visible Datos al dia
- Diagnostico interno oculto
- Manejo general de errores simples
- Conexion del manejador de errores al arranque

## Bloque 9

Firebase y sync base creado:

- Dependencia Firebase agregada
- Configuracion Firebase preparada
- Inicializacion segura de Firebase
- Servicio base Firestore
- Manejo simple de errores Firebase
- Cola local de sincronizacion
- Estado interno de sincronizacion
- Servicio coordinador de sincronizacion

## Bloque 10

Backups y exportacion local creado:

- Copia local automatica
- Lista corta de backups locales
- Exportar JSON desde Ajustes
- Importar JSON desde Ajustes
- Restaurar datos locales
- Copia previa antes de restaurar
- Proteccion contra perdida de informacion

## Comandos

```bash
npm install
npm run dev
```

La app crecera por bloques, manteniendo Registro, Estadisticas, Historial y Ajustes bien separados.
