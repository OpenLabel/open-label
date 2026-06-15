/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from "vitest";
import { toysTemplate } from "@/templates/toys";

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
import zhCNLocale from "./zh-CN.json";

type Bag = Record<string, unknown>;

const locales: Record<string, Bag> = {
  en: enLocale, bg: bgLocale, cs: csLocale, da: daLocale, de: deLocale,
  el: elLocale, es: esLocale, et: etLocale, fi: fiLocale, fr: frLocale,
  ga: gaLocale, hr: hrLocale, hu: huLocale, it: itLocale, lt: ltLocale,
  lv: lvLocale, mt: mtLocale, nl: nlLocale, pl: plLocale, pt: ptLocale,
  ro: roLocale, sk: skLocale, sl: slLocale, sv: svLocale,
  "zh-CN": zhCNLocale,
};

function resolve(obj: Bag, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Bag)) {
      return (acc as Bag)[part];
    }
    return undefined;
  }, obj);
}

/** Collect every i18n key the toys template depends on at runtime. */
function collectRequiredKeys(): string[] {
  const keys = new Set<string>();
  keys.add("toys.disclaimer.title");
  keys.add("toys.disclaimer.body");

  for (const section of toysTemplate.sections) {
    if (section.titleKey) keys.add(section.titleKey);
    if (section.descriptionKey) keys.add(section.descriptionKey);

    for (const q of section.questions) {
      if (q.labelKey) keys.add(q.labelKey);
      if (q.helpKey) keys.add(q.helpKey);
      if (q.placeholderKey) keys.add(q.placeholderKey);

      const options = (q as { options?: { labelKey?: string }[] }).options;
      if (Array.isArray(options)) {
        for (const opt of options) {
          if (opt.labelKey) keys.add(opt.labelKey);
        }
      }
    }
  }

  return [...keys].sort();
}

describe("Toys template i18n key coverage", () => {
  const required = collectRequiredKeys();

  it("collects a non-trivial number of required keys", () => {
    // Sanity: template has many fields/options; if this drops we've broken walking.
    expect(required.length).toBeGreaterThan(60);
  });

  it.each(Object.keys(locales))(
    "locale '%s' resolves every template key to a non-empty string",
    (code) => {
      const bag = locales[code];
      const missing: string[] = [];
      const empty: string[] = [];

      for (const key of required) {
        const val = resolve(bag, key);
        if (val === undefined || val === null) {
          missing.push(key);
        } else if (typeof val !== "string" || val.trim() === "") {
          empty.push(key);
        }
      }

      expect(
        missing,
        `🚨 Locale '${code}' is MISSING ${missing.length} template keys required by the Toys form:\n  - ${missing.slice(0, 30).join("\n  - ")}`,
      ).toHaveLength(0);

      expect(
        empty,
        `🚨 Locale '${code}' has ${empty.length} EMPTY template values:\n  - ${empty.slice(0, 30).join("\n  - ")}`,
      ).toHaveLength(0);
    },
  );
});
