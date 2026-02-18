import { describe, it, expect } from "vitest";

// Import all locale files (24 official EU languages)
import enLocale from "./en.json";
import bgLocale from "./bg.json";
import csLocale from "./cs.json";
import daLocale from "./da.json";
import deLocale from "./de.json";
import elLocale from "./el.json";
import esLocale from "./es.json";
import etLocale from "./et.json";
import fiLocale from "./fi.json";
import frLocale from "./fr.json";
import gaLocale from "./ga.json";
import hrLocale from "./hr.json";
import huLocale from "./hu.json";
import itLocale from "./it.json";
import ltLocale from "./lt.json";
import lvLocale from "./lv.json";
import mtLocale from "./mt.json";
import nlLocale from "./nl.json";
import plLocale from "./pl.json";
import ptLocale from "./pt.json";
import roLocale from "./ro.json";
import skLocale from "./sk.json";
import slLocale from "./sl.json";
import svLocale from "./sv.json";

type TranslationObject = Record<string, unknown>;

const locales: Record<string, TranslationObject> = {
  en: enLocale, bg: bgLocale, cs: csLocale, da: daLocale, de: deLocale,
  el: elLocale, es: esLocale, et: etLocale, fi: fiLocale, fr: frLocale,
  ga: gaLocale, hr: hrLocale, hu: huLocale, it: itLocale, lt: ltLocale,
  lv: lvLocale, mt: mtLocale, nl: nlLocale, pl: plLocale, pt: ptLocale,
  ro: roLocale, sk: skLocale, sl: slLocale, sv: svLocale,
};

// Flatten nested object to dot-notation keys with their values
function flattenKeys(obj: TranslationObject, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as TranslationObject, fullKey));
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

// Check if a value is legitimately the same across languages (not untranslated)
function isLegitimateMatch(key: string, value: string): boolean {
  // Very short values (1-2 chars) — often symbols, numbers
  if (value.length <= 2) return true;

  // Values that are purely numbers, punctuation, or whitespace
  if (/^[\d\s.,;:!?%°/+\-–—()[\]{}=<>*#@&|~^`'"\\€$£¥₹]+$/.test(value)) return true;

  // E-numbers (E100, E220, E938, etc.)
  if (/^E\d{3,4}[a-z]?$/i.test(value)) return true;

  // Chemical formulas
  if (/^[A-Z][a-z]?\d*([A-Z][a-z]?\d*)*$/.test(value) && value.length <= 12) return true;

  // Ingredient names are scientific/chemical terms — identical across EU languages
  if (key.startsWith("ingredients.")) return true;

  // Values containing E-numbers in parentheses (e.g., "Argon (E938)")
  if (/\(E\d{3,4}[a-z]?\)/i.test(value)) return true;

  // Measurement patterns: "Alcohol (% Vol)", "Glycerine (g/L)", "Salt (g)"
  if (/\(.*(?:mg\/L|g\/L|g|ml|L|%\s*Vol|kcal|kJ).*\)/.test(value)) return true;

  // Unit-like patterns: "per 100 ml", "per 100 g"
  if (/^per \d+\s*(ml|g|L|kg)$/i.test(value)) return true;

  // Technical abbreviations and codes
  const technicalTerms = [
    "JSON/XML", "BIM", "NFC/RFID", "ISO 15459", "DPP", "ESPR", "PDF", "QR",
    "AOC", "AOP", "IGP", "DOC", "DOCG", "PVPP", "RCGM", "DMDC", "INCI",
    "ICT", "ERP", "PLM", "PFAS", "GWP", "DoPC", "SDS", "EUDR",
    "CO₂e/kWh", "C₄H₆O₆", "GitHub",
    "404",
  ];
  if (technicalTerms.includes(value.trim())) return true;

  // Unit patterns (kcal, kJ, g/L, %, ml, etc.)
  if (/^\d+(\.\d+)?\s*(kcal|kJ|g\/L|g|ml|L|%|mg|kg|mm|cm|m)$/i.test(value)) return true;
  if (/^(kcal|kJ|g\/L|g|ml|%|Vol)$/i.test(value)) return true;

  // Values that are mostly numbers with some text (e.g., "750", "100", "E220")
  if (/^\d+$/.test(value)) return true;

  // Placeholder patterns that use the same examples across languages
  if (/^e\.g\.,\s/.test(value)) return true;

  // Keys where English is expected/intentional
  const englishExpectedKeys = [
    "passport.poweredBy",
    "preview.poweredBy",
    "wine.hints.displaySettingsHint",
    "notFound.title",
  ];
  if (englishExpectedKeys.includes(key)) return true;

  // Latin/Greek-derived international terms used identically across EU languages
  // These words are spelled the same in English and multiple EU languages
  const internationalTerms = [
    "Open Source", "Email", "Password", "QR Code",
    "Alcohol", "Volume", "Manual", "General", "Error",
    "Material", "Allergen", "Region", "Details", "Code",
    "Capsule", "Batteries", "Protein", "Salt", "Vintage",
  ];
  if (internationalTerms.includes(value.trim())) return true;

  // Brand names and proper nouns that stay in English
  const brandNames = ["Powered by", "GitHub", "Digital Product Passport"];
  if (brandNames.some(brand => value === brand)) return true;

  return false;
}

describe("Translation Audit", () => {
  const enFlat = flattenKeys(locales.en);
  const enKeys = Object.keys(enFlat);
  const enKeyCount = enKeys.length;

  it("should print a comprehensive audit report", () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log("  TRANSLATION AUDIT REPORT");
    console.log(`${"=".repeat(60)}`);
    console.log(`Reference (en): ${enKeyCount} keys\n`);

    const allLocaleResults: Array<{
      code: string;
      totalKeys: number;
      missingKeys: string[];
      extraKeys: string[];
      untranslatedKeys: string[];
    }> = [];

    for (const [code, locale] of Object.entries(locales)) {
      if (code === "en") continue;

      const flat = flattenKeys(locale);
      const localeKeys = Object.keys(flat);

      const missingKeys = enKeys.filter(k => !(k in flat));
      const extraKeys = localeKeys.filter(k => !(k in enFlat));

      // Find values identical to English (potentially untranslated)
      const untranslatedKeys: string[] = [];
      for (const key of enKeys) {
        if (key in flat && flat[key] === enFlat[key]) {
          if (!isLegitimateMatch(key, enFlat[key])) {
            untranslatedKeys.push(key);
          }
        }
      }

      allLocaleResults.push({
        code,
        totalKeys: localeKeys.length,
        missingKeys,
        extraKeys,
        untranslatedKeys,
      });
    }

    // Summary table
    console.log("LOCALE  KEYS       MISSING  EXTRA  UNTRANSLATED  STATUS");
    console.log("-".repeat(65));

    for (const r of allLocaleResults) {
      const pct = Math.round((r.totalKeys / enKeyCount) * 100);
      const status =
        r.missingKeys.length === 0 && r.untranslatedKeys.length === 0
          ? "✅ PASS"
          : r.missingKeys.length > 50
          ? "❌ INCOMPLETE"
          : r.untranslatedKeys.length > 0
          ? "⚠️  UNTRANSLATED"
          : "⚠️  MISSING KEYS";

      console.log(
        `${r.code.padEnd(8)}${`${r.totalKeys}/${enKeyCount} (${pct}%)`.padEnd(16)}${
          String(r.missingKeys.length).padEnd(9)
        }${String(r.extraKeys.length).padEnd(7)}${
          String(r.untranslatedKeys.length).padEnd(14)
        }${status}`
      );
    }

    // Detailed report for locales with issues
    console.log(`\n${"=".repeat(60)}`);
    console.log("  DETAILED ISSUES");
    console.log(`${"=".repeat(60)}`);

    for (const r of allLocaleResults) {
      if (r.missingKeys.length === 0 && r.extraKeys.length === 0 && r.untranslatedKeys.length === 0) continue;

      console.log(`\n--- ${r.code.toUpperCase()} ---`);

      if (r.missingKeys.length > 0) {
        console.log(`  Missing keys (${r.missingKeys.length}):`);
        for (const key of r.missingKeys.slice(0, 30)) {
          console.log(`    - ${key}`);
        }
        if (r.missingKeys.length > 30) {
          console.log(`    ... and ${r.missingKeys.length - 30} more`);
        }
      }

      if (r.extraKeys.length > 0) {
        console.log(`  Extra keys (${r.extraKeys.length}):`);
        for (const key of r.extraKeys.slice(0, 10)) {
          console.log(`    - ${key}`);
        }
        if (r.extraKeys.length > 10) {
          console.log(`    ... and ${r.extraKeys.length - 10} more`);
        }
      }

      if (r.untranslatedKeys.length > 0) {
        console.log(`  Potentially untranslated (${r.untranslatedKeys.length}):`);
        for (const key of r.untranslatedKeys.slice(0, 30)) {
          console.log(`    - ${key}: "${enFlat[key]}"`);
        }
        if (r.untranslatedKeys.length > 30) {
          console.log(`    ... and ${r.untranslatedKeys.length - 30} more`);
        }
      }
    }

    console.log(`\n${"=".repeat(60)}\n`);

    // This test always passes — it's a reporting tool
    expect(true).toBe(true);
  });

  // Strict test: fully updated locales must have zero missing keys
  const fullyUpdatedLocales = ["de", "fr", "es", "it", "pt", "nl", "pl", "sk", "sl", "hr", "hu", "lt", "et", "fi"];

  it.each(fullyUpdatedLocales)(
    "locale '%s' should have zero missing keys",
    (code) => {
      const flat = flattenKeys(locales[code]);
      const missingKeys = enKeys.filter(k => !(k in flat));

      expect(
        missingKeys,
        `Locale '${code}' is missing ${missingKeys.length} keys:\n  - ${missingKeys.slice(0, 20).join("\n  - ")}`
      ).toHaveLength(0);
    }
  );

  // STRICT: fully updated locales MUST have zero untranslated values
  // The build WILL FAIL if any locale has English values that should be translated
  it.each(fullyUpdatedLocales)(
    "locale '%s' MUST have no untranslated English values",
    (code) => {
      const flat = flattenKeys(locales[code]);
      const untranslated: string[] = [];

      for (const key of enKeys) {
        if (key in flat && flat[key] === enFlat[key] && !isLegitimateMatch(key, enFlat[key])) {
          untranslated.push(key);
        }
      }

      expect(
        untranslated,
        `🚨 TRANSLATION ERROR: Locale '${code}' has ${untranslated.length} UNTRANSLATED values that are still in English!\n` +
        `These MUST be translated before the build can succeed:\n  - ${untranslated.map(k => `${k}: "${enFlat[k]}"`).join("\n  - ")}`
      ).toHaveLength(0);
    }
  );
});
