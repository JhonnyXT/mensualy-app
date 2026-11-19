import { db } from "../../../core/database/client";
import { categories } from "../../../core/database/schema";

export async function listCategories() {
  return db.select().from(categories);
}
