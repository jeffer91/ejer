# Deploy final - FitJeff

## 1. Revisar archivos

```bash
npm run check:release
```

Debe terminar sin errores.

## 2. Probar local

```bash
npm run serve
```

Abrir:

```txt
http://127.0.0.1:5500
```

Probar:

```txt
- Inicio
- Entrenar
- Guiado
- Rutinas
- Medidas
- Reportes
- Jarvis
- Diagnóstico
- Ajustes
```

## 3. Publicar hosting

```bash
npm run firebase:hosting
```

## 4. Publicar funciones

Solo si ya están configuradas las variables de entorno:

```bash
npm run firebase:functions
```

Variable necesaria:

```txt
GEMINI_API_KEY
```

## 5. Publicación completa

```bash
npm run firebase:deploy
```

## 6. Después de publicar

Abrir la app publicada y ejecutar:

```txt
Ajustes → Buscar actualización → Actualizar app
```

Luego:

```txt
Diagnóstico → Ejecutar diagnóstico
```

## 7. Validación final esperada

```txt
- Build actual: 11
- Service Worker registrado
- Manifest válido
- Diagnóstico sin errores críticos
- Firebase en modo preparado
- Jarvis local funcionando
- Jarvis remoto funcionando solo si Functions + Gemini están activos
```
