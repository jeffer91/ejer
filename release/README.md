# Release FitJeff

Esta carpeta se usa para preparar versiones publicables de FitJeff.

## Archivos importantes

- `latest.json`: manifiesto propio de FitJeff para registrar la versión publicada.
- `latest.yml`: archivo generado por `electron-builder`, necesario para `electron-updater`.
- `*.exe`: instalador Windows generado por `electron-builder`.
- `*.blockmap`: archivo auxiliar de actualización diferencial.

## Flujo recomendado

Desde la raíz del proyecto:

```bash
scripts/actualizar-todo.bat
```

O directamente:

```bash
scripts/publicar-version.bat
```

El flujo de publicación hace lo siguiente:

1. Revisa herramientas.
2. Sincroniza con GitHub.
3. Instala dependencias.
4. Aumenta la versión pequeña.
5. Compila Windows.
6. Guarda cambios en Git.
7. Sube cambios a GitHub.
8. Crea un GitHub Release con los archivos necesarios.

La APK se integrará en el bloque Android posterior.
