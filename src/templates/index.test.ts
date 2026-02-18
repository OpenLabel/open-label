import { describe, it, expect } from "vitest";
import { templates, getTemplate, categoryList } from "./index";
import type { ProductCategory } from "@/types/passport";

describe("templates", () => {
  describe("templates object", () => {
    it("has template for each category", () => {
      const expectedCategories: ProductCategory[] = [
        "wine",
        "battery",
        "textiles",
        "construction",
        "electronics",
        "iron_steel",
        "aluminum",
        "toys",
        "cosmetics",
        "furniture",
        "tires",
        "detergents",
        "other",
      ];

      expectedCategories.forEach((category) => {
        expect(templates[category]).toBeDefined();
      });
    });

    it("each template has required structure", () => {
      Object.values(templates).forEach((template) => {
        expect(template).toHaveProperty("sections");
        expect(Array.isArray(template.sections)).toBe(true);
      });
    });
  });

  describe("getTemplate", () => {
    it("returns wine template for wine category", () => {
      const template = getTemplate("wine");
      expect(template).toBe(templates.wine);
    });

    it("returns battery template for battery category", () => {
      const template = getTemplate("battery");
      expect(template).toBe(templates.battery);
    });

    it("returns electronics template for electronics category", () => {
      const template = getTemplate("electronics");
      expect(template).toBe(templates.electronics);
    });

    it("returns textiles template for textiles category", () => {
      const template = getTemplate("textiles");
      expect(template).toBe(templates.textiles);
    });

    it("returns other template as fallback for unknown category", () => {
      // @ts-expect-error testing invalid category
      const template = getTemplate("unknown_category");
      expect(template).toBe(templates.other);
    });

    it("returns correct template for all valid categories", () => {
      const categories: ProductCategory[] = [
        "wine",
        "battery",
        "textiles",
        "construction",
        "electronics",
        "iron_steel",
        "aluminum",
        "toys",
        "cosmetics",
        "furniture",
        "tires",
        "detergents",
        "other",
      ];

      categories.forEach((category) => {
        const template = getTemplate(category);
        expect(template).toBe(templates[category]);
      });
    });
  });

  describe("categoryList", () => {
    it("has visible product categories (wine and other)", () => {
      expect(categoryList.length).toBe(2);
    });

    it("each category has required properties", () => {
      categoryList.forEach((category) => {
        expect(category).toHaveProperty("value");
        expect(category).toHaveProperty("label");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("status");
        expect(category).toHaveProperty("regulation");
      });
    });

    it("has valid status values", () => {
      const validStatuses = ["active", "priority"];
      
      categoryList.forEach((category) => {
        expect(validStatuses).toContain(category.status);
      });
    });

    it("includes wine with correct regulation", () => {
      const wine = categoryList.find((c) => c.value === "wine");
      expect(wine).toBeDefined();
      expect(wine?.regulation).toBe("EU 2021/2117");
    });

    it("includes other with correct regulation", () => {
      const other = categoryList.find((c) => c.value === "other");
      expect(other).toBeDefined();
      expect(other?.regulation).toBe("Generic DPP");
    });

    it("values match ProductCategory type", () => {
      const validCategories: ProductCategory[] = [
        "wine",
        "other",
      ];

      categoryList.forEach((category) => {
        expect(validCategories).toContain(category.value);
      });
    });
  });
});
