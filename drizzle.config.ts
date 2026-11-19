import type { Config } from "drizzle-kit";

export default {
  schema: "./src/core/database/schema.ts",
  out: "./src/core/database/migrations",
  dialect: "sqlite",
  driver: "expo",
} satisfies Config;
