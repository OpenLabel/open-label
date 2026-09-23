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

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';
import { textilesTemplate } from '@/templates/textiles';
import type { TemplateOption, TemplateQuestion } from '@/templates/base';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { DPPLanguagePicker } from '@/components/DPPLanguagePicker';
import { toDppLanguage } from '@/lib/dppLanguage';
import { sanitizeUrl } from '@/lib/sanitizeUrl';

interface GarmentPublicPassportProps {
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

// i18next's TFunction has many overloads; accept any callable that returns something stringifiable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (...args: any[]) => any;

/**
 * INTERNAL EVIDENCE — must never be rendered on the public passport.
 * Kept here as a documented deny-list so the omission is explicit rather
 * than accidental. See src/lib/publicPassportFields.ts.
 */
const NEVER_PUBLIC_FIELD_IDS = [
  'audit_certificate_file',
  'lca_report_file',
  'test_report_file',
  'claims_evidence_file',
] as const;

/** Every Apparel question, indexed by id, so labels come from the template. */
const QUESTIONS: Record<string, TemplateQuestion> = Object.fromEntries(
  textilesTemplate.sections.flatMap((s) => s.questions.map((q) => [q.id, q])),
);

const SECTION_TITLE_KEYS: Record<string, { key?: string; fallback: string }> =
  Object.fromEntries(
    textilesTemplate.sections.map((s) => [
      s.id,
      { key: s.titleKey, fallback: s.title },
    ]),
  );

function labelFor(options: TemplateOption[] | undefined, value: unknown, t: TFn): string {
  if (typeof value !== 'string') return '';
  const opt = (options ?? []).find((o) => o.value === value);
  if (!opt) return value;
  return opt.labelKey ? String(t(opt.labelKey, opt.label)) : opt.label;
}

function labelsFor(options: TemplateOption[] | undefined, values: unknown, t: TFn): string[] {
  if (!Array.isArray(values)) return [];
  return (values as string[]).map((v) => labelFor(options, v, t));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 py-2 border-b border-muted/50 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold mt-8 mb-3 pb-2 border-b border-foreground/10">
      {children}
    </h2>
  );
}

/** True when at least one of the given ids carries a usable value. */
function hasAny(d: Record<string, unknown>, ids: string[]): boolean {
  return ids.some((id) => {
    const v = d[id];
    if (v === undefined || v === null || v === '' || v === false) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
}

export function GarmentPublicPassport({
  passport,
  isPreview = false,
  previewLanguage,
  onPreviewLanguageChange,
}: GarmentPublicPassportProps) {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const d = passport.category_data || {};
  const displayLanguage = previewLanguage || toDppLanguage(i18n.language);
  const t = i18n.getFixedT(displayLanguage);

  /** Prefer per-language translation, fall back to the source value. */
  const tr = (id: string): string => {
    const map = d[`${id}_translations`] as Record<string, string> | undefined;
    const v = map?.[displayLanguage];
    if (v && v.trim()) return v;
    return (d[id] as string) || '';
  };

  /** Field label straight from the Apparel template (already translated). */
  const fl = (id: string): string => {
    const q = QUESTIONS[id];
    if (!q) return id;
    return q.labelKey ? String(t(q.labelKey, q.label)) : q.label;
  };

  /** Section title straight from the Apparel template. */
  const st = (id: string): string => {
    const s = SECTION_TITLE_KEYS[id];
    if (!s) return id;
    return s.key ? String(t(s.key, s.fallback)) : s.fallback;
  };

  const optionLabel = (id: string, value: unknown): string =>
    labelFor(QUESTIONS[id]?.options, value, t);

  const yesNo = (value: unknown): string =>
    value ? String(t('common.yes', 'Yes')) : String(t('common.no', 'No'));

  const address = (prefix: string): string =>
    [
      d[`${prefix}_street`],
      d[`${prefix}_postal_code`],
      d[`${prefix}_city`],
      d[`${prefix}_country`],
    ]
      .filter(Boolean)
      .join(', ');

  const careSymbols = labelsFor(QUESTIONS.care_symbols?.options, d.care_symbols, t);
  const certifications = labelsFor(
    QUESTIONS.certifications_held?.options,
    d.certifications_held,
    t,
  );
  const madeInEu = Boolean(d.made_in_eu);

  const percent = (id: string): string => {
    const v = d[id];
    if (v === undefined || v === null || v === '') return '';
    return `${v as string | number}%`;
  };

  const showIdentity = hasAny(d, [
    'brand_name',
    'product_type',
    'style_reference',
    'item_unique_identifier',
    'gtin',
    'colourway',
    'size',
    'batch_lot',
    'product_weight_grams',
  ]);
  const showMaterials = hasAny(d, [
    'primary_fiber',
    'primary_fiber_percentage',
    'secondary_fiber',
    'secondary_fiber_percentage',
    'full_composition',
    'component_composition',
    'recycled_content_percentage',
    'recycled_pre_consumer_percentage',
    'recycled_post_consumer_percentage',
    'microplastic_shedding',
    'contains_animal_parts',
    'animal_parts_details',
  ]);
  const showSubstances = hasAny(d, [
    'svhc_declared',
    'svhc_details',
    'pfas_present',
    'pfas_details',
    'rsl_compliance_status',
  ]);
  const showCare = hasAny(d, [
    'washing_temp',
    'can_tumble_dry',
    'can_iron',
    'iron_temp',
    'care_symbols',
    'care_instructions_text',
  ]);
  const showSupplyChain = hasAny(d, [
    'country_fibre_production',
    'country_spinning_weaving',
    'country_dyeing_finishing',
    'country_of_origin',
    'made_in_eu',
    'manufacturing_facility',
    'factory_address',
    'audit_status',
    'supply_chain_transparent',
  ]);
  const showCertifications = certifications.length > 0 || madeInEu || hasAny(d, ['certificate_references']);
  const showDurability = hasAny(d, [
    'pilling_resistance',
    'colour_fastness_washing',
    'colour_fastness_light',
    'dimensional_stability',
    'seam_strength',
    'test_report_reference',
  ]);
  const showEnvironment = hasAny(d, ['carbon_footprint', 'water_usage', 'footprint_method']);
  const showCircularity = hasAny(d, [
    'recyclable',
    'take_back_program',
    'take_back_scheme_epr',
    'recyclability_class',
    'spare_trims_available',
    'repair_booking_url',
    'disassembly_notes',
  ]);
  const showGreenClaims =
    Boolean(tr('environmental_claims')) ||
    hasAny(d, ['claims_evidence_reference', 'claims_avoid_generic_terms']);
  const showResponsible = hasAny(d, [
    'manufacturer_legal_name',
    'manufacturer_street',
    'manufacturer_email',
    'importer_legal_name',
    'eu_operator_name',
    'eu_operator_address',
    'eu_operator_email',
  ]);
  const showImporter = d.manufacturer_non_eu === 'yes';
  const showDisposition = hasAny(d, [
    'disposition_status',
    'disposition_reason_code',
    'disposition_date',
    'disposition_notes',
  ]);
  const showAuthentication = hasAny(d, [
    'authentication_feature_present',
    'authentication_method',
    'authentication_verification_url',
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Language Switcher - Top Right */}
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
              src={passport.image_url}
              alt={passport.name}
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-muted/30 rounded-md border"
            />
          )}
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              👕 {t('garmentPublic.headerBadge', 'Apparel — Digital Product Passport')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{passport.name}</h1>
            {Boolean(d.brand_name) && (
              <p className="text-sm text-muted-foreground mt-1">
                {tr('brand_name')}
                {d.product_type ? ` · ${d.product_type as string}` : ''}
                {d.style_reference ? ` · ${d.style_reference as string}` : ''}
              </p>
            )}
            {d.counterfeit_protection_enabled ? (
              isPreview ? (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  {t('preview.checkAuthenticity', 'Check authenticity')}
                </div>
              ) : (
                <a
                  href="https://app.cypheme.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t('passport.checkAuthenticity', 'Check authenticity')}
                </a>
              )
            ) : null}
          </div>
        </div>

        {/* Description */}
        {passport.description && (
          <div
            className="prose prose-sm max-w-none mt-6"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                (d.description_translations as Record<string, string> | undefined)?.[
                  displayLanguage
                ] || passport.description,
              ),
            }}
          />
        )}

        {/* 1. Identity */}
        {showIdentity && (
          <>
            <SectionTitle>{st('identity')}</SectionTitle>
            <dl>
              <Row label={fl('brand_name')} value={tr('brand_name')} />
              <Row label={fl('product_type')} value={d.product_type as string} />
              <Row label={fl('style_reference')} value={d.style_reference as string} />
              <Row
                label={fl('item_unique_identifier')}
                value={d.item_unique_identifier as string}
              />
              <Row label={fl('gtin')} value={d.gtin as string} />
              <Row label={fl('colourway')} value={d.colourway as string} />
              <Row label={fl('size')} value={d.size as string} />
              <Row label={fl('batch_lot')} value={d.batch_lot as string} />
              <Row
                label={fl('product_weight_grams')}
                value={d.product_weight_grams as string | number}
              />
            </dl>
          </>
        )}

        {/* 2. Materials and composition */}
        {showMaterials && (
          <>
            <SectionTitle>{st('materials')}</SectionTitle>
            <dl>
              <Row
                label={fl('primary_fiber')}
                value={
                  [optionLabel('primary_fiber', d.primary_fiber), percent('primary_fiber_percentage')]
                    .filter(Boolean)
                    .join(' — ')
                }
              />
              <Row
                label={fl('secondary_fiber')}
                value={
                  [d.secondary_fiber as string, percent('secondary_fiber_percentage')]
                    .filter(Boolean)
                    .join(' — ')
                }
              />
              <Row
                label={fl('full_composition')}
                value={
                  d.full_composition ? (
                    <p className="whitespace-pre-wrap">{tr('full_composition')}</p>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('component_composition')}
                value={
                  d.component_composition ? (
                    <p className="whitespace-pre-wrap">{tr('component_composition')}</p>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('recycled_content_percentage')}
                value={percent('recycled_content_percentage')}
              />
              <Row
                label={fl('recycled_pre_consumer_percentage')}
                value={percent('recycled_pre_consumer_percentage')}
              />
              <Row
                label={fl('recycled_post_consumer_percentage')}
                value={percent('recycled_post_consumer_percentage')}
              />
              {Boolean(d.microplastic_shedding) && (
                <Row label={fl('microplastic_shedding')} value={yesNo(true)} />
              )}
              {Boolean(d.contains_animal_parts) && (
                <Row label={fl('contains_animal_parts')} value={yesNo(true)} />
              )}
              <Row
                label={fl('animal_parts_details')}
                value={
                  d.animal_parts_details ? (
                    <p className="whitespace-pre-wrap">{tr('animal_parts_details')}</p>
                  ) : (
                    ''
                  )
                }
              />
            </dl>
          </>
        )}

        {/* 3. Substances */}
        {showSubstances && (
          <>
            <SectionTitle>{t('garmentPublic.sections.substances', 'Substances')}</SectionTitle>
            <dl>
              {Boolean(d.svhc_declared) && (
                <Row label={fl('svhc_declared')} value={yesNo(true)} />
              )}
              <Row
                label={fl('svhc_details')}
                value={
                  d.svhc_details ? <p className="whitespace-pre-wrap">{tr('svhc_details')}</p> : ''
                }
              />
              <Row
                label={fl('pfas_present')}
                value={optionLabel('pfas_present', d.pfas_present)}
              />
              <Row
                label={fl('pfas_details')}
                value={
                  d.pfas_details ? <p className="whitespace-pre-wrap">{tr('pfas_details')}</p> : ''
                }
              />
              <Row
                label={fl('rsl_compliance_status')}
                value={optionLabel('rsl_compliance_status', d.rsl_compliance_status)}
              />
            </dl>
          </>
        )}

        {/* 4. Care */}
        {showCare && (
          <>
            <SectionTitle>{t('garmentPublic.sections.care', 'Care')}</SectionTitle>
            <dl>
              <Row label={fl('washing_temp')} value={optionLabel('washing_temp', d.washing_temp)} />
              {Boolean(d.can_tumble_dry) && (
                <Row label={fl('can_tumble_dry')} value={yesNo(true)} />
              )}
              {Boolean(d.can_iron) && <Row label={fl('can_iron')} value={yesNo(true)} />}
              <Row label={fl('iron_temp')} value={optionLabel('iron_temp', d.iron_temp)} />
              <Row
                label={fl('care_symbols')}
                value={
                  careSymbols.length > 0 ? (
                    <ul className="list-disc ml-5 space-y-0.5">
                      {careSymbols.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('care_instructions_text')}
                value={
                  d.care_instructions_text ? (
                    <p className="whitespace-pre-wrap">{tr('care_instructions_text')}</p>
                  ) : (
                    ''
                  )
                }
              />
            </dl>
          </>
        )}

        {/* 5. Supply chain */}
        {showSupplyChain && (
          <>
            <SectionTitle>{st('supply_chain')}</SectionTitle>
            <dl>
              <Row
                label={fl('country_fibre_production')}
                value={d.country_fibre_production as string}
              />
              <Row
                label={fl('country_spinning_weaving')}
                value={d.country_spinning_weaving as string}
              />
              <Row
                label={fl('country_dyeing_finishing')}
                value={d.country_dyeing_finishing as string}
              />
              <Row label={fl('country_of_origin')} value={d.country_of_origin as string} />
              {madeInEu && <Row label={fl('made_in_eu')} value={yesNo(true)} />}
              <Row
                label={fl('manufacturing_facility')}
                value={d.manufacturing_facility as string}
              />
              <Row
                label={fl('factory_address')}
                value={
                  d.factory_address ? (
                    <p className="whitespace-pre-wrap">{d.factory_address as string}</p>
                  ) : (
                    ''
                  )
                }
              />
              <Row label={fl('audit_status')} value={optionLabel('audit_status', d.audit_status)} />
              {Boolean(d.supply_chain_transparent) && (
                <Row label={fl('supply_chain_transparent')} value={yesNo(true)} />
              )}
            </dl>
          </>
        )}

        {/* 6. Certifications — labels come from the template options, never slugs */}
        {showCertifications && (
          <>
            <SectionTitle>{st('certifications')}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <Badge key={c} variant="outline" className="text-sm py-1 px-3">
                  {/* Logo images intentionally omitted: no certification mark is licensed yet. */}
                  {c}
                </Badge>
              ))}
              {madeInEu && (
                <Badge variant="outline" className="text-sm py-1 px-3">
                  {t('garmentPublic.madeInEu', 'Made in EU')}
                </Badge>
              )}
            </div>
            {Boolean(d.certificate_references) && (
              <pre className="mt-3 text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                {d.certificate_references as string}
              </pre>
            )}
          </>
        )}

        {/* 7. Durability and testing (test_report_file is internal and never shown) */}
        {showDurability && (
          <>
            <SectionTitle>{st('durability')}</SectionTitle>
            <dl>
              <Row label={fl('pilling_resistance')} value={d.pilling_resistance as string} />
              <Row
                label={fl('colour_fastness_washing')}
                value={d.colour_fastness_washing as string}
              />
              <Row label={fl('colour_fastness_light')} value={d.colour_fastness_light as string} />
              <Row
                label={fl('dimensional_stability')}
                value={d.dimensional_stability as string}
              />
              <Row label={fl('seam_strength')} value={d.seam_strength as string} />
              <Row
                label={fl('test_report_reference')}
                value={d.test_report_reference as string}
              />
            </dl>
          </>
        )}

        {/* 8. Environmental footprint (lca_report_file is internal and never shown) */}
        {showEnvironment && (
          <>
            <SectionTitle>{st('environment')}</SectionTitle>
            <dl>
              <Row
                label={fl('carbon_footprint')}
                value={d.carbon_footprint as string | number}
              />
              <Row label={fl('water_usage')} value={d.water_usage as string | number} />
              <Row
                label={fl('footprint_method')}
                value={optionLabel('footprint_method', d.footprint_method)}
              />
            </dl>
          </>
        )}

        {/* 9. Circularity */}
        {showCircularity && (
          <>
            <SectionTitle>{st('circularity')}</SectionTitle>
            <dl>
              {Boolean(d.recyclable) && <Row label={fl('recyclable')} value={yesNo(true)} />}
              {Boolean(d.take_back_program) && (
                <Row label={fl('take_back_program')} value={yesNo(true)} />
              )}
              <Row
                label={fl('take_back_scheme_epr')}
                value={
                  d.take_back_scheme_epr ? (
                    <p className="whitespace-pre-wrap">{d.take_back_scheme_epr as string}</p>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('recyclability_class')}
                value={optionLabel('recyclability_class', d.recyclability_class)}
              />
              {Boolean(d.spare_trims_available) && (
                <Row label={fl('spare_trims_available')} value={yesNo(true)} />
              )}
              <Row
                label={fl('repair_booking_url')}
                value={
                  d.repair_booking_url ? (
                    <a
                      href={sanitizeUrl(String(d.repair_booking_url))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-1"
                    >
                      {d.repair_booking_url as string}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('disassembly_notes')}
                value={
                  d.disassembly_notes ? (
                    <p className="whitespace-pre-wrap">{tr('disassembly_notes')}</p>
                  ) : (
                    ''
                  )
                }
              />
            </dl>
          </>
        )}

        {/* 10. Green claims (claims_evidence_file is internal and never shown) */}
        {showGreenClaims && (
          <>
            <SectionTitle>{st('green_claims')}</SectionTitle>
            <dl>
              <Row
                label={fl('environmental_claims')}
                value={
                  tr('environmental_claims') ? (
                    <p className="whitespace-pre-wrap">{tr('environmental_claims')}</p>
                  ) : (
                    ''
                  )
                }
              />
              <Row
                label={fl('claims_evidence_reference')}
                value={
                  d.claims_evidence_reference ? (
                    <p className="whitespace-pre-wrap">{d.claims_evidence_reference as string}</p>
                  ) : (
                    ''
                  )
                }
              />
              {Boolean(d.claims_avoid_generic_terms) && (
                <Row label={fl('claims_avoid_generic_terms')} value={yesNo(true)} />
              )}
            </dl>
          </>
        )}

        {/* 11. Who is responsible */}
        {showResponsible && (
          <>
            <SectionTitle>{st('responsible_operators')}</SectionTitle>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">
                {t('garmentPublic.subsections.manufacturer', 'Manufacturer')}
              </h3>
              <dl>
                <Row
                  label={fl('manufacturer_legal_name')}
                  value={d.manufacturer_legal_name as string}
                />
                <Row
                  label={t('garmentPublic.rows.address', 'Address')}
                  value={address('manufacturer')}
                />
                <Row label={fl('manufacturer_email')} value={d.manufacturer_email as string} />
              </dl>
            </div>

            {showImporter && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">
                  {t('garmentPublic.subsections.importer', 'Importer')}
                </h3>
                <dl>
                  <Row
                    label={fl('importer_legal_name')}
                    value={d.importer_legal_name as string}
                  />
                  <Row
                    label={t('garmentPublic.rows.address', 'Address')}
                    value={address('importer')}
                  />
                  <Row label={fl('importer_email')} value={d.importer_email as string} />
                </dl>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-2">
                {t('garmentPublic.subsections.euResponsiblePerson', 'EU responsible person')}
              </h3>
              <dl>
                <Row label={fl('eu_operator_name')} value={d.eu_operator_name as string} />
                <Row
                  label={fl('eu_operator_address')}
                  value={
                    d.eu_operator_address ? (
                      <p className="whitespace-pre-wrap">{d.eu_operator_address as string}</p>
                    ) : (
                      ''
                    )
                  }
                />
                <Row label={fl('eu_operator_email')} value={d.eu_operator_email as string} />
              </dl>
            </div>
          </>
        )}

        {/* 12. Disposition record */}
        {showDisposition && (
          <>
            <SectionTitle>{st('disposition')}</SectionTitle>
            <dl>
              <Row
                label={fl('disposition_status')}
                value={optionLabel('disposition_status', d.disposition_status)}
              />
              <Row
                label={fl('disposition_reason_code')}
                value={optionLabel('disposition_reason_code', d.disposition_reason_code)}
              />
              <Row label={fl('disposition_date')} value={d.disposition_date as string} />
              <Row
                label={fl('disposition_notes')}
                value={
                  d.disposition_notes ? (
                    <p className="whitespace-pre-wrap">{d.disposition_notes as string}</p>
                  ) : (
                    ''
                  )
                }
              />
            </dl>
          </>
        )}

        {/* 13. Authentication */}
        {showAuthentication && (
          <>
            <SectionTitle>{st('authentication')}</SectionTitle>
            <dl>
              {Boolean(d.authentication_feature_present) && (
                <Row label={fl('authentication_feature_present')} value={yesNo(true)} />
              )}
              <Row
                label={fl('authentication_method')}
                value={optionLabel('authentication_method', d.authentication_method)}
              />
              <Row
                label={fl('authentication_verification_url')}
                value={
                  d.authentication_verification_url ? (
                    <a
                      href={sanitizeUrl(String(d.authentication_verification_url))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-1"
                    >
                      {d.authentication_verification_url as string}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    ''
                  )
                }
              />
            </dl>
          </>
        )}

        {/* Passport metadata */}
        <SectionTitle>
          {t('garmentPublic.sections.metadata', 'DPP infrastructure')}
        </SectionTitle>
        <dl>
          <Row
            label={t('garmentPublic.rows.dppServiceProvider', 'DPP service provider')}
            value={config?.company_name || 'Open-Label.eu'}
          />
          <Row label={t('garmentPublic.rows.dppVersion', 'DPP version')} value="1.0" />
          <Row
            label={t('garmentPublic.rows.lastUpdated', 'Last updated')}
            value={new Date(passport.updated_at).toLocaleDateString(displayLanguage)}
          />
          <Row
            label={t('garmentPublic.rows.status', 'Status')}
            value={
              <Badge variant="secondary">
                {t('garmentPublic.values.published', 'Published')}
              </Badge>
            }
          />
        </dl>

        <Separator className="my-8" />

        {/* Powered by — mandatory attribution */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            {t('passport.poweredBy', 'Powered by')}{' '}
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
                {t('legal.legalMentions', 'Legal mentions')}
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export { NEVER_PUBLIC_FIELD_IDS };
export default GarmentPublicPassport;
