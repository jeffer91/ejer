# Release FitJeff

Esta carpeta se usa para preparar versiones publicables de FitJeff.

## Archivos importantes

- `latest.json`: manifiesto propio de FitJeff para registrar la versión publicada.
- `latest-android.json`: manifiesto Android para indicar si hay APK real o solo preparación.
- `latest.yml`: archivo generado por `electron-builder`, necesario para `electron-updater`.
- `*.exe`: instalador Windows generado por `electron-builder`.
- `*.blockmap`: archivo auxiliar de actualización diferencial.
- `*.apk`: APK Android, solo si ya existe proyecto Android/Capacitor compilable.

## Regla de seguridad

Los instaladores y APK generados no se versionan en Git. Solo se conservan los manifiestos livianos.

Antes de publicar, FitJeff ejecuta:

```bash
npm run release:check:built
```

Ese comando valida que:

1. El instalador `.exe` corresponda a la versión actual de `package.json`.
2. Exista `latest.yml` para `electron-updater`.
3. Exista `latest-android.json`.
4. No haya `.exe` o `.apk` viejos mezclados en `release/`.
5. GitHub Release publique solo artefactos de la versión actual.

## Flujo recomendado

Desde la raíz del proyecto:

```bash
ACTUALIZAR_VERSION_FITJEFF.bat
```

O directamente:

```bash
scripts/publicar-version.bat
```

El flujo de publicación hace lo siguiente:

1. Revisa herramientas.
2. Sincroniza con GitHub.
3. Instala dependencias.
4. Ejecuta revisión local.
5. Aumenta la versión pequeña.
6. Compila Windows.
7. Prepara Android/APK.
8. Ejecuta revisión final de artefactos.
9. Guarda y sube cambios a GitHub.
10. Crea un GitHub Release con los archivos necesarios.

Android no bloquea Windows: si no existe proyecto Android nativo, se publica el manifiesto `latest-android.json` con estado `preparado-sin-apk`.
