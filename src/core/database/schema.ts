import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  serviceKey: text("service_key"),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  billingCycle: text("billing_cycle", {
    enum: ["weekly", "monthly", "yearly", "custom"],
  }).notNull(),
  customCycleDays: integer("custom_cycle_days"),
  nextBillingDate: integer("next_billing_date", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["active", "paused", "cancelled"] })
    .notNull()
    .default("active"),
  isShared: integer("is_shared", { mode: "boolean" }).notNull().default(false),
  sharedWithName: text("shared_with_name"),
  sharedSplitPercent: integer("shared_split_percent"),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const priceHistory = sqliteTable("price_history", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  changedAt: integer("changed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** Fila única (id fijo "singleton") con flags de estado global de la app. */
export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey(),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
  profilePhotoUri: text("profile_photo_uri"),
  userName: text("user_name"),
  mainCurrency: text("main_currency", { enum: ["COP", "USD", "EUR"] }).notNull().default("COP"),
  themeMode: text("theme_mode", { enum: ["dark", "light"] }).notNull().default("dark"),
  biometricLockEnabled: integer("biometric_lock_enabled", { mode: "boolean" }).notNull().default(false),
});

export const reminderSettings = sqliteTable("reminder_settings", {
  id: text("id").primaryKey(),
  // null = configuración global, aplica a todas las suscripciones que no tengan una propia
  subscriptionId: text("subscription_id").references(() => subscriptions.id, {
    onDelete: "cascade",
  }),
  daysBefore: integer("days_before").notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PriceHistoryEntry = typeof priceHistory.$inferSelect;
export type ReminderSetting = typeof reminderSettings.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
