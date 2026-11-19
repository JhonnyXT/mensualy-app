import { View, Text, Image } from "react-native";
import type { Subscription } from "../../database/schema";
import { SERVICES_CATALOG } from "../../constants/services.catalog";
import { SERVICE_LOGOS } from "../../constants/serviceLogos";

/** Badge cuadrado redondeado: logo real del servicio si existe, si no iniciales. */
export function ServiceBadge({
  subscription,
  size = 44,
}: {
  subscription: Pick<Subscription, "serviceKey" | "name">;
  size?: number;
}) {
  const catalogEntry = SERVICES_CATALOG.find((s) => s.key === subscription.serviceKey);
  const logo = subscription.serviceKey ? SERVICE_LOGOS[subscription.serviceKey] : undefined;
  const initials = catalogEntry?.monogram ?? subscription.name.slice(0, 2).toUpperCase();
  const color = catalogEntry?.color ?? "#6B6B70";

  if (logo) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={logo}
          style={{ width: size * 0.66, height: size * 0.66 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: `${color}1A`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color, fontWeight: "700", fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}
