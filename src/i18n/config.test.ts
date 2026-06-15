import { describe, it, expect } from "vitest";
import { supportedLanguages } from "./config";

// All 24 official EU language codes + Simplified Chinese (zh-CN)
const EU_LANGUAGE_CODES = [
  "bg", "cs", "da", "de", "el", "en", "es", "et",
  "fi", "fr", "ga", "hr", "hu", "it", "lt", "lv",
  "mt", "nl", "pl", "pt", "ro", "sk", "sl", "sv",
  "zh-CN",
];

describe("i18n config integrity", () => {
  it("includes all 24 EU language codes plus Simplified Chinese", () => {
    const codes = supportedLanguages.map((l) => l.code);
    for (const eu of EU_LANGUAGE_CODES) {
      expect(codes, `missing language code: ${eu}`).toContain(eu);
    }
  });

  it("has no duplicate language codes", () => {
    const codes = supportedLanguages.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every language code is a valid BCP-47 code (2 lowercase letters, optionally followed by -XX region)", () => {
    for (const lang of supportedLanguages) {
      expect(lang.code, `"${lang.code}" is not a valid BCP-47 code`).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    }
  });

  it("has exactly 25 languages (24 EU + Simplified Chinese)", () => {
    expect(supportedLanguages.length).toBe(25);
  });
});
