# Plantilla de funcionalidad

Copia esta carpeta para crear una funcionalidad nueva.

## Pasos

1. Duplica `_template` con el nombre real del modulo.
2. Cambia `template` por el nombre real en archivos, ids y funciones.
3. Agrega las pantallas necesarias.
4. Importa el menu y el montador en `src/features/features.registry.js`.
5. Agrega el menu en `FEATURE_MODULES`.
6. Agrega el montador en `FEATURE_MOUNTERS`.

## Estructura base

- `template.routes.js`: rutas internas.
- `template.menu.js`: datos para el menu superior.
- `template.module.js`: entrada unica para montar pantallas.
- `pantalla-principal/`: ejemplo minimo de pantalla.
