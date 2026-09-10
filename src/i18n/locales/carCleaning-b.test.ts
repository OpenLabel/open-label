import { describe, expect, it } from "vitest";
import en from "./en.json";
import itLocale from "./it.json";
import lt from "./lt.json";
import lv from "./lv.json";
import mt from "./mt.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ro from "./ro.json";
import sk from "./sk.json";
import sl from "./sl.json";
import sv from "./sv.json";
import zh from "./zh-CN.json";

type Locale = Record<string, unknown>;
const locales: Record<string, Locale> = { it: itLocale, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, "zh-CN": zh };

function leaves(value: unknown, prefix = ""): Record<string, unknown> {
  if (!value || typeof value !== "object") return prefix ? { [prefix]: value } : {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
    Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key))));
}

describe("car cleaning translations, locale group B", () => {
  const english = leaves((en as Locale).carCleaning);
  for (const [locale, messages] of Object.entries(locales)) {
    it(`${locale} supplies the complete product workflow without English prose fallback`, () => {
      expect(Object.keys(english).length).toBeGreaterThan(100);
      const translated = leaves(messages.carCleaning);
      expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
      for (const [key, value] of Object.entries(translated)) {
        expect(typeof value, key).toBe("string");
        expect((value as string).trim().length, key).toBeGreaterThan(0);
        expect(value, key).not.toMatch(/[\u2013\u2014]/);
      }
      for (const key of ["noticeBody", "publicDataNotice", "scopeHelp", "limits", "operatorHelp", "ingredientsHelp", "pcnHelp", "sdsHelp", "translationHelp", "validationBody"]) {
        expect(translated[key], key).not.toBe(english[key]);
      }
      expect(translated.operatorHelp).toMatch(/9/);
      expect(translated.noticeBody).toContain("2029");
      for (const parent of ["categories", "categoryDescriptions"]) {
        const value = (messages[parent] as Record<string, unknown>).car_cleaning;
        expect(typeof value).toBe("string");
        expect((value as string).length).toBeGreaterThan(0);
        expect(value).not.toBe(((en as Locale)[parent] as Record<string, unknown>).car_cleaning);
        expect(value).not.toMatch(/[\u2013\u2014]/);
      }
    });
  }
});
