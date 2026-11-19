import { View } from "react-native";
import { Tabs } from "expo-router";
import { FloatingDock } from "../../core/design-system/components/FloatingDock";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // La tab bar del sistema queda oculta — la navegación real es el
          // `FloatingDock` de abajo (pedido exacto del usuario a partir de
          // un mockup HTML). Ajustes sigue siendo ruta válida del navigator,
          // solo no tiene botón propio en el dock (se llega desde el avatar
          // del header). El calendario vive en `CalendarSheet` (modal), no
          // como tab — la vieja pantalla `/calendar` se borró por huérfana.
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="subscriptions" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <FloatingDock />
    </View>
  );
}
