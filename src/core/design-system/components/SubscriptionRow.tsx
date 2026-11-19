import { View, Text, Pressable } from "react-native";
import type { Subscription } from "../../database/schema";
import { formatCurrency } from "../../currency/exchangeRate";
import { ServiceBadge } from "./ServiceBadge";

function diasHasta(fecha: Date): number {
  const ms = fecha.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function SubscriptionRow({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress?: () => void;
}) {
  const dias = diasHasta(subscription.nextBillingDate);

  return (
    <Pressable onPress={onPress} className="flex-row items-center py-3">
      <View className="mr-3">
        <ServiceBadge subscription={subscription} size={44} />
      </View>

      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-[15px]">{subscription.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          {formatCurrency(subscription.amount, subscription.currency)} / mes
        </Text>
      </View>

      <Text className={`text-xs font-medium ${dias <= 3 ? "text-danger" : "text-text-secondary"}`}>
        {dias <= 0 ? "Hoy" : `En ${dias} días`}
      </Text>
    </Pressable>
  );
}
