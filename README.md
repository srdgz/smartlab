# StreamLab

[![CI](https://github.com/srdgz/streamlab-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/srdgz/streamlab-demo/actions/workflows/ci.yml)
![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Analytics%20%C2%B7%20Crashlytics-FFCA28?logo=firebase)

App OTT de demostración para iOS y Android hecha con React Native y Expo. Reproduce streams públicos **HLS** y **MPEG-DASH** con el reproductor nativo de cada plataforma, mide la calidad de experiencia (QoE) en tiempo real e integra **Firebase** para analítica e informes de errores. La interfaz está en inglés y se adapta a móvil, tablet y escritorio en vertical y horizontal.

## Funcionalidades

- **Catálogo** con portada destacada, carrusel de canales en directo, carrusel de VOD con pósters y una sección *Lab* con casos técnicos (DASH, stream roto). Skeleton de carga, pull-to-refresh y cabecera que se opaca con el scroll.
- **Reproductor** con [`expo-video`](https://docs.expo.dev/versions/v57.0.0/sdk/video/) (AVPlayer en iOS, ExoPlayer/Media3 en Android): controles nativos, pantalla completa, Picture-in-Picture y reproducción en segundo plano.
- **Rendimiento**: tiempo hasta el primer frame (TTFF), número y duración de rebuffers, resolución, bitrate y codec de la rendition activa, buffer disponible, latencia al directo y escalera ABR con la calidad actual resaltada.
- **Audio y subtítulos**: selección de las pistas declaradas en el manifiesto HLS.
- **Errores**: pantalla de error con reintento y reporte a Crashlytics como error no fatal.
- **Diagnostics**: pantalla que muestra qué servicios están activos y lanza eventos y errores de prueba.
- **Responsive**: breakpoints *compact* (< 600 px), *medium* (600-1023 px) y *expanded* (≥ 1024 px), con márgenes de safe area. En horizontal o en pantallas anchas el reproductor se divide en dos columnas; las métricas pasan a tres columnas en tablet y el contenido se centra a 1200 px en escritorio.

## Stack

| Área | Tecnología |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19, TypeScript estricto |
| Navegación | Expo Router |
| Vídeo | expo-video (HLS, DASH en Android, PiP, background) |
| UI | Design tokens propios, Plus Jakarta Sans, expo-image, expo-linear-gradient, Animated API, expo-haptics |
| Firebase | React Native Firebase: Analytics y Crashlytics |
| Calidad | Jest, React Native Testing Library, ESLint (`eslint-config-expo`), Prettier, GitHub Actions |
| Distribución | EAS Build |

## Arquitectura

Clean Architecture: las dependencias apuntan hacia el dominio y la UI se organiza con Atomic Design.

```
src/
├── domain/              Reglas de negocio. Sin React ni Expo.
│   ├── entities/        Stream, Catalog, PlaybackSession (máquina de estados de QoE)
│   ├── repositories/    CatalogRepository (puerto)
│   ├── services/        AnalyticsService, CrashReporter (puertos)
│   ├── usecases/        GetCatalog, GetStream, ReportPlaybackEvent
│   └── errors/
├── data/                Implementación del repositorio
│   ├── dto/  mappers/   Contrato externo → entidades, con validación en runtime
│   ├── datasources/     Local (JSON embebido), Remote (REST con timeout) y Fallback
│   └── repositories/    Caché en memoria y deduplicación de peticiones
├── infrastructure/      Adaptadores de servicios externos
│   ├── firebase/        Analytics y Crashlytics
│   └── console/         Alternativas para Expo Go y web
├── di/                  Composition root: elige adaptadores según el entorno
├── presentation/
│   ├── components/
│   │   ├── atoms/       AppText, Button, IconButton, Badge, Chip, LiveDot, Skeleton, Artwork…
│   │   ├── molecules/   PosterCard, ChannelCard, LabStreamRow, MetricTile, SegmentedControl…
│   │   └── organisms/   HeroBanner, StreamRail, VideoStage, PlaybackInsights, TrackPanel…
│   ├── screens/         Catalog, Player, Diagnostics
│   ├── hooks/           usePlaybackSession, usePlayerTelemetry, useLayout, useAsync
│   └── theme/           Colores, tipografía, espaciado y radios
└── app/                 Rutas de Expo Router (solo delegan en screens)
```

Decisiones destacadas:

- **QoE como función pura**: `advanceSession` recibe el estado y una señal del player y devuelve el nuevo estado y los eventos de analítica. Se testea sin reproductor.
- **Firebase detrás de puertos**: `ReportPlaybackEvent` decide qué va a Analytics y qué a Crashlytics. En Expo Go el contenedor inyecta adaptadores de consola; en una build nativa, los de Firebase. Ninguna pantalla cambia.
- **Catálogo intercambiable**: `EXPO_PUBLIC_CATALOG_URL` cambia el origen local por un endpoint REST sin tocar código. Si la red falla, el catálogo embebido actúa como fallback offline.
- **Layout centralizado**: `useLayout` calcula breakpoint, márgenes y safe areas; los componentes no usan anchos fijos.

## Empezar

Requisitos: Node 24 y la app **Expo Go** en el móvil.

```bash
npm install
npm start
```

Escanea el QR con Expo Go. Todo funciona salvo Firebase, que en Expo Go se sustituye por logs en la consola de Metro.

| Script | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo de Expo |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |
| `npm run format` | Formatea con Prettier |
| `npm run format:check` | Comprueba el formato (lo usa el CI) |
| `npm test` | Tests |
| `npm run test:coverage` | Tests con informe de cobertura en `coverage/` |
| `npm run doctor` | Revisa la compatibilidad de dependencias con el SDK |

Variables de entorno opcionales (fichero `.env.local`, ignorado por git):

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_CATALOG_URL` | URL de un catálogo JSON remoto con el mismo formato que `src/data/datasources/catalog.json` |

## Firebase

Necesita una build nativa con EAS. Pasos completos en [docs/firebase.md](docs/firebase.md). En resumen:

1. Crea el proyecto en Firebase Console y una app Android con el paquete `dev.srdgz.streamlab`.
2. Copia `google-services.json` a la raíz (está en `.gitignore`).
3. `npx eas-cli@latest build --platform android --profile preview` e instala el APK.

## Tests

33 tests en 4 suites con `jest-expo`:

- **Unitarios de dominio**: máquina de estados de QoE (arranque, rebuffers, errores, pausa y fin) y casos de uso con dobles de prueba.
- **Unitarios de datos**: validación y mapeo del contrato, datasource REST con `fetch` simulado (HTTP 5xx, fallo de red) repositorio (caché, deduplicación, refresco forzado) y fallback offline.
- **Contrato**: el catálogo embebido cumple el formato esperado.
- **Componentes**: React Native Testing Library, con interacción y consultas accesibles.

## CI

GitHub Actions (`.github/workflows/ci.yml`) se ejecuta en cada push a `main`, en cada pull request contra `main` y a mano desde la pestaña *Actions*. Instala con `npm ci` y ejecuta typecheck, lint, comprobación de formato y tests con cobertura; el informe se guarda como artefacto durante 7 días.

## Créditos

- Imágenes de *Tears of Steel* y *Big Buck Bunny*: © Blender Foundation, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), vía Wikimedia Commons.
- Streams de prueba públicos de Unified Streaming, Mux, Apple, Google Shaka, Akamai y Red Bull Media House. Solo se usan con fines de demostración.

## Licencia

[MIT](LICENSE)
