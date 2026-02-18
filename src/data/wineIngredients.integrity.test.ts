import { describe, it, expect } from "vitest";
import { wineIngredientCategories, getAllIngredients } from "./wineIngredients";

describe("wineIngredients data integrity", () => {
  it("has no duplicate ingredient IDs across all categories", () => {
    const allIds = getAllIngredients().map((i) => i.id);
    const dupes = allIds.filter((id, idx) => allIds.indexOf(id) !== idx);
    expect(dupes).toEqual([]);
  });

  it("every ingredient has non-empty id and name", () => {
    for (const ing of getAllIngredients()) {
      expect(ing.id.trim().length).toBeGreaterThan(0);
      expect(ing.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("all category IDs are non-empty and unique", () => {
    const ids = wineIngredientCategories.map((c) => c.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id.trim().length).toBeGreaterThan(0);
    }
  });
});
