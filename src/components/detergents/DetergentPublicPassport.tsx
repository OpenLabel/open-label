/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DPPLanguagePicker } from '@/components/DPPLanguagePicker';
import { CarCleaningDatasetView } from '@/components/car-cleaning/CarCleaningDataset';
import { detergentsTemplate, DETERGENT_CONSTITUENT_CLASSES } from '@/templates/detergents';
import { evaluateShowWhen, type TemplateQuestion, type TemplateSection } from '@/templates/base';
import type { SelectedDetergentFragrance } from '@/data/detergentFragrances';
import { DETERGENTS_PUBLIC_COPY as COPY } from '@/components/detergents/publicCopy';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { toDppLanguage } from '@/lib/dppLanguage';
import { sanitizeUrl } from '@/lib/sanitizeUrl';

interface DetergentPublicPassportProps {
  passport: {
    name: string;
    image_url: string | null;
    description: string | null;
    category_data: Record<string, unknown>;
    updated_at: string;
  };
  isPreview?: boolean;
  /** For preview mode: current preview language */
  previewLanguage?: string;
  /** For preview mode: callback when language changes */
  onPreviewLanguageChange?: (lang: string) => void;
}

// i18next's TFunction has many overloads; accept any callable returning something stringifiable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (...args: any[]) => any;

/**
 * Answers that exist only to record the supplier's own checks or assessments.
 * They stay in the saved data but are never shown as facts on the public page,
 * so a ticked box can never read as a verified claim.
 */
export const SUPPLIER_REVIEW_FIELD_IDS = [
  'detergent_scope',
  'scope_reason',
  'dpp_profile',
  'biocidal_claims',
  'pcn_applicability',
  'pcn_exemption_reason',
  'pcn_status',
  'sds_requirement',
  'reach_review',
  'physical_label_reviewed',
  'carrier_reviewed',
  'market_language_reviewed',
  'substance_list_complete',
  'industrial_institutional_use',
  'equivalent_sds_supplied',
  'claims_avoid_generic_terms',
] as const;

/** Rendered elsewhere on the page (header, operator blocks, class table, Ecolabel badge). */
const RENDERED_ELSEWHERE = [
  'product_name',
  'brand_name',
  'ecolabel_licence_number',
  'manufacturer_non_eu',
  'constituent_classes',
] as const;

const OPERATOR_PREFIXES = ['manufacturer_', 'importer_', 'eu_operator_'];

const HIDDEN = new Set<string>([...SUPPLIER_REVIEW_FIELD_IDS, ...RENDERED_ELSEWHERE]);

const QUESTIONS: Record<string, TemplateQuestion> = Object.fromEntries(
  detergentsTemplate.sections.flatMap((s) => s.questions.map((q) => [q.id, q])),
);

const SECTIONS: Record<string, TemplateSection> = Object.fromEntries(
  detergentsTemplate.sections.map((s) => [s.id, s]),
);

/** Reader-order sections: which template sections feed each public section. */
const PUBLIC_SECTIONS: { id: string; titleKey: string; title: string; from: string[] }[] = [
  { id: 'product', titleKey: 'detergentsPublic.sections.product', title: COPY['sections.product'], from: ['identity'] },
  { id: 'hazard', titleKey: 'detergentsPublic.sections.hazard', title: COPY['sections.hazard'], from: ['classification'] },
  { id: 'use', titleKey: 'detergentsPublic.sections.use', title: COPY['sections.use'], from: ['use'] },
  { id: 'ingredients', titleKey: 'detergentsPublic.sections.ingredients', title: COPY['sections.ingredients'], from: ['ingredients'] },
  { id: 'environment', titleKey: 'detergentsPublic.sections.environment', title: COPY['sections.environment'], from: ['packaging', 'green_claims'] },
  { id: 'biocide', titleKey: 'detergentsPublic.sections.biocide', title: COPY['sections.biocide'], from: ['biocide'] },
];

const ANNEX_SECTIONS = ['annex_identity', 'annex_substances', 'annex_microorganisms'];

function Row({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === '' || value === false) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-3 py-2 border-b border-muted/50 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words min-w-0">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold mt-8 mb-3 pb-2 border-b border-foreground/10">{children}</h2>
  );
}

export function DetergentPublicPassport({
  passport,
  isPreview = false,
  previewLanguage,
  onPreviewLanguageChange,
}: DetergentPublicPassportProps) {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const d = passport.category_data || {};
  const displayLanguage = previewLanguage || toDppLanguage(i18n.language);
  const t = i18n.getFixedT(displayLanguage) as TFn;

  /** Prefer the per-language translation of a translatable field, else the source value. */
  const tr = (id: string): string => {
    const map = d[`${id}_translations`] as Record<string, string> | undefined;
    const v = map?.[displayLanguage];
    if (typeof v === 'string' && v.trim()) return v;
    const raw = d[id];
    return typeof raw === 'string' ? raw : '';
  };

  /** Field label from the template, already translated. */
  const fl = (q: TemplateQuestion): string =>
    q.labelKey ? String(t(q.labelKey, q.label)) : q.label;

  const optionLabel = (q: TemplateQuestion, value: unknown): string => {
    const option = (q.options ?? []).find((o) => o.value === value);
    if (!option) return typeof value === 'string' ? value : '';
    return option.labelKey ? String(t(option.labelKey, option.label)) : option.label;
  };

  /** A question counts only when its section and its own conditions hold. */
  const isActive = (section: TemplateSection, q: TemplateQuestion): boolean =>
    evaluateShowWhen(section.showWhen, d) && evaluateShowWhen(q.showWhen, d);

  const unitFor = (q: TemplateQuestion): string => {
    if (q.id === 'phosphorus_per_dose_g') return ' g';
    if (q.id === 'recycled_packaging_content') return '%';
    if (q.id === 'measuring_cup_ml') return ' ml';
    if (['dosage_soft', 'dosage_medium', 'dosage_hard', 'dishwasher_dose'].includes(q.id)) {
      const unit = d.dosage_unit;
      if (unit === 'ml') return ' ml';
      if (unit === 'g') return ' g';
      if (unit === 'units') return ` ${String(t('detergentsPublic.units', COPY['units']))}`;
    }
    return '';
  };

  const link = (value: string): ReactNode => {
    const safe = sanitizeUrl(value);
    if (!/^https?:\/\//i.test(safe)) return value;
    return (
      <a
        href={safe}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline inline-flex items-center gap-1 break-all"
      >
        {value}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    );
  };

  /** Public value of one question, or null when there is nothing to show. */
  function valueOf(q: TemplateQuestion): ReactNode {
    const raw = d[q.id];
    if (raw === undefined || raw === null || raw === '') return null;
    switch (q.type) {
      case 'select': {
        // An unfinished assessment is never shown as an answer.
        if (raw === 'review') return null;
        return optionLabel(q, raw);
      }
      case 'multi_select': {
        if (q.id === 'fragrance_allergens') {
          const items = Array.isArray(raw) ? (raw as SelectedDetergentFragrance[]) : [];
          if (items.length === 0) return null;
          return (
            <ul className="list-disc ml-5 space-y-0.5">
              {items.map((a) => (
                <li key={a.id}>
                  {a.name}
                  {a.cas ? <span className="text-muted-foreground"> (CAS {a.cas})</span> : null}
                </li>
              ))}
            </ul>
          );
        }
        const values = Array.isArray(raw) ? (raw as string[]) : [];
        if (values.length === 0) return null;
        return (
          <ul className="list-disc ml-5 space-y-0.5">
            {values.map((v) => (
              <li key={v}>{optionLabel(q, v)}</li>
            ))}
          </ul>
        );
      }
      case 'checkbox':
        // Only a ticked fact is shown. An unticked box never reads as "No".
        return raw === true ? String(t('common.yes', 'Yes')) : null;
      case 'number':
        return typeof raw === 'number' || typeof raw === 'string' ? `${raw}${unitFor(q)}` : null;
      case 'substances':
      case 'microorganisms':
        return <CarCleaningDatasetView kind={q.type} value={raw} translate={t as (key: string, fallback: string) => string} />;
      case 'textarea': {
        const text = tr(q.id);
        return text ? <p className="whitespace-pre-wrap">{text}</p> : null;
      }
      default: {
        if (typeof raw !== 'string') return null;
        if (q.id.endsWith('_url')) return link(raw);
        const text = q.translatable ? tr(q.id) : raw;
        return text || null;
      }
    }
  }

  /** Rows for the given template sections, honouring every condition. */
  function rowsFor(sectionIds: string[], skip: (q: TemplateQuestion) => boolean = () => false) {
    const rows: { id: string; label: string; value: ReactNode }[] = [];
    for (const sid of sectionIds) {
      const section = SECTIONS[sid];
      if (!section) continue;
      for (const q of section.questions) {
        if (HIDDEN.has(q.id) || q.id.startsWith('band_')) continue;
        if (OPERATOR_PREFIXES.some((p) => q.id.startsWith(p))) continue;
        if (!isActive(section, q) || skip(q)) continue;
        const value = valueOf(q);
        if (value === null || value === undefined || value === '') continue;
        rows.push({ id: q.id, label: fl(q), value });
      }
    }
    return rows;
  }

  // Constituent classes with their weight range, only for ticked classes.
  const classValues = Array.isArray(d.constituent_classes) ? (d.constituent_classes as string[]) : [];
  const classRows = DETERGENT_CONSTITUENT_CLASSES.filter((c) => classValues.includes(c.value)).map((c) => {
    const classQuestion = QUESTIONS.constituent_classes;
    const bandQuestion = QUESTIONS[`band_${c.value}`];
    const className = optionLabel(classQuestion, c.value);
    const band = bandQuestion && d[bandQuestion.id] ? optionLabel(bandQuestion, d[bandQuestion.id]) : '';
    return { key: c.value, className, band };
  });

  const address = (prefix: string): string =>
    [d[`${prefix}_street`], d[`${prefix}_postal_code`], d[`${prefix}_city`], d[`${prefix}_country`]]
      .filter(Boolean)
      .join(', ');

  const operatorRows = (prefix: string, ids: { name: string; email: string; phone?: string; address?: string }) => ({
    name: d[ids.name] as string | undefined,
    address: ids.address ? (d[ids.address] as string | undefined) : address(prefix),
    email: d[ids.email] as string | undefined,
    phone: ids.phone ? (d[ids.phone] as string | undefined) : undefined,
  });

  const manufacturer = operatorRows('manufacturer', {
    name: 'manufacturer_legal_name',
    email: 'manufacturer_email',
    phone: 'manufacturer_phone',
  });
  const nonEu = d.manufacturer_non_eu === 'yes';
  const importer = operatorRows('importer', { name: 'importer_legal_name', email: 'importer_email' });
  const representative = operatorRows('eu_operator', {
    name: 'eu_operator_name',
    email: 'eu_operator_email',
    address: 'eu_operator_address',
  });

  const hasOperator = (o: { name?: string; address?: string; email?: string; phone?: string }) =>
    Boolean(o.name || o.address || o.email || o.phone);

  const OperatorBlock = ({ title, o }: { title: string; o: ReturnType<typeof operatorRows> }) =>
    hasOperator(o) ? (
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <dl>
          <Row label={String(t('detergentsPublic.rows.name', COPY['rows.name']))} value={o.name} />
          <Row label={String(t('detergentsPublic.rows.address', COPY['rows.address']))} value={o.address} />
          <Row label={String(t('detergentsPublic.rows.email', COPY['rows.email']))} value={o.email} />
          <Row label={String(t('detergentsPublic.rows.phone', COPY['rows.phone']))} value={o.phone} />
        </dl>
      </div>
    ) : null;

  const ecolabelLicence = typeof d.ecolabel_licence_number === 'string' ? d.ecolabel_licence_number.trim() : '';
  const annexActive = evaluateShowWhen(SECTIONS.annex_identity.showWhen, d);
  const productName = tr('product_name') || passport.name || '';
  const brand = typeof d.brand_name === 'string' ? d.brand_name : '';
  const productTypeLabel = d.product_type ? optionLabel(QUESTIONS.product_type, d.product_type) : '';

  return (
    <div className="min-h-screen bg-background text-foreground" lang={displayLanguage}>
      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex justify-end mb-4">
          <DPPLanguagePicker
            localOnly={isPreview}
            currentLanguage={previewLanguage}
            onLanguageChange={onPreviewLanguageChange}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {passport.image_url && (
            <img
              referrerPolicy="no-referrer"
              src={passport.image_url}
              alt={productName}
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-muted/30 rounded-md border"
            />
          )}
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="mb-2">
              🧴 {String(t('detergentsPublic.headerBadge', COPY['headerBadge']))}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">{productName}</h1>
            {(brand || productTypeLabel || d.net_content) && (
              <p className="text-sm text-muted-foreground mt-1">
                {[brand, productTypeLabel, typeof d.net_content === 'string' ? d.net_content : '']
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
            {d.counterfeit_protection_enabled ? (
              isPreview ? (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  {String(t('preview.checkAuthenticity', 'Check authenticity'))}
                </div>
              ) : (
                <a
                  href="https://app.cypheme.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {String(t('passport.checkAuthenticity', 'Check authenticity'))}
                </a>
              )
            ) : null}
          </div>
        </div>

        {/* Honest status of this page */}
        <aside className="mt-5 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
          <p>
            {String(
              t('detergentsPublic.notice', COPY.notice),
            )}
          </p>
        </aside>

        {passport.description && (
          <div
            className="prose prose-sm max-w-none mt-6"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                (d.description_translations as Record<string, string> | undefined)?.[displayLanguage] ||
                  passport.description,
                { FORBID_TAGS: ['img', 'video', 'audio', 'source', 'iframe', 'object', 'embed', 'svg'], FORBID_ATTR: ['style'] },
              ),
            }}
          />
        )}

        {/* Reader-order sections, each hidden when it has nothing to show */}
        {PUBLIC_SECTIONS.map((ps) => {
          const rows = rowsFor(ps.from);
          const extraIngredients = ps.id === 'ingredients' && classRows.length > 0;
          const ecolabel = ps.id === 'environment' && ecolabelLicence !== '';
          if (rows.length === 0 && !extraIngredients && !ecolabel) return null;
          return (
            <section key={ps.id} data-testid={`section-${ps.id}`}>
              <SectionTitle>{String(t(ps.titleKey, ps.title))}</SectionTitle>
              <dl>
                {extraIngredients && (
                  <Row
                    label={String(t('detergentsPublic.rows.constituentClasses', COPY['rows.constituentClasses']))}
                    value={
                      <ul className="space-y-0.5">
                        {classRows.map((c) => (
                          <li key={c.key}>
                            {c.className}
                            {c.band ? <span className="text-muted-foreground">: {c.band}</span> : null}
                          </li>
                        ))}
                      </ul>
                    }
                  />
                )}
                {rows.map((r) => (
                  <Row key={r.id} label={r.label} value={r.value} />
                ))}
                {ecolabel && (
                  <Row
                    label={String(t('detergentsPublic.rows.ecolabel', COPY['rows.ecolabel']))}
                    value={
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{String(t('detergentsPublic.ecolabelBadge', COPY['ecolabelBadge']))}</Badge>
                        <span className="text-muted-foreground">
                          {String(t('detergentsPublic.rows.licenceNumber', COPY['rows.licenceNumber']))}: {ecolabelLicence}
                        </span>
                      </span>
                    }
                  />
                )}
              </dl>
            </section>
          );
        })}

        {/* Who is responsible */}
        {(hasOperator(manufacturer) || (nonEu && (hasOperator(importer) || hasOperator(representative)))) && (
          <>
            <SectionTitle>{String(t('detergentsPublic.sections.responsible', COPY['sections.responsible']))}</SectionTitle>
            <OperatorBlock title={String(t('detergentsPublic.subsections.manufacturer', COPY['subsections.manufacturer']))} o={manufacturer} />
            {nonEu && (
              <OperatorBlock title={String(t('detergentsPublic.subsections.importer', COPY['subsections.importer']))} o={importer} />
            )}
            {nonEu && (
              <OperatorBlock
                title={String(t('detergentsPublic.subsections.authorisedRepresentative', COPY['subsections.authorisedRepresentative']))}
                o={representative}
              />
            )}
          </>
        )}

        {/* Annex VI dataset, only on the Annex VI profile */}
        {annexActive && (() => {
          const rows = rowsFor(ANNEX_SECTIONS);
          if (rows.length === 0) return null;
          return (
            <section data-testid="section-annex">
              <SectionTitle>{String(t('detergentsPublic.sections.annexVi', COPY['sections.annexVi']))}</SectionTitle>
              <dl>
                {rows.map((r) => (
                  <Row key={r.id} label={r.label} value={r.value} />
                ))}
              </dl>
            </section>
          );
        })()}

        {/* Supplier review reference and passport infrastructure */}
        <SectionTitle>{String(t('detergentsPublic.sections.metadata', COPY['sections.metadata']))}</SectionTitle>
        <dl>
          <Row
            label={String(t('detergentsPublic.rows.dppServiceProvider', COPY['rows.dppServiceProvider']))}
            value={config?.company_name || 'Open-Label.eu'}
          />
          <Row label={String(t('detergentsPublic.rows.dppVersion', COPY['rows.dppVersion']))} value="1.0" />
          <Row
            label={String(t('detergentsPublic.rows.lastUpdated', COPY['rows.lastUpdated']))}
            value={new Date(passport.updated_at).toLocaleDateString(displayLanguage)}
          />
          <Row
            label={String(t('detergentsPublic.rows.status', COPY['rows.status']))}
            value={<Badge variant="secondary">{String(t('detergentsPublic.values.published', COPY['values.published']))}</Badge>}
          />
        </dl>

        <Separator className="my-8" />

        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            {String(t('passport.poweredBy', 'Powered by'))}{' '}
            <a
              href="https://www.open-label.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Open Label <span className="font-bold">.eu</span>
            </a>
          </p>
          {!isPreview && (
            <p>
              <Link to="/legal" className="underline hover:text-foreground">
                {String(t('legal.legalMentions', 'Legal mentions'))}
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default DetergentPublicPassport;
