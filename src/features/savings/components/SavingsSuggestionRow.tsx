import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import type { Subscription } from "../../../core/database/schema";

/** Fila de sugerencia de ahorro, igual al patrón de la referencia: ícono + texto + chevron. */
export function SavingsSuggestionRow({
  subscription,
  message,
  onPress,
}: {
  subscription: Subscription;
  message: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-3">
      <ServiceBadge subscription={subscription} size={36} />
      <Text className="text-text-primary text-sm ml-3 flex-1 leading-5">{message}</Text>
      <Ionicons name="chevron-forward" size={16} color="#9A9AA0" />
    </Pressable>
  );
}
