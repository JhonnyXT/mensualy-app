import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, Easing } from "react-native-reanimated";

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;
const OFFSCREEN = Dimensions.get("window").height;

/**
 * Apertura/cierre 100% manejados por nosotros (Reanimated), con el
 * `<Modal animationType="none">` — NO por la transición nativa del Modal.
 *
 * Motivo (2026-09-21, sesión posterior a la nota de abajo sobre
 * `useSheetDragDismiss` de anchor-app): en este dispositivo, CUALQUIER
 * `<Modal transparent animationType="slide"|"fade">` mostraba un fogonazo
 * negro real en el contenido (no un artefacto de captura — se confirmó
 * grabando con `adb shell screenrecord --bit-rate 20000000`, mismo
 * resultado idéntico frame a frame) al cerrar, sin importar: quitar el
 * `Svg`/gradiente decorativo, quitar `GestureHandlerRootView`, agregar
 * `statusBarTranslucent`/`navigationBarTranslucent`, cambiar slide↔fade, o
 * `removeClippedSubviews={false}` en el `ScrollView` — ninguno cambió nada,
 * lo que apunta a la transición NATIVA del `Modal` de Android en sí (no a
 * nuestro árbol de React). La única forma de eliminarlo del todo es no
 * usar esa transición nativa: `animationType="none"` + esta animación
 * propia para AMBOS lados (entrada y salida), no solo para el gesto de
 * arrastre como antes.
 *
 * `resetKey` ahora se interpreta como "¿visible?" (booleano o truthy/falsy
 * como el `id` de un sheet) — al pasar a visible, la tarjeta entra desde
 * abajo (`withTiming` a 0); `close()` (devuelto por el hook, usarlo en
 * vez del callback crudo en la X/backdrop/gesto) la saca de pantalla y
 * RECIÉN AHÍ llama a `onDismiss` (el cierre real, que oculta el `<Modal>`)
 * — así el `Modal` nunca tiene nada que animar, ya está fuera de pantalla
 * cuando `visible` pasa a `false`.
 */
export function useDragToDismiss(onDismiss: () => void, resetKey?: unknown) {
  const isVisible = !!resetKey;
  const translateY = useSharedValue(isVisible ? 0 : OFFSCREEN);

  useEffect(() => {
    if (isVisible) {
      translateY.value = OFFSCREEN;
      translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function close() {
    translateY.value = withTiming(OFFSCREEN, { duration: 220, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  }

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { gesture, animatedStyle, close };
}
