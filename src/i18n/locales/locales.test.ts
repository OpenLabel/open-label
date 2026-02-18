import { describe, it as test, expect } from "vitest";

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

// Recursively count all keys in a nested object
function countKeys(obj: TranslationObject, prefix = ""): number {
  let count = 0;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      count += countKeys(value as TranslationObject, `${prefix}${key}.`);
    } else {
      count += 1;
    }
  }
  return count;
}

// Get all leaf keys from a nested object
function getLeafKeys(obj: TranslationObject, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value as TranslationObject, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("Translation files consistency", () => {
  const referenceLocale = "en";
  const referenceKeys = getLeafKeys(locales[referenceLocale]);
  const referenceKeyCount = referenceKeys.length;

  // Locales that have been fully updated to match English
  const fullyUpdatedLocales = ["bg", "cs", "da", "de", "el", "es", "et", "fi", "fr", "ga", "hr", "hu", "it", "lt", "lv", "mt", "nl", "pl", "pt", "ro", "sk", "sl", "sv"];

  it("should have English as the reference with all keys", () => {
    expect(referenceKeyCount).toBeGreaterThan(0);
    console.log(`Reference (en) has ${referenceKeyCount} translation keys`);
  });

  it.each(fullyUpdatedLocales)(
    "locale '%s' should have the same number of keys as English (%d keys)",
    (localeCode) => {
      const localeKeys = getLeafKeys(locales[localeCode]);
      const localeKeyCount = localeKeys.length;

      // Find missing keys
      const missingKeys = referenceKeys.filter(key => !localeKeys.includes(key));
      
      // Find extra keys
      const extraKeys = localeKeys.filter(key => !referenceKeys.includes(key));

      if (missingKeys.length > 0 || extraKeys.length > 0) {
        let errorMessage = `Locale '${localeCode}' has ${localeKeyCount} keys, expected ${referenceKeyCount}.\n`;
        
        if (missingKeys.length > 0) {
          errorMessage += `\nMissing keys (${missingKeys.length}):\n  - ${missingKeys.slice(0, 20).join("\n  - ")}`;
          if (missingKeys.length > 20) {
            errorMessage += `\n  ... and ${missingKeys.length - 20} more`;
          }
        }
        
        if (extraKeys.length > 0) {
          errorMessage += `\nExtra keys (${extraKeys.length}):\n  - ${extraKeys.slice(0, 10).join("\n  - ")}`;
          if (extraKeys.length > 10) {
            errorMessage += `\n  ... and ${extraKeys.length - 10} more`;
          }
        }

        expect(localeKeyCount, errorMessage).toBe(referenceKeyCount);
      }

      expect(localeKeyCount).toBe(referenceKeyCount);
    }
  );

  it("should have all top-level sections in fully updated locales", () => {
    const referenceSections = Object.keys(locales[referenceLocale]);
    
    for (const code of fullyUpdatedLocales) {
      const locale = locales[code];
      const localeSections = Object.keys(locale);
      const missingSections = referenceSections.filter(s => !localeSections.includes(s));
      
      expect(
        missingSections,
        `Locale '${code}' is missing sections: ${missingSections.join(", ")}`
      ).toHaveLength(0);
    }
  });
});
