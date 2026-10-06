# Configurar Firebase

StreamLab usa [React Native Firebase](https://rnfirebase.io) para **Analytics**, **Crashlytics** y **Cloud Messaging**. Son módulos nativos: no funcionan en Expo Go y necesitan una build propia generada con EAS.

`app.config.ts` solo activa los plugins de Firebase cuando encuentra `google-services.json` (Android) o `GoogleService-Info.plist` (iOS) en la raíz. Sin esos ficheros la app usa adaptadores de consola y sigue funcionando.

## 1. Proyecto en Firebase Console

1. Entra en [console.firebase.google.com](https://console.firebase.google.com) → **Crear proyecto** y activa Google Analytics al crearlo.
2. **Añadir app → Android**:
   - Nombre del paquete: `dev.srdgz.streamlab` (debe coincidir con `android.package` de `app.config.ts`).
   - El SHA-1 no hace falta para Analytics, Crashlytics ni FCM.
   - Descarga `google-services.json` y guárdalo en la raíz del proyecto.
3. **Añadir app → iOS** (solo si tienes cuenta de pago de Apple Developer):
   - Bundle ID: `dev.srdgz.streamlab`.
   - Descarga `GoogleService-Info.plist` en la raíz.
   - Para push en iOS sube una clave APNs en *Configuración del proyecto → Cloud Messaging → Configuración de apps de Apple*.
4. **Crashlytics** no se activa con un botón: el panel muestra *Agregar SDK* hasta que llega el primer informe. El SDK ya está integrado en la app, así que no hay que seguir ese asistente; basta con generar la build y provocar un error (ver más abajo). Después del primer informe el panel se activa solo.

No hace falta cuenta de Google Play Console ni de Apple Developer para Analytics, Crashlytics ni Cloud Messaging en Android: el APK se instala directamente desde el enlace de EAS. Sin cuenta de Apple no se puede instalar la app en un iPhone físico, así que en iOS Firebase solo queda configurado para el futuro.

Los dos ficheros están en `.gitignore` (no se suben a GitHub) pero no en `.easignore`, así que EAS sí los recibe al compilar.

## 2. Build con EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

`eas init` crea el proyecto en Expo y muestra un `projectId`. Como la configuración es dinámica (`app.config.ts`), EAS no puede escribirlo solo: añádelo en `extra`:

```ts
extra: {
  firebaseEnabled,
  eas: { projectId: 'TU-PROJECT-ID' },
},
```

Genera el APK (perfil `preview`, distribución interna):

```bash
npx eas-cli@latest build --platform android --profile preview
```

Al terminar, EAS da un enlace y un QR para instalar el APK en el móvil (hay que permitir instalar apps de origen desconocido). Cualquier cambio de código requiere una build nueva, porque el APK lleva el JavaScript embebido.

## 3. Comprobar que funciona

Abre la app y entra en **Diagnóstico** (icono de pulso, arriba a la derecha). Debe indicar *Firebase Analytics*, *Firebase Crashlytics* y *Firebase Cloud Messaging* con el punto en verde, y mostrar el token FCM.

### Analytics

Activa DebugView con el móvil conectado por USB:

```bash
adb shell setprop debug.firebase.analytics.app dev.srdgz.streamlab
```

En *Analytics → DebugView* verás en tiempo real:

| Evento | Cuándo | Parámetros |
|---|---|---|
| `screen_view` | Cambio de pantalla | `screen_name` |
| `open_stream` | Abrir un contenido | `stream_id`, `category` |
| `playback_start` | Primer frame | `stream_id`, `startup_ms` |
| `playback_rebuffer` | Se vacía el buffer | `stream_id`, `count` |
| `playback_rebuffer_end` | Se recupera | `stream_id`, `duration_ms` |
| `playback_error` | Fallo de reproducción | `stream_id`, `message` |
| `playback_end` | Fin del contenido | `stream_id` |
| `track_change` | Cambio de audio o subtítulos | `stream_id`, `kind`, `language` |
| `diagnostics_test` | Botón de prueba | `source` |

Para desactivar DebugView: `adb shell setprop debug.firebase.analytics.app .none.`

### Crashlytics

- **Registrar error no fatal** (Diagnóstico) o abrir *Stream roto* envía un error no fatal; los errores de reproducción llevan los logs previos y el atributo `last_stream_id`.
- **Forzar crash de prueba** cierra la app. Vuelve a abrirla: Crashlytics envía el informe en el siguiente arranque y aparece en la consola en unos minutos.

### Cloud Messaging

1. En Diagnóstico pulsa **Copiar token**.
2. En Firebase Console → *Messaging* → **Nueva campaña → Notificaciones de Firebase**.
3. Escribe título y texto, pulsa **Enviar mensaje de prueba** y pega el token.
4. En *Opciones adicionales → Datos personalizados* añade la clave `streamId` con un id del catálogo (por ejemplo `redbull-tv`).

Comportamiento:

- App en primer plano: aparece un banner propio; al tocarlo se abre el reproductor.
- App en segundo plano o cerrada: Android muestra la notificación del sistema; al tocarla se abre el reproductor de ese stream.
- En Android 13+ la app pide el permiso de notificaciones al arrancar.

## Notas

- `google-services.json` no es una credencial privada, pero contiene una API key de Google; mantenerlo fuera del repositorio evita avisos del escaneo de secretos de GitHub.
- La integración vive en `src/infrastructure/firebase/FirebaseServices.ts` y se inyecta en `src/di/container.ts`. Las pantallas solo conocen las interfaces de `src/domain/services`.
