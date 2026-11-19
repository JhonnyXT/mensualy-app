import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme";
import { BrandMark } from "./BrandMark";

const HOLD_END = 1150;
const FADE_OUT_DURATION = 200;
const EXPAND_DURATION = 620;
const GLOW_SIZE = 220;
const EXPAND_SCALE_TARGET = 6; // 220 * 6 = 1320px, cubre la diagonal de cualquier teléfono
// Debe coincidir con `imageWidth` del splash nativo en app.config.ts —
// mismo tamaño en el hand-off nativo → JS, para que el logo no "salte".
const ICON_SIZE = 100;

/**
 * Splash en modo oscuro, siempre (independiente del resto de la app, que es
 * clara — ver theme.ts): mismo patrón que `AnimatedSplash` de anchor-app
 * (Meld) — fondo `#121212`, glow con `RadialGradient` real (no un disco
 * plano) del mismo color de marca, y el MISMO nodo del glow expandiéndose al
 * final hasta cubrir la pantalla, en vez de un simple fundido. El ícono
 * arranca ya visible (sin fundido 0→1) para no solaparse con el splash
 * nativo estático (mismo fondo oscuro — ver `app.config.ts` →
 * expo-splash-screen).
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoOpacity = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.9);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);

  useEffect(() => {
    logoOpacity.value = withDelay(
      HOLD_END,
      withTiming(0, { duration: FADE_OUT_DURATION, easing: Easing.in(Easing.quad) }),
    );
    logoScale.value = withDelay(
      80,
      withSequence(
        withTiming(1.08, { duration: 340, easing: Easing.out(Easing.back(1.4)) }),
        withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
      ),
    );

    glowOpacity.value = withDelay(180, withTiming(0.9, { duration: 420, easing: Easing.out(Easing.quad) }));
    glowScale.value = withSequence(
      withDelay(180, withTiming(1.15, { duration: 700, easing: Easing.out(Easing.quad) })),
      withDelay(
        HOLD_END - 880,
        withTiming(EXPAND_SCALE_TARGET, { duration: EXPAND_DURATION, easing: Easing.in(Easing.cubic) }, (finished) => {
          if (finished) runOnJS(onFinish)();
        }),
      ),
    );

    wordmarkOpacity.value = withDelay(
      420,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
        withDelay(HOLD_END - 720, withTiming(0, { duration: FADE_OUT_DURATION, easing: Easing.in(Easing.quad) })),
      ),
    );
    wordmarkY.value = withDelay(420, withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }));

    taglineOpacity.value = withDelay(
      560,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
        withDelay(HOLD_END - 860, withTiming(0, { duration: FADE_OUT_DURATION, easing: Easing.in(Easing.quad) })),
      ),
    );
    taglineY.value = withDelay(560, withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Anclado al centro real de la pantalla, independiente del bloque de
          texto de abajo — nunca se mueve al aparecer/desaparecer el texto. */}
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.glowWrap, glowStyle]}>
          <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
            <Defs>
              <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.accent.default} stopOpacity={0.55} />
                <Stop offset="45%" stopColor={colors.accent.default} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={colors.accent.default} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#splashGlow)" />
          </Svg>
        </Animated.View>
        <Animated.View style={logoStyle}>
          <BrandMark size={ICON_SIZE} />
        </Animated.View>
      </View>
      <View style={styles.textBlock}>
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>Mensualy</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Controla tus suscripciones</Animated.Text>
      </View>
    </View>
  );
}

const DARK_BG = "#121212";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  iconWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -ICON_SIZE / 2,
    marginTop: -ICON_SIZE / 2,
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glowWrap: {
    position: "absolute",
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    left: (ICON_SIZE - GLOW_SIZE) / 2,
    top: (ICON_SIZE - GLOW_SIZE) / 2,
  },
  textBlock: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    marginTop: ICON_SIZE / 2 + 24,
    alignItems: "center",
  },
  wordmark: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.9,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.1,
    color: "#9A9AA0",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
});
