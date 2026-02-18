import { describe, it, expect } from "vitest";
import {
  packagingMaterialTypes,
  materialCompositions,
  disposalMethods,
  materialCategories,
} from "./wineRecycling";

describe("wineRecycling data integrity", () => {
  it("no duplicate IDs in packagingMaterialTypes", () => {
    const ids = packagingMaterialTypes.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no duplicate IDs in materialCompositions", () => {
    const ids = materialCompositions.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no duplicate IDs in disposalMethods", () => {
    const ids = disposalMethods.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every materialComposition.categoryId references a known category", () => {
    const knownCategoryIds = new Set(materialCategories.map((c) => c.id));
    for (const comp of materialCompositions) {
      expect(
        knownCategoryIds.has(comp.categoryId),
        `composition "${comp.id}" references unknown category "${comp.categoryId}"`,
      ).toBe(true);
    }
  });

  it("all entries have non-empty id and name", () => {
    for (const item of [
      ...packagingMaterialTypes,
      ...materialCompositions,
      ...disposalMethods,
    ]) {
      expect(item.id.trim().length).toBeGreaterThan(0);
      expect(item.name.trim().length).toBeGreaterThan(0);
    }
  });
});
