import { describe, it, expect } from "vitest";
import { templates } from "./index";

const validTypes = ["text", "textarea", "select", "checkbox", "number"];

describe("template structural integrity", () => {
  for (const [category, template] of Object.entries(templates)) {
    describe(`${category} template`, () => {
      it("every question has non-empty id, label, and valid type", () => {
        for (const section of template.sections) {
          for (const q of section.questions) {
            expect(q.id.trim().length, `empty id in section "${section.title}"`).toBeGreaterThan(0);
            expect(q.label.trim().length, `empty label for "${q.id}"`).toBeGreaterThan(0);
            expect(validTypes, `invalid type "${q.type}" for "${q.id}"`).toContain(q.type);
          }
        }
      });

      it("select-type questions always have a non-empty options array", () => {
        for (const section of template.sections) {
          for (const q of section.questions) {
            if (q.type === "select") {
              expect(
                Array.isArray(q.options) && q.options.length > 0,
                `select question "${q.id}" has no options`,
              ).toBe(true);
            }
          }
        }
      });

      it("no duplicate question IDs within template", () => {
        const ids = template.sections.flatMap((s) => s.questions.map((q) => q.id));
        const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
        expect(dupes, "duplicate question IDs found").toEqual([]);
      });
    });
  }
});
