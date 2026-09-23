/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from "vitest";
import type { CategoryTemplate } from "@/templates/base";
import { toysTemplate } from "@/templates/toys";
import { textilesTemplate } from "@/templates/textiles";

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

/** Collect every i18n key a template depends on at runtime. */
function collectTemplateKeys(template: CategoryTemplate): string[] {
  const keys = new Set<string>();

  for (const section of template.sections) {
    if (section.titleKey) keys.add(section.titleKey);
    if (section.descriptionKey) keys.add(section.descriptionKey);

    for (const q of section.questions) {
      if (q.labelKey) keys.add(q.labelKey);
      if (q.helpKey) keys.add(q.helpKey);
      if (q.placeholderKey) keys.add(q.placeholderKey);
      if (q.warnWhen?.messageKey) keys.add(q.warnWhen.messageKey);

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          if (opt.labelKey) keys.add(opt.labelKey);
        }
      }
    }
  }

  return [...keys].sort();
}

const toysKeys = [
  "toys.disclaimer.title",
  "toys.disclaimer.body",
  ...collectTemplateKeys(toysTemplate),
].sort();

const textilesKeys = [
  // Bespoke Apparel public renderer strings (GarmentPublicPassport).
  "garmentPublic.headerBadge",
  "garmentPublic.madeInEu",
  "garmentPublic.sections.substances",
  "garmentPublic.sections.care",
  "garmentPublic.sections.metadata",
  "garmentPublic.subsections.manufacturer",
  "garmentPublic.subsections.importer",
  "garmentPublic.subsections.euResponsiblePerson",
  "garmentPublic.rows.address",
  "garmentPublic.rows.dppServiceProvider",
  "garmentPublic.rows.dppVersion",
  "garmentPublic.rows.lastUpdated",
  "garmentPublic.rows.status",
  "garmentPublic.values.published",
  "textiles.warnings.compositionExceeds100",
  "textiles.warnings.primaryExceeds100",
  "textiles.warnings.incompleteSingleFibre",
  "textiles.warnings.syntheticOver50",
  ...collectTemplateKeys(textilesTemplate),
].sort();

const templates: { name: string; keys: string[] }[] = [
  { name: "Toys", keys: toysKeys },
  { name: "Apparel", keys: textilesKeys },
];

describe.each(templates)("$name template i18n key coverage", ({ name, keys: required }) => {
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
        `🚨 Locale '${code}' is MISSING ${missing.length} template keys required by the ${name} form:\n  - ${missing.slice(0, 30).join("\n  - ")}`,
      ).toHaveLength(0);

      expect(
        empty,
        `🚨 Locale '${code}' has ${empty.length} EMPTY ${name} template values:\n  - ${empty.slice(0, 30).join("\n  - ")}`,
      ).toHaveLength(0);
    },
  );
});

describe("Apparel template is fully key-driven", () => {
  const questions = textilesTemplate.sections.flatMap((s) => s.questions);

  it("has at least one question", () => {
    expect(questions.length).toBeGreaterThan(50);
  });

  it("every section has a titleKey, and a descriptionKey when it has a description", () => {
    for (const section of textilesTemplate.sections) {
      expect(section.titleKey, `section '${section.id}' has no titleKey`).toBeTruthy();
      if (section.description) {
        expect(
          section.descriptionKey,
          `section '${section.id}' has a description but no descriptionKey`,
        ).toBeTruthy();
      }
    }
  });

  it("every question has a labelKey", () => {
    const missing = questions.filter((q) => !q.labelKey).map((q) => q.id);
    expect(missing, `Apparel questions missing labelKey: ${missing.join(", ")}`).toEqual([]);
  });

  it("every question with helpText has a helpKey", () => {
    const missing = questions.filter((q) => q.helpText && !q.helpKey).map((q) => q.id);
    expect(missing, `Apparel questions missing helpKey: ${missing.join(", ")}`).toEqual([]);
  });

  it("every question with a placeholder has a placeholderKey", () => {
    const missing = questions
      .filter((q) => q.placeholder && !q.placeholderKey)
      .map((q) => q.id);
    expect(missing, `Apparel questions missing placeholderKey: ${missing.join(", ")}`).toEqual([]);
  });

  it("every option on every question has a labelKey", () => {
    const missing: string[] = [];
    for (const q of questions) {
      for (const opt of q.options ?? []) {
        if (!opt.labelKey) missing.push(`${q.id}.${opt.value}`);
      }
    }
    expect(missing, `Apparel options missing labelKey: ${missing.join(", ")}`).toEqual([]);
  });

  it("every warnWhen has a messageKey", () => {
    const missing = questions
      .filter((q) => q.warnWhen && !q.warnWhen.messageKey)
      .map((q) => q.id);
    expect(missing, `Apparel warnWhen missing messageKey: ${missing.join(", ")}`).toEqual([]);
  });

  it("every cross-field inline warning has a non-empty messageKey", () => {
    const samples: Record<string, unknown>[] = [
      { primary_fiber_percentage: 80, secondary_fiber_percentage: 30 },
      { primary_fiber_percentage: 120 },
      { primary_fiber_percentage: 60 },
      { primary_fiber: "polyester", primary_fiber_percentage: 60 },
    ];
    const seen = new Set<string>();
    for (const data of samples) {
      const warnings = textilesTemplate.getInlineWarnings?.(data) ?? [];
      expect(warnings.length).toBeGreaterThan(0);
      for (const w of warnings) {
        expect(typeof w.messageKey).toBe("string");
        expect(w.messageKey.trim()).not.toBe("");
        seen.add(w.messageKey);
      }
    }
    expect([...seen].sort()).toEqual(
      [
        "textiles.warnings.compositionExceeds100",
        "textiles.warnings.incompleteSingleFibre",
        "textiles.warnings.primaryExceeds100",
        "textiles.warnings.syntheticOver50",
      ].sort(),
    );
  });
});
