/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// One-off, resumable translator for the Detergents `detergents.*` locale subtree.
// Usage: bun run scripts/translate-detergents-i18n.ts [--section=detergents|detergentsPublic] [fr de ...]
// Without --section both subtrees are translated, one after the other.
// Only values byte-identical to English are sent, so a re-run resumes where it stopped.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');
const TARGETS = [
  'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr', 'hu',
  'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv', 'zh-CN',
] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  bg: 'Bulgarian', cs: 'Czech', da: 'Danish', de: 'German', el: 'Greek',
  es: 'Spanish', et: 'Estonian', fi: 'Finnish', fr: 'French', ga: 'Irish',
  hr: 'Croatian', hu: 'Hungarian', it: 'Italian', lt: 'Lithuanian',
  lv: 'Latvian', mt: 'Maltese', nl: 'Dutch', pl: 'Polish', pt: 'Portuguese',
  ro: 'Romanian', sk: 'Slovak', sl: 'Slovenian', sv: 'Swedish',
  'zh-CN': 'Simplified Chinese',
};

const PROTECTED = [
  '(EU) 2026/405', '(EC) No 648/2004', '(EC) No 1272/2008', '(EU) No 528/2012',
  '(EU) 2023/2055', '(EU) 2024/825', '(EEC) No 2658/87',
  'REACH', 'CLP', 'UFI', 'EUH208', 'INCI', 'ESPR', 'DPP', 'GTIN / EAN',
  'GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09',
  'OECD 301', 'CaCO3', 'EDTA', 'NTA', 'HDPE (02)', 'PET (01)', 'PP (05)',
  'H315', 'P280', 'N1QV-R02N-J00M-WQD5', 'name@company.com', 'https://...',
  'YYYY-MM-DD',
] as const;

const CHUNK_SIZE = 288;
const SECTIONS = ['detergents', 'detergentsPublic'] as const;
let SECTION: string = 'detergents';

type Tree = Record<string, any>;

function load(code: string): Tree {
  return JSON.parse(readFileSync(resolve(LOCALES_DIR, `${code}.json`), 'utf8'));
}

function save(code: string, data: Tree): void {
  writeFileSync(resolve(LOCALES_DIR, `${code}.json`), `${JSON.stringify(data, null, 2)}\n`);
}

function flatten(value: Tree, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, out);
    else if (typeof child === 'string') out[path] = child;
  }
  return out;
}

function setPath(tree: Tree, path: string, value: string): void {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (!node[part] || typeof node[part] !== 'object') node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

function requiredProtectedTokens(source: string): string[] {
  return PROTECTED.filter((token) => source.includes(token));
}

function maskProtectedTokens(values: Record<string, string>): {
  masked: Record<string, string>;
  replacements: Record<string, string>;
} {
  const replacements: Record<string, string> = {};
  let index = 0;
  const masked = Object.fromEntries(Object.entries(values).map(([key, source]) => {
    let value = source;
    for (const token of requiredProtectedTokens(source).sort((a, b) => b.length - a.length)) {
      const marker = `__KEEP_${index++}__`;
      replacements[marker] = token;
      value = value.split(token).join(marker);
    }
    return [key, value];
  }));
  return { masked, replacements };
}

function restoreProtectedTokens(value: string, replacements: Record<string, string>): string {
  let restored = value;
  for (const [marker, token] of Object.entries(replacements)) {
    restored = restored.split(marker).join(token);
  }
  return restored;
}

function validateValue(key: string, source: string, translated: unknown): asserts translated is string {
  if (typeof translated !== 'string' || !translated.trim()) throw new Error(`${key}: empty translation`);
  for (const token of requiredProtectedTokens(source)) {
    if (!translated.includes(token)) throw new Error(`${key}: protected token changed: ${token}`);
  }
  for (const ph of source.match(/\{\{[^}]+\}\}/g) ?? []) {
    if (!translated.includes(ph)) throw new Error(`${key}: interpolation placeholder changed: ${ph}`);
  }
}

async function translateChunk(code: string, values: Record<string, string>): Promise<Record<string, string>> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not set');
  const language = LANGUAGE_NAMES[code] ?? code;
  const { masked, replacements } = maskProtectedTokens(values);
  const prompt = `You are a professional legal translator specialising in EU detergent, chemical safety and product labelling law.

Translate every JSON VALUE from English to ${language} (${code}). Return ONLY one valid JSON object with the exact same keys. Never translate keys.

LEGAL AND SAFETY RULES:
- The text appears in a legal product information form for detergents. Use the established terminology of the official ${language} versions of Regulation (EC) No 648/2004, Regulation (EU) 2026/405 and Regulation (EC) No 1272/2008 (CLP) wherever the English source uses the same concept (for example detergent, surfactant, constituent, weight range, safety data sheet, poison centre, hazard statement, precautionary statement, signal word, pictogram, micro-organism, authorised representative, importer, manufacturer).
- Never translate or alter chemical, INCI or substance names, CAS or EC numbers, GHS codes, H and P statement codes, UFI, REACH, CLP, OECD, ISO or regulation numbers. Keep Roman numerals and the article, annex, part and point numbers exactly.
- Keep percentages, units and quantities exactly (for example 0.2%, 0.5 g, 2.5 millimoles CaCO3 per litre). Translate the weight range wording faithfully: "Less than 5%", "5% or over but less than 15%", "15% or over but less than 30%", "30% and more".
- Do not soften, shorten or add to legal meaning. A warning stays a warning and a requirement stays a requirement.

VERBATIM RULE:
- Preserve every token matching __KEEP_NUMBER__ exactly. These placeholders are restored after translation.
- Preserve i18next placeholders like {{name}} exactly, untranslated.
- Preserve standalone units N and %, all URLs, dates, numbers, punctuation, line breaks, and example codes.
- Translate surrounding prose naturally and professionally. Do not leave ordinary English prose untranslated.
- Do not add explanations, markdown, comments, or alternate translations.

INPUT:
${JSON.stringify(masked)}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 30000,
    }),
  });
  if (!response.ok) throw new Error(`AI gateway ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const body: any = await response.json();
  const raw = String(body.choices?.[0]?.message?.content ?? '');
  const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first < 0 || last < first) throw new Error('AI response contained no JSON object');
  const parsed = JSON.parse(clean.slice(first, last + 1)) as Record<string, string>;
  const expected = Object.keys(values).sort();
  const actual = Object.keys(parsed).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('AI response changed the key set');
  const result = Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, restoreProtectedTokens(value, replacements)]),
  );
  for (const key of expected) validateValue(key, values[key], result[key]);
  return result;
}

async function translateLocale(code: string, english: Record<string, string>): Promise<void> {
  const locale = load(code);
  const current = flatten(locale[SECTION] ?? {});
  const pending = Object.keys(english).filter((key) => current[key] === english[key]);
  if (pending.length === 0) {
    console.log(`${code}/${SECTION}: 0 translated, ${Object.keys(english).length} skipped`);
    return;
  }

  let translatedCount = 0;
  for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
    const keys = pending.slice(i, i + CHUNK_SIZE);
    const input = Object.fromEntries(keys.map((key) => [key, english[key]]));
    const translated = await translateChunk(code, input);
    for (const key of keys) {
      setPath((locale[SECTION] ??= {}), key, translated[key]);
      translatedCount += 1;
    }
    save(code, locale);
    console.log(`${code}/${SECTION}: ${translatedCount}/${pending.length} translated`);
  }

  const finalKeys = Object.keys(flatten(locale[SECTION])).sort();
  const englishKeys = Object.keys(english).sort();
  if (JSON.stringify(finalKeys) !== JSON.stringify(englishKeys)) throw new Error(`${code}: final key set differs`);
  console.log(`${code}/${SECTION}: ${translatedCount} translated, ${englishKeys.length - translatedCount} skipped`);
}

async function main(): Promise<void> {
  const sectionArg = process.argv.find((arg) => arg.startsWith('--section='));
  const sectionsToRun: string[] = sectionArg ? [sectionArg.slice('--section='.length)] : [...SECTIONS];
  for (const section of sectionsToRun) {
    if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) throw new Error(`Unsupported section: ${section}`);
  }
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const targets = requested.length ? requested : [...TARGETS];
  for (const code of targets) {
    if (!TARGETS.includes(code as (typeof TARGETS)[number])) throw new Error(`Unsupported locale: ${code}`);
  }
  for (const section of sectionsToRun) {
    SECTION = section;
    const english = flatten(load('en')[SECTION] ?? {});
    if (Object.keys(english).length === 0) throw new Error(`No English values found for section ${SECTION}`);
    const batchSize = 4;
    for (let i = 0; i < targets.length; i += batchSize) {
      await Promise.all(targets.slice(i, i + batchSize).map((code) => translateLocale(code, english)));
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});