import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { db } from "../../core/database/client";
import { subscriptions, categories, priceHistory, reminderSettings } from "../../core/database/schema";

/**
 * Exporta todo lo que el usuario acumuló en SQLite a un .json y abre el
 * share sheet nativo — es la única forma de "sacar" datos de una app
 * local-first sin cuenta ni backend (ver diferenciador del proyecto).
 */
export async function exportAllDataAsJson(): Promise<void> {
  const [allSubscriptions, allCategories, allPriceHistory, allReminderSettings] = await Promise.all([
    db.select().from(subscriptions),
    db.select().from(categories),
    db.select().from(priceHistory),
    db.select().from(reminderSettings),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    subscriptions: allSubscriptions,
    categories: allCategories,
    priceHistory: allPriceHistory,
    reminderSettings: allReminderSettings,
  };

  const file = new File(Paths.cache, `mensualy-datos-${Date.now()}.json`);
  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Exportar datos de Mensualy",
    });
  }
}
