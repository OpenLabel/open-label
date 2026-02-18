import { describe, it, expect } from "vitest";
import { supportedLanguages } from "./config";

// All 24 official EU language codes
const EU_LANGUAGE_CODES = [
  "bg", "cs", "da", "de", "el", "en", "es", "et",
  "fi", "fr", "ga", "hr", "hu", "it", "lt", "lv",
  "mt", "nl", "pl", "pt", "ro", "sk", "sl", "sv",
];

describe("i18n config integrity", () => {
  it("includes all 24 official EU language codes", () => {
    const codes = supportedLanguages.map((l) => l.code);
    for (const eu of EU_LANGUAGE_CODES) {
      expect(codes, `missing EU language code: ${eu}`).toContain(eu);
    }
  });

  it("has no duplicate language codes", () => {
    const codes = supportedLanguages.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every language code is exactly 2 characters (ISO 639-1)", () => {
    for (const lang of supportedLanguages) {
      expect(lang.code.length, `"${lang.code}" is not 2 chars`).toBe(2);
      expect(lang.code).toMatch(/^[a-z]{2}$/);
    }
  });

  it("has exactly 24 languages", () => {
    expect(supportedLanguages.length).toBe(24);
  });
});
