#!/usr/bin/env bash
# Build local por variant (dev/test). Ver "Build variants" en el skill del proyecto.
#
# Mismo patrón que anchor-app: `dev` es `assembleDebug` — se instala UNA vez y
# después queda conectado a Metro; un cambio de JS/TSX solo necesita recargar
# la app, no correr este script de nuevo (ver Paso 1 del skill run-on-device).
# `test` es el build standalone (`assembleRelease`, JS ya empaquetado, sin
# Metro) para probar un build "limpio".
set -euo pipefail

VARIANT="${1:-}"

case "$VARIANT" in
  dev)
    GRADLE_TASK="assembleDebug"
    APK="android/app/build/outputs/apk/debug/app-debug.apk"
    PACKAGE_ID=""
    ;;
  test)
    GRADLE_TASK="assembleRelease"
    APK="android/app/build/outputs/apk/release/app-release.apk"
    # `test` se instala como upgrade normal (`adb install -r`, sin
    # desinstalar antes): la primera vez que se baja en un dispositivo queda
    # vacía porque es una instalación nueva de verdad, pero si ya estaba
    # instalada con datos, una nueva build:test los conserva y solo
    # actualiza el código — mismo comportamiento que tendría un usuario real
    # actualizando la app. Firma siempre con la misma debug.keystore local
    # (ver signingConfigs en android/app/build.gradle), así que el upgrade
    # in-place funciona mientras no se alterne con builds de otro variant
    # (eso dispara un prebuild --clean que regenera esa keystore).
    PACKAGE_ID="com.mensualy.app.test"
    ;;
  prod)
    echo "El variant prod se construye con EAS, no en local:" >&2
    echo "  npm run eas:prod" >&2
    echo "Un assembleRelease local se firmaría con la debug keystore y Play Protect lo bloquearía." >&2
    exit 1
    ;;
  *)
    echo "Uso: $0 <dev|test>" >&2
    exit 1
    ;;
esac

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
export APP_VARIANT="$VARIANT"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LAST_VARIANT_FILE="android/.last-variant"
if [ -d android ] && [ "$(cat "$LAST_VARIANT_FILE" 2>/dev/null || true)" = "$VARIANT" ]; then
  echo "==> prebuild ($VARIANT, incremental — mismo variant que el último build)"
  npx expo prebuild --platform android
else
  echo "==> prebuild ($VARIANT, clean — cambió el variant o es el primer build)"
  npx expo prebuild --platform android --clean
fi
echo "$VARIANT" > "$LAST_VARIANT_FILE"

echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "==> gradle $GRADLE_TASK"
(cd android && ./gradlew "$GRADLE_TASK")

ADB="$ANDROID_HOME/platform-tools/adb"

# Workaround de sandbox: el daemon de adb puede morir entre invocaciones de
# shell separadas si no se levanta en primer plano dentro de la misma
# invocación — ver .claude/skills/run-on-device/SKILL.md. Inofensivo si el
# daemon ya está corriendo.
nohup "$ADB" nodaemon server -a >/tmp/adb-server.log 2>&1 &
sleep 2

if "$ADB" get-state >/dev/null 2>&1; then
  echo "==> adb install -r (upgrade in-place; conserva datos si ya estaba instalada)"
  if ! "$ADB" install -r "$APK"; then
    echo "" >&2
    echo "adb install -r falló — probablemente la firma cambió (ver nota sobre" >&2
    echo "debug.keystore arriba). No se desinstala automáticamente para no" >&2
    echo "borrar datos sin avisar: si aceptás perderlos, corré a mano:" >&2
    echo "  $ADB uninstall $PACKAGE_ID && $ADB install $APK" >&2
    exit 1
  fi
else
  echo "==> sin dispositivo conectado; APK listo en $APK"
fi
