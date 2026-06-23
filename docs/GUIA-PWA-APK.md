# Guía PWA / APK - FitJeff

## Estado final

FitJeff queda preparado como:

```txt
- Web app local
- PWA instalable
- Firebase Hosting
- Electron escritorio
- Base para APK usando Trusted Web Activity o wrapper Android posterior
```

## PWA

Para probar PWA:

```bash
npm install
npm run serve
```

Abrir:

```txt
http://127.0.0.1:5500
```

Luego revisar:

```txt
- Manifest cargado
- Service Worker registrado
- Botón Actualizar app
- Instalación disponible en navegador compatible
```

## Publicar en Firebase Hosting

```bash
npm install
npm run check:release
npm run firebase:hosting
```

## Actualizar app instalada

Cada cambio importante debe subir el build en:

```txt
public/version.json
service-worker.js
```

Proceso en la app:

```txt
1. Abrir Ajustes.
2. Presionar Buscar actualización.
3. Presionar Actualizar app.
4. La app limpia caché y recarga.
```

## APK

La ruta más limpia para APK es:

```txt
PWA publicada en Firebase Hosting
+
Trusted Web Activity
```

Opciones:

```txt
1. Bubblewrap / TWA para Android.
2. Capacitor si se quiere empaquetar con más control.
3. WebView Android si se quiere una APK simple.
```

Recomendación:

```txt
Primero publicar y probar la PWA.
Después crear APK con TWA.
```

## Pendiente para APK real

```txt
- Tener dominio HTTPS estable.
- Tener iconos PNG 192x192 y 512x512 si Android lo exige.
- Revisar nombre de paquete Android.
- Generar firma.
- Probar instalación en teléfono.
```
