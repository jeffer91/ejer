# Android FitJeff

Esta carpeta deja preparada la salida APK de FitJeff para una publicación fuera de Play Store.

## Decisión del proyecto

- La APK será propia.
- No se publicará en Play Store inicialmente.
- La versión visible debe ser la misma que Windows/Electron.
- Android usará `versionName` igual a `package.json.version`.
- Android usará `versionCode` interno creciente.
- La instalación fuera de Play Store normalmente requiere confirmación del usuario en el celular.

## Flujo previsto

Desde la raíz del proyecto:

```bash
npm run build:android
```

O desde el menú:

```bash
scripts/actualizar-todo.bat
```

El script `scripts/build-android.cjs` hace dos cosas:

1. Si todavía no existe proyecto Android nativo, genera `release/latest-android.json` y deja el flujo preparado.
2. Si ya existe `android/app`, intenta compilar el APK y copiarlo a `release/FitJeff-Android-version.apk`.

## Pendiente para generar APK real

Más adelante se debe crear el proyecto Android real, preferiblemente con Capacitor:

```bash
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
npx cap init FitJeff com.jeff.fitjeff --web-dir=dist
npx cap add android
```

Después de eso, este bloque ya podrá compilar y publicar el APK junto con Windows.

## Firma

La APK debe firmarse siempre con la misma llave para que Android permita actualizar una versión sobre otra. Revisa `android/signing/README.md` antes de publicar una APK real.
