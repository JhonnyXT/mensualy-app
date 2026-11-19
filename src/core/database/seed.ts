import { randomUUID } from "expo-crypto";
import { db } from "./client";
import { categories } from "./schema";
import { DEFAULT_CATEGORIES } from "../constants/categories.default";

/**
 * Crea las categorías por defecto la primera vez que se abre la app.
 * Es idempotente: si ya hay categorías, no hace nada.
 */
export async function seedDefaultCategories() {
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      id: randomUUID(),
      ...category,
      isDefault: true,
    }))
  );
}
