# Firma APK FitJeff

Esta carpeta documenta la firma de la APK de FitJeff.

## Regla principal

Para que Android permita actualizar una APK instalada sobre otra APK nueva, ambas deben estar firmadas con la misma llave.

Si cambias la llave después, Android tratará la nueva APK como una app diferente o bloqueará la actualización.

## Archivos sensibles

No subas llaves reales al repositorio.

No se deben subir archivos como:

```text
*.jks
*.keystore
*.p12
*.pem
*.key
```

Guarda la llave real en una carpeta local segura fuera del repositorio y haz copia de seguridad.

## Datos que se definirán cuando creemos el proyecto Android real

```text
KEYSTORE_PATH=ruta-local-segura
KEY_ALIAS=fitjeff
KEYSTORE_PASSWORD=privado
KEY_PASSWORD=privado
```

## Flujo esperado después

1. Crear proyecto Android/Capacitor.
2. Crear llave de firma.
3. Configurar firma release.
4. Generar APK release.
5. Publicar APK en GitHub Releases junto con Windows.
6. La app Android detectará versión nueva, descargará APK y pedirá confirmación de instalación.

## Advertencia

La instalación silenciosa total no debe asumirse fuera de Play Store. En celulares Android normales, la instalación de APK externa requiere permiso del usuario y confirmación del sistema.
