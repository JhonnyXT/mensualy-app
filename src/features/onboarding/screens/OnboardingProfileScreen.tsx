import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { ONB } from "../onboardingTheme";
import { FONT } from "../../dashboard/dashboardTheme";
import { useAppSettings, DEFAULT_USER_NAME } from "../../settings/hooks/useAppSettings";

/**
 * Paso 4 de 5 — pide nombre y foto al final, justo antes del resumen
 * (pedido explícito del usuario: primero eligió "A" pedirlo primero, luego
 * cambió a pedirlo al final, después de elegir suscripciones). "Ahora no"
 * avanza igual que "Continuar" — es un paso opcional, no hay nada que perder
 * al saltarlo.
 */
export function OnboardingProfileScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const storedName = useAppSettings((s) => s.userName);
  const setUserName = useAppSettings((s) => s.setUserName);
  const setProfilePhoto = useAppSettings((s) => s.setProfilePhoto);

  const [nombre, setNombre] = useState(storedName === DEFAULT_USER_NAME ? "" : storedName);
  // Estado local, nunca leído del store: el onboarding es una pantalla
  // "en blanco" — no debe mostrar una foto que haya quedado de una sesión
  // anterior (ej. de pruebas). Solo se persiste al tocar "Continuar".
  const [fotoLocal, setFotoLocal] = useState<string | null>(null);

  async function elegirFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Sin acceso a fotos",
        "Activa el permiso de fotos en los ajustes del sistema para elegir tu foto de perfil."
      );
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (resultado.canceled) return;
    setFotoLocal(resultado.assets[0].uri);
  }

  async function continuar() {
    if (nombre.trim()) await setUserName(nombre);
    if (fotoLocal) await setProfilePhoto(fotoLocal);
    onContinue();
  }

  return (
    <View
      className="flex-1 px-5"
      style={{ backgroundColor: ONB.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <OnboardingHeader step={4} total={5} onBack={onBack} />

      <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
        <Pressable onPress={elegirFoto} className="active:opacity-80">
          <View
            className="w-28 h-28 rounded-full items-center justify-center overflow-hidden"
            style={{
              borderWidth: 2,
              borderStyle: fotoLocal ? "solid" : "dashed",
              borderColor: fotoLocal ? ONB.border : "rgba(255,255,255,0.25)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            {fotoLocal ? (
              <Image source={{ uri: fotoLocal }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Ionicons name="person-outline" size={44} color={ONB.textSecondary} />
            )}
          </View>
          <View
            className="w-9 h-9 rounded-full items-center justify-center absolute bottom-0 right-0"
            style={{ backgroundColor: ONB.accent, borderWidth: 3, borderColor: ONB.bg }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </View>
        </Pressable>

        <Text
          className="text-[24px] text-center mt-7"
          style={{ color: ONB.textPrimary, fontFamily: FONT.extrabold, letterSpacing: -0.3 }}
        >
          ¿Cómo te llamamos?
        </Text>
        <Text
          className="text-[14px] text-center mt-2 max-w-[280px]"
          style={{ color: ONB.textSecondary, fontFamily: FONT.regular, lineHeight: 20 }}
        >
          Así vas a ver tu nombre cada vez que abras Mensualy.
        </Text>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor={ONB.textSecondary}
          autoCapitalize="words"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={continuar}
          textAlign="center"
          className="w-full mt-8 rounded-2xl px-4 py-3.5 text-[16px]"
          style={{
            backgroundColor: ONB.surface,
            borderWidth: 1,
            borderColor: ONB.border,
            color: ONB.textPrimary,
            fontFamily: FONT.medium,
          }}
        />

        <View
          className="w-full mt-3 rounded-2xl px-4 py-3.5 flex-row items-center gap-2"
          style={{ backgroundColor: ONB.accentSoft, borderWidth: 1, borderColor: ONB.accentSoftBorder }}
        >
          <MaterialIcons name="info-outline" size={15} color={ONB.accent} />
          <Text className="flex-1 text-[12px]" style={{ color: ONB.accent, fontFamily: FONT.medium }}>
            Podrás cambiar tu nombre y foto luego, desde Ajustes.
          </Text>
        </View>

        {/* El CTA vive DENTRO del mismo bloque centrado (no fijo al fondo de
            la pantalla) — con poco contenido, anclarlo al fondo dejaba un
            hueco enorme en pantallas altas; así queda pegado al resto. */}
        <Pressable onPress={continuar} className="w-full active:opacity-90 mt-8">
          <LinearGradient
            colors={[ONB.accent, ONB.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 999,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white text-[16px]" style={{ fontFamily: FONT.bold }}>
              Continuar
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onContinue}
          hitSlop={10}
          style={{ height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Text className="text-[15px]" style={{ color: ONB.textSecondary, fontFamily: FONT.semibold }}>
            Ahora no
          </Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}
