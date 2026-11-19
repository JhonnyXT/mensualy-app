import { useEffect, useState } from "react";
import type { Category } from "../../../core/database/schema";
import { listCategories } from "../repository/categoryRepository";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  return categories;
}
