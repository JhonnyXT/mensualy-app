---
name: run-on-device
description: |
  Compilar e instalar Mensualy (Expo/React Native) en el dispositivo Android
  conectado por USB, y levantar Metro para desarrollo. Usar cuando el usuario
  pida correr, probar, ver en el celular, o verificar visualmente un cambio de
  Mensualy. Cubre el workaround de adb en este sandbox y los pasos de rebuild
  nativo cuando se agregan dependencias nativas.
license: MIT
metadata:
  project: mensualy-app
  stack: expo-react-native
---

## Contexto del entorno

- El dispositivo del usuario está conectado por **USB** — `adb devices` ya lo
  detecta. No perder tiempo con `--tunnel` (falla, `@expo/ngrok` no resuelve
  bien en este entorno) ni con la IP LAN (puede no ser alcanzable desde el
  sandbox) — usar `adb reverse` en su lugar.
- Metro de Mensualy usa el puerto **8095**. Otros proyectos Expo en este mismo
  sandbox pueden estar corriendo en 8081/8082/8083 — no matarlos, no son
  nuestros.
- El sandbox **mata el daemon de `adb` entre invocaciones separadas del tool
  Bash**. Si `adb devices`/`install`/`reverse` falla con
  `protocol fault (couldn't read status): Connection reset by peer`, es eso.
  Workaround: `nohup adb nodaemon server -a > /tmp/adb-server.log 2>&1 &` en
  foreground, seguido de `sleep 2`, dentro de la MISMA llamada de Bash que los
  comandos cliente que siguen (`scripts/build-android.sh` ya lo hace solo).

## Variantes (dev/test/prod)

Ver `app.config.ts` → tabla `variants`. Cada variant tiene su propio
`applicationId` (`com.mensualy.app[.dev|.test]`), así que dev/test/prod se
instalan una al lado de la otra en el mismo dispositivo, cada una con su
propia base de datos SQLite.

- **`dev`** (`assembleDebug`): se instala **una sola vez**; después queda
  conectado a Metro y un cambio de JS/TSX solo necesita recargar la app, NO
  volver a correr el build. Es el variant para iterar día a día.
- **`test`** (`assembleRelease`): JS ya empaquetado adentro del APK, standalone,
  sin Metro — para probar un build "limpio". Se instala como upgrade normal
  (`adb install -r`, sin desinstalar antes): la primera vez que se baja en un
  dispositivo queda vacía (instalación nueva de verdad), pero si ya estaba
  instalada con datos, una nueva `build:test` los conserva y solo actualiza
  el código — igual que le pasaría a un usuario real. Solo se pierden los
  datos si cambia la firma (pasa si se alterna con builds de `dev`, que
  fuerza un `prebuild --clean` y regenera `debug.keystore`); en ese caso el
  script no desinstala solo, avisa y pide confirmación manual.
- **`prod`**: solo con EAS (`npm run eas:prod`), nunca local. Cada instalación
  real de un usuario nuevo arranca vacía siempre (no hay datos de prueba ni
  seed más allá de las categorías por defecto) — no hace falta nada especial
  acá, es el comportamiento natural de una instalación nueva.

## Paso 1 — ¿hace falta recompilar el APK nativo?

Solo si cambiaron dependencias con código nativo (cualquier paquete `expo-*`
nuevo, `react-native-gesture-handler`, `react-native-reanimated`,
`react-native-worklets`, o cambios en `app.config.ts` → `plugins`/`ios`/
`android`). **Si solo cambió JS/TSX y el dev build ya está instalado, saltar
directo al Paso 3** — Metro sirve el bundle nuevo con solo recargar la app, no
hace falta reinstalar nada.

```bash
cd /home/usuario/Documentos/me/code/mensualy-app
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
npm run build:dev   # prebuild + assembleDebug + adb install, ver scripts/build-android.sh
```

Correrlo en background y monitorear el log en vez de bloquear la conversación
(puede tardar 8-12 min en frío):

```bash
npm run build:dev > /tmp/mensualy-build-dev.log 2>&1 &
disown
```

## Paso 2 — Metro

```bash
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
ADB="$ANDROID_HOME/platform-tools/adb"
nohup "$ADB" nodaemon server -a > /tmp/adb-server.log 2>&1 &
sleep 2
"$ADB" reverse tcp:8095 tcp:8095
# El dev build busca el packager en el puerto 8081 POR DEFECTO, sin importar
# en qué puerto corra Metro realmente — sin este segundo reverse la app queda
# pegada en el splash nativo reintentando conectar en bucle (logcat muestra
# IOException ... http://localhost:8081/...).
"$ADB" reverse tcp:8081 tcp:8095

cd /home/usuario/Documentos/me/code/mensualy-app
nohup env APP_VARIANT=dev npx expo start --port 8095 > /tmp/expo-mensualy.log 2>&1 &
disown
sleep 12
tail -30 /tmp/expo-mensualy.log
```

Si ya había un Metro de Mensualy corriendo en 8095 de una sesión anterior, no
relanzar — solo reconectar el dispositivo (Paso 3).

## Paso 3 — abrir/recargar la app

```bash
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
ADB="$ANDROID_HOME/platform-tools/adb"
"$ADB" shell am force-stop com.mensualy.app.dev
sleep 1
"$ADB" shell monkey -p com.mensualy.app.dev -c android.intent.category.LAUNCHER 1
```

Si aun así no bundlea (splash nativo pegado, sin logs nuevos en
`/tmp/expo-mensualy.log`), forzar que la app apunte a Metro explícitamente vía
el deep link propio del dev client (usa el `scheme` del variant, ver
`app.config.ts` → `variants.dev.scheme`, no el `applicationId`):

```bash
"$ADB" shell am start -a android.intent.action.VIEW \
  -d "mensualy-dev://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8095"
```

Primer arranque en frío con caché de Metro vacía puede tardar bastante en
bundlear — no asumir que colgó, esperar y revisar el log antes de diagnosticar.

## Verificar

Para tareas normales, el usuario prefiere probar él mismo en el dispositivo —
no tomar capturas de pantalla (`adb screencap`) salvo que se esté
diagnosticando activamente un bug visual que él ya reportó, o que lo pida
explícitamente.

**Excepción confirmada — iteración de diseño/UI a partir de mockups**: en
sesiones de rediseño visual (implementar un HTML de referencia, ajustar
tamaños/colores/spacing), el usuario SÍ espera captura y verificación
proactiva en el dispositivo después de cada cambio, sin que lo pida cada vez
— ver memoria `design_iteration_feedback`.

## Reset de datos

```bash
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
"$ANDROID_HOME/platform-tools/adb" shell pm clear com.mensualy.app.dev
```

Borra todos los datos del variant `dev` (vuelve al estado de instalación
limpia, vuelve a correr el seed de categorías, y si había datos de estado tipo
"onboarding completado" los resetea también). Avisar antes si el usuario tenía
datos de prueba que quería conservar.

## Gotchas ya resueltos (no repetir el diagnóstico)

- `expo-splash-screen` en Android referencia `@drawable/splashscreen_logo` en
  el tema del sistema (splash de Android 12+) SIEMPRE, aunque el plugin no
  reciba `image` — sin imagen, el build falla al linkear recursos.
  `assets/splash-icon.png` ya es el logo real (ver memoria `branding_assets`),
  no un placeholder — si se reemplaza el logo de nuevo, `imageWidth` en
  `app.config.ts` debe mantenerse igual a `ICON_SIZE` en
  `src/core/design-system/components/AnimatedSplash.tsx` (no hay una sola
  fuente de verdad, es sincronización manual) o el logo "salta" de tamaño en
  el hand-off nativo → JS.
- **`adb reverse` se pierde cuando se reinicia el server de `adb`** (kill-server/
  start-server, o al reconectar el cable) — no es lo mismo que el gotcha de
  arriba del daemon muerto entre llamadas de Bash. Si la app queda pegada en
  el splash nativo (JS nunca carga) después de reconectar el dispositivo o de
  un `adb kill-server`, primero reponer:
  ```bash
  "$ADB" reverse tcp:8095 tcp:8095
  "$ADB" reverse tcp:8081 tcp:8095
  ```
  antes de asumir que es un bug de la app — pasó varias veces en la misma
  sesión de trabajo y cada vez era solo esto.
- Sin Watchman instalado en este sandbox, el file-watcher de Metro a veces no
  detecta archivos nuevos — puede seguir sirviendo un bundle desactualizado
  de forma silenciosa. Si algo no refleja un cambio reciente, reiniciar Metro
  con `-c` (limpia caché) y, si sigue sin reflejarse, verificar con
  `npx expo export --platform android` (build real, no depende del dev
  server) antes de seguir debuggeando el código de la app.
- **`adb install`/`adb install -r` se cuelga silenciosamente** (el mismo
  gotcha del daemon muerto entre llamadas de Bash, pero durante un
  `build:dev`/`build:test` que corre en background — el `nohup adb nodaemon
  server` del script queda en OTRA invocación de Bash que ya terminó). Si el
  log del build se queda parado justo después de `==> adb install`, matar el
  proceso `adb install` colgado (`ps aux | grep "adb install"`, `kill -9
  <pid>`), reponer el daemon (`nohup adb nodaemon server -a & sleep 2`) e
  instalar el APK a mano con `adb install -r
  android/app/build/outputs/apk/<debug|release>/app-<debug|release>.apk` —
  pasó en varias builds seguidas, siempre se resuelve así.

## Diagnosticar un glitch visual (flash, corte, artefacto de animación)

No alcanza con mirar screenshots sueltos — una captura de `adb screencap` cae
en un instante arbitrario y puede no coincidir con el frame problemático.
Grabar la interacción con `adb shell screenrecord` y extraer frames con
`ffmpeg` da control real sobre el timing:

```bash
"$ADB" shell screenrecord --bit-rate 20000000 --time-limit 3 /sdcard/rec.mp4 &
RECPID=$!
sleep 1
"$ADB" shell input tap X Y   # la interacción a diagnosticar
wait $RECPID
"$ADB" pull /sdcard/rec.mp4 /tmp/rec.mp4
"$ADB" shell rm /sdcard/rec.mp4
ffmpeg -y -i /tmp/rec.mp4 -vf fps=30 /tmp/frames/f%03d.png
```

`--bit-rate 20000000` (20 Mbps, muy por encima del default) es importante:
sin eso, cambios grandes de pantalla de golpe (como un sheet cerrándose)
pueden mostrar corrupción del encoder H.264 que se ve igual a un bug real
pero es solo compresión — si el mismo frame "raro" aparece IDÉNTICO en varias
pruebas con código distinto, sospechar del encoder primero y confirmar
grabando en alta calidad antes de seguir cambiando código a ciegas (así se
diagnosticó el fogonazo negro de `animationType="slide"`, ver
[[modal_sheets_architecture]] — costó varias rondas hasta separar "artefacto
de grabación" de "bug real").
