import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import { useDragToDismiss } from "../../core/design-system/hooks/useDragToDismiss";
import { useTheme } from "../../core/design-system/hooks/useTheme";
import { FONT } from "../../features/dashboard/dashboardTheme";
import { useAppSettings } from "../../features/settings/hooks/useAppSettings";
import { exportAllDataAsJson } from "../../features/settings/exportData";
import * as subscriptionRepository from "../../features/subscriptions/repository/subscriptionRepository";
import { useSubscriptions } from "../../features/subscriptions/hooks/useSubscriptions";

const REMINDER_OPTIONS: { days: number | null; label: string }[] = [
  { days: null, label: "Sin aviso" },
  { days: 0, label: "El mismo día" },
  { days: 1, label: "1 día antes" },
  { days: 2, label: "2 días antes" },
  { days: 3, label: "3 días antes" },
  { days: 7, label: "1 semana antes" },
];

const CURRENCY_OPTIONS: { value: "COP" | "USD" | "EUR"; label: string }[] = [
  { value: "COP", label: "Peso colombiano (COP)" },
  { value: "USD", label: "Dólar estadounidense (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

function reminderLabel(days: number | null): string {
  return REMINDER_OPTIONS.find((o) => o.days === days)?.label ?? "Sin aviso";
}

function EditNameSheet({
  visible,
  onClose,
  nombreActual,
  onGuardar,
}: {
  visible: boolean;
  onClose: () => void;
  nombreActual: string;
  onGuardar: (nombre: string) => Promise<void>;
}) {
  const DASH = useTheme();
  const [nombre, setNombre] = useState(nombreActual);
  const { gesture, animatedStyle, close } = useDragToDismiss(onClose, visible);

  async function guardar() {
    if (!nombre.trim()) return;
    await onGuardar(nombre);
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {/* Ver nota larga en useDragToDismiss.ts: animationType="none" porque
          la entrada/salida las maneja el hook de punta a punta. Android
          también necesita su propio GestureHandlerRootView acá adentro, el
          de _layout.tsx no llega dentro del <Modal>. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        pointerEvents="box-none"
      >
      <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
        <Animated.View
          style={[
            { backgroundColor: DASH.card, borderTopWidth: 1, borderColor: DASH.cardBorder },
            animatedStyle,
          ]}
          className="rounded-t-[32px] pt-3 pb-8 px-5"
        >
          <GestureDetector gesture={gesture}>
            <View className="items-center mb-4" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
              <View className="w-10 h-1.5 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
            </View>
          </GestureDetector>

          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[19px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
                Editar nombre
              </Text>
              <Pressable
                onPress={close}
                hitSlop={12}
                className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
                style={{ backgroundColor: DASH.bg, borderWidth: 1, borderColor: DASH.cardBorder }}
              >
                <Ionicons name="close" size={15} color={DASH.textPrimary} />
              </Pressable>
            </View>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={DASH.textSecondary}
              autoFocus
              maxLength={40}
              onSubmitEditing={guardar}
              returnKeyType="done"
              className="rounded-2xl px-4 py-3.5 text-[16px]"
              style={{
                backgroundColor: DASH.bg,
                borderWidth: 1,
                borderColor: DASH.cardBorder,
                color: DASH.textPrimary,
                fontFamily: FONT.medium,
              }}
            />
            <Pressable
              onPress={guardar}
              className="rounded-full py-3 items-center mt-4 active:opacity-80"
              style={{ backgroundColor: DASH.violet }}
            >
              <Text className="text-[15px]" style={{ color: "#FFFFFF", fontFamily: FONT.bold }}>
                Guardar
              </Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </View>
      </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Sheet genérico de opciones de una sola selección — recordatorio y moneda comparten esta forma. */
function OptionsSheet<T extends string | number | null>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const DASH = useTheme();
  const { gesture, animatedStyle, close } = useDragToDismiss(onClose, visible);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {/* Ver nota larga en useDragToDismiss.ts: animationType="none" porque
          la entrada/salida las maneja el hook de punta a punta. Android
          también necesita su propio GestureHandlerRootView acá adentro, el
          de _layout.tsx no llega dentro del <Modal>. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
        <Animated.View
          style={[
            { backgroundColor: DASH.card, borderTopWidth: 1, borderColor: DASH.cardBorder },
            animatedStyle,
          ]}
          className="rounded-t-[32px] pt-3 pb-8 px-5"
        >
          <GestureDetector gesture={gesture}>
            <View className="items-center mb-4" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
              <View className="w-10 h-1.5 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
            </View>
          </GestureDetector>

          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[19px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
                {title}
              </Text>
              <Pressable
                onPress={close}
                hitSlop={12}
                className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
                style={{ backgroundColor: DASH.bg, borderWidth: 1, borderColor: DASH.cardBorder }}
              >
                <Ionicons name="close" size={15} color={DASH.textPrimary} />
              </Pressable>
            </View>
            <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: DASH.bg, borderWidth: 1, borderColor: DASH.cardBorder }}>
              {options.map((option, index) => {
                const active = option.value === selected;
                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onSelect(option.value);
                      close();
                    }}
                    className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
                    style={
                      index < options.length - 1
                        ? { borderBottomWidth: 1, borderColor: DASH.border }
                        : undefined
                    }
                  >
                    <Text className="text-[15px]" style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>
                      {option.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={DASH.violet} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default function SettingsScreen() {
  const DASH = useTheme();
  const insets = useSafeAreaInsets();
  const profilePhotoUri = useAppSettings((s) => s.profilePhotoUri);
  const setProfilePhoto = useAppSettings((s) => s.setProfilePhoto);
  const nombreUsuario = useAppSettings((s) => s.userName);
  const setUserName = useAppSettings((s) => s.setUserName);
  const mainCurrency = useAppSettings((s) => s.mainCurrency);
  const setMainCurrency = useAppSettings((s) => s.setMainCurrency);
  const themeMode = useAppSettings((s) => s.themeMode);
  const setThemeMode = useAppSettings((s) => s.setThemeMode);
  const biometricLockEnabled = useAppSettings((s) => s.biometricLockEnabled);
  const setBiometricLockEnabled = useAppSettings((s) => s.setBiometricLockEnabled);
  const iniciales = nombreUsuario.slice(0, 2).toUpperCase();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [reminderSheetVisible, setReminderSheetVisible] = useState(false);
  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);
  const [reminderDays, setReminderDays] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  useEffect(() => {
    subscriptionRepository.getGlobalReminderDaysBefore().then(setReminderDays);
  }, []);

  async function elegirFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Sin acceso a fotos",
        "Activa el permiso de fotos en los ajustes del sistema para cambiar tu foto de perfil."
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
    await setProfilePhoto(resultado.assets[0].uri);
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportAllDataAsJson();
    } catch {
      Alert.alert("No se pudo exportar", "Ocurrió un error generando el archivo. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  async function handleSelectReminder(days: number | null) {
    setReminderDays(days);
    await subscriptionRepository.setGlobalReminderDaysBefore(days);
    // El cambio del recordatorio global debe reprogramar ya mismo las
    // notificaciones de toda suscripción que no tenga uno propio — refresh()
    // dispara ese reagendado (ver useSubscriptions.ts).
    await useSubscriptions.getState().refresh();
  }

  async function handleToggleBiometricLock() {
    if (biometricBusy) return;
    setBiometricBusy(true);
    try {
      const activando = !biometricLockEnabled;
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "No disponible",
          "Configura una huella o Face ID en los ajustes de tu teléfono para usar el bloqueo biométrico."
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: activando
          ? "Confirma tu identidad para activar el bloqueo"
          : "Confirma tu identidad para desactivarlo",
        cancelLabel: "Cancelar",
      });
      if (result.success) await setBiometricLockEnabled(activando);
    } finally {
      setBiometricBusy(false);
    }
  }

  const sections: {
    title: string;
    items: {
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      value?: string;
      onPress?: () => void;
    }[];
  }[] = [
    {
      title: "Preferencias",
      items: [
        {
          icon: "cash-outline",
          label: "Moneda principal",
          value: mainCurrency,
          onPress: () => setCurrencySheetVisible(true),
        },
        {
          icon: "notifications-outline",
          label: "Recordatorios",
          value: reminderLabel(reminderDays),
          onPress: () => setReminderSheetVisible(true),
        },
        {
          icon: "moon-outline",
          label: "Apariencia",
          value: themeMode === "dark" ? "Oscuro" : "Claro",
          onPress: () => setAppearanceSheetVisible(true),
        },
      ],
    },
    {
      title: "Privacidad",
      items: [
        {
          icon: "finger-print-outline",
          label: "Bloqueo biométrico",
          value: biometricBusy ? "..." : biometricLockEnabled ? "Activado" : "Desactivado",
          onPress: handleToggleBiometricLock,
        },
        {
          icon: "download-outline",
          label: exporting ? "Exportando..." : "Exportar mis datos (.json)",
          onPress: handleExport,
        },
      ],
    },
    {
      title: "Acerca de",
      items: [{ icon: "information-circle-outline", label: "Mensualy", value: "v1.0.0" }],
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: DASH.bg }}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="settingsGlow" cx="50%" cy="-6%" r="55%">
            <Stop offset="0%" stopColor="rgb(124,107,255)" stopOpacity={0.22} />
            <Stop offset="55%" stopColor="rgb(124,107,255)" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="rgb(124,107,255)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#settingsGlow)" />
      </Svg>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      >
        <Text
          className="text-[28px] tracking-tight"
          style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
        >
          Ajustes
        </Text>

        {/* Perfil, igual que la referencia */}
        <View className="items-center mt-6 mb-7">
          <Pressable onPress={elegirFoto} className="active:opacity-80">
            <View
              className="w-28 h-28 rounded-full items-center justify-center overflow-hidden"
              style={{
                backgroundColor: "rgba(254,205,211,0.15)",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Text className="text-4xl" style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}>
                  {iniciales}
                </Text>
              )}
            </View>
            <View
              className="w-9 h-9 rounded-full items-center justify-center absolute bottom-0 right-0"
              style={{ backgroundColor: DASH.violet, borderWidth: 2, borderColor: DASH.bg }}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Pressable
            onPress={() => setEditNameVisible(true)}
            className="flex-row items-center gap-1.5 mt-3 active:opacity-70"
          >
            <Text className="text-[19px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              {nombreUsuario}
            </Text>
            <Ionicons name="pencil" size={13} color={DASH.textSecondary} />
          </Pressable>
        </View>

        {sections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text
              className="text-[11px] uppercase tracking-wider mb-2 ml-1"
              style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}
            >
              {section.title}
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  disabled={!item.onPress}
                  onPress={item.onPress}
                  className="flex-row items-center px-4 py-3.5 active:opacity-70"
                  style={
                    index < section.items.length - 1
                      ? { borderBottomWidth: 1, borderColor: DASH.border }
                      : undefined
                  }
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: DASH.iconBg }}
                  >
                    <Ionicons name={item.icon} size={16} color={DASH.textSecondary} />
                  </View>
                  <Text
                    className="text-[14px] flex-1"
                    style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}
                  >
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text
                      className="text-[13px] mr-1.5"
                      style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}
                    >
                      {item.value}
                    </Text>
                  )}
                  {item.onPress && (
                    <MaterialIcons name="chevron-right" size={16} color={DASH.textSecondary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <EditNameSheet
        visible={editNameVisible}
        onClose={() => setEditNameVisible(false)}
        nombreActual={nombreUsuario}
        onGuardar={setUserName}
      />

      <OptionsSheet
        visible={reminderSheetVisible}
        onClose={() => setReminderSheetVisible(false)}
        title="Recordatorios"
        options={REMINDER_OPTIONS.map((o) => ({ value: o.days, label: o.label }))}
        selected={reminderDays}
        onSelect={handleSelectReminder}
      />

      <OptionsSheet
        visible={currencySheetVisible}
        onClose={() => setCurrencySheetVisible(false)}
        title="Moneda principal"
        options={CURRENCY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        selected={mainCurrency}
        onSelect={setMainCurrency}
      />

      <OptionsSheet
        visible={appearanceSheetVisible}
        onClose={() => setAppearanceSheetVisible(false)}
        title="Apariencia"
        options={[
          { value: "dark" as const, label: "Oscuro" },
          { value: "light" as const, label: "Claro" },
        ]}
        selected={themeMode}
        onSelect={setThemeMode}
      />
    </View>
  );
}
