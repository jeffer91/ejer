# Android FitJeff

Esta carpeta deja preparada la salida APK de FitJeff para una publicación fuera de Play Store.

## Decisión del proyecto

- La APK será propia.
- No se publicará en Play Store inicialmente.
- La versión visible debe ser la misma que Windows/Electron.
- Android usará `versionName` igual a `package.json.version`.
- Android usará `versionCode` interno creciente.
- La instalación fuera de Play Store normalmente requiere confirmación del usuario en el celular.

## Organización

FitJeff usa Capacitor para convertir la app web local en una APK Android.

- Configuración principal: `capacitor.config.json`.
- Proyecto Android nativo generado: `android/native`.
- Configuración de actualización: `android/update-config.json`.
- APK publicable: `release/FitJeff-Android-version.apk`.
- Manifiesto Android: `release/latest-android.json`.

## Crear la APK

Desde la raíz del proyecto:

```bash
npm install
npm run build:android
```

Si antes apareció el error `The Capacitor CLI requires NodeJS >=22.0.0`, vuelve a ejecutar `git pull origin main` y después `npm install`. El proyecto quedó fijado a Capacitor `6.2.1` para evitar que `latest` instale una versión que pida Node 22.

El script hace esto:

1. Compila la app web con Vite.
2. Si no existe `android/native`, lo crea con Capacitor.
3. Sincroniza `dist` con Android.
4. Intenta generar APK release.
5. Si release no genera APK instalable, genera APK debug como respaldo.
6. Copia la APK final a `release/FitJeff-Android-version.apk`.
7. Actualiza `release/latest-android.json`.

## Crear APK desde GitHub Actions

También existe un flujo manual en GitHub Actions:

```text
Actions → Build Android APK → Run workflow
```

Ese flujo genera un artefacto descargable llamado `FitJeff-Android-APK`.

## Requisitos locales

Para generar APK en tu PC necesitas:

- Node.js instalado.
- Java/JDK instalado.
- Android Studio o Android SDK instalado.
- Variables de Android configuradas si Gradle no las detecta automáticamente.

## Nota importante sobre Bluetooth

La APK puede instalar y abrir FitJeff, pero el Bluetooth directo del Cubitt CT4 puede requerir después un módulo nativo Android. El código actual de reloj usa Web Bluetooth, que funciona en entornos compatibles de navegador/Electron, pero Android WebView no siempre lo expone igual.

Primero se genera la APK base. Luego se corrige la conexión Bluetooth nativa si Android no entrega `navigator.bluetooth`.

## Firma

La APK debug sirve para instalar y probar. Para actualización estable fuera de Play Store, la APK final debe firmarse siempre con la misma llave para que Android permita actualizar una versión sobre otra. Revisa `android/signing/README.md` antes de publicar una APK real.
