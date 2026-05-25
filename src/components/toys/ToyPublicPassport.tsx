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
import {
  TOY_AGE_GROUPS,
  TOY_CATEGORIES,
  TOY_CN_CHAPTERS,
  TOY_EU_OPERATOR_ROLES,
  TOY_IDENTIFIER_TYPES,
  TOY_LEGISLATION,
  TOY_OPERATOR_ID_TYPES,
  TOY_SAFETY_CHANNELS,
  TOY_STANDARDS,
} from '@/templates/toys';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import type { SelectedFragrance } from '@/data/toyFragrances';

import { DPPLanguagePicker } from '@/components/DPPLanguagePicker';

interface ToyPublicPassportProps {
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

type LocalizedOption = { value: string; label: string; labelKey?: string };
type TFn = (key: string, fallback?: string) => string;

function labelFor(
  options: LocalizedOption[],
  value: unknown,
  t: TFn,
): string {
  if (typeof value !== 'string') return '';
  const opt = options.find((o) => o.value === value);
  if (!opt) return value;
  return opt.labelKey ? t(opt.labelKey, opt.label) : opt.label;
}

function labelsFor(
  options: LocalizedOption[],
  values: unknown,
  t: TFn,
): string[] {
  if (!Array.isArray(values)) return [];
  return (values as string[]).map((v) => labelFor(options, v, t));
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '' ) return null;
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 py-2 border-b border-muted/50 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
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

export function ToyPublicPassport({
  passport,
  isPreview = false,
  previewLanguage,
  onPreviewLanguageChange,
}: ToyPublicPassportProps) {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const d = passport.category_data || {};
  const displayLanguage = previewLanguage || (i18n.language || 'en').split('-')[0];
  const t = i18n.getFixedT(displayLanguage);

  /** Prefer per-language translation, fall back to the source value. */
  const tr = (id: string): string => {
    const map = d[`${id}_translations`] as Record<string, string> | undefined;
    const v = map?.[displayLanguage];
    if (v && v.trim()) return v;
    return (d[id] as string) || '';
  };

  const toyCategoryLabel =
    d.toy_category === 'other'
      ? (d.toy_category_other as string) || 'Other'
      : labelFor(TOY_CATEGORIES, d.toy_category, t);

  const ageLabel =
    d.age_group === 'other'
      ? (d.age_group_other as string) || 'Other'
      : labelFor(TOY_AGE_GROUPS, d.age_group, t);

  const identifierTypeLabel =
    d.identifier_type === 'other'
      ? (d.identifier_type_other as string) || 'Other'
      : labelFor(TOY_IDENTIFIER_TYPES, d.identifier_type, t);

  const fragrances = (d.allergenic_fragrances as SelectedFragrance[]) || [];

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
              🧸 {t('toyPublic.headerBadge')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {passport.name}
            </h1>
            {Boolean(d.brand_name) && (
              <p className="text-sm text-muted-foreground mt-1">
                {tr('brand_name')}
                {d.model_name ? ` · ${d.model_name as string}` : ''}
                {d.sku ? ` · SKU ${d.sku as string}` : ''}
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
              __html: DOMPurify.sanitize(passport.description),
            }}
          />
        )}

        {/* Product identity */}
        <SectionTitle>{t('toyPublic.sections.productIdentity')}</SectionTitle>
        <dl>
          <Row label={t('toyPublic.rows.brand')} value={tr('brand_name')} />
          <Row label={t('toyPublic.rows.model')} value={d.model_name as string} />
          <Row label={t('toyPublic.rows.skuVariant')} value={d.sku as string} />
          <Row label={t('toyPublic.rows.toyCategory')} value={toyCategoryLabel} />
          <Row label={t('toyPublic.rows.intendedAgeGroup')} value={ageLabel} />
          <Row
            label={t('toyPublic.rows.uniqueIdentifier')}
            value={
              d.unique_product_identifier && identifierTypeLabel
                ? `${d.unique_product_identifier as string} (${identifierTypeLabel})`
                : (d.unique_product_identifier as string)
            }
          />
        </dl>

        {/* Instructions and warnings */}
        {d.has_instructions_warnings === 'yes' &&
          Boolean(d.public_instructions_warnings) && (
            <>
              <SectionTitle>
                {t('toys.public.instructionsTitle', 'Instructions and warnings')}
              </SectionTitle>
              <p className="text-sm whitespace-pre-wrap">
                {tr('public_instructions_warnings')}
              </p>
            </>
          )}

        {/* Manufacturer responsibility */}
        <SectionTitle>{t('toyPublic.sections.manufacturer')}</SectionTitle>
        <dl>
          <Row
            label={t('toyPublic.rows.manufacturer')}
            value={d.manufacturer_legal_name as string}
          />
          <Row
            label={t('toyPublic.rows.address')}
            value={[
              d.manufacturer_street,
              d.manufacturer_postal_code,
              d.manufacturer_city,
              d.manufacturer_country,
            ]
              .filter(Boolean)
              .join(', ')}
          />
          <Row label={t('toyPublic.rows.email')} value={d.manufacturer_email as string} />
          <Row
            label={t('toyPublic.rows.website')}
            value={
              d.manufacturer_website ? (
                <a
                  href={String(d.manufacturer_website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  {d.manufacturer_website as string}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                ''
              )
            }
          />
          <Row
            label={t('toyPublic.rows.operatorIdentifier')}
            value={
              d.manufacturer_operator_id && d.manufacturer_operator_id_type
                ? `${d.manufacturer_operator_id as string} (${labelFor(TOY_OPERATOR_ID_TYPES, d.manufacturer_operator_id_type, t)})`
                : (d.manufacturer_operator_id as string)
            }
          />
        </dl>

        {/* EU operator information */}
        {(d.has_auth_rep === 'yes' || d.manufacturer_non_eu === 'yes') && (
          <>
            <SectionTitle>{t('toyPublic.sections.euOperator')}</SectionTitle>
            {d.has_auth_rep === 'yes' && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">
                  {t('toyPublic.subsections.authorisedRepresentative')}
                </h3>
                <dl>
                  <Row
                    label={t('toyPublic.rows.legalName')}
                    value={d.auth_rep_legal_name as string}
                  />
                  <Row
                    label={t('toyPublic.rows.address')}
                    value={[
                      d.auth_rep_street,
                      d.auth_rep_postal_code,
                      d.auth_rep_city,
                      d.auth_rep_country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <Row label={t('toyPublic.rows.email')} value={d.auth_rep_email as string} />
                  <Row
                    label={t('toyPublic.rows.operatorIdentifier')}
                    value={
                      d.auth_rep_operator_id &&
                      d.auth_rep_operator_id_type
                        ? `${d.auth_rep_operator_id as string} (${labelFor(TOY_OPERATOR_ID_TYPES, d.auth_rep_operator_id_type, t)})`
                        : (d.auth_rep_operator_id as string)
                    }
                  />
                </dl>
              </div>
            )}
            {d.manufacturer_non_eu === 'yes' && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {t('toyPublic.subsections.euResponsibleEconomicOperator')}
                </h3>
                <dl>
                  <Row
                    label={t('toyPublic.rows.legalName')}
                    value={d.eu_op_legal_name as string}
                  />
                  <Row
                    label={t('toyPublic.rows.role')}
                    value={labelFor(TOY_EU_OPERATOR_ROLES, d.eu_op_role, t)}
                  />
                  <Row
                    label={t('toyPublic.rows.address')}
                    value={[
                      d.eu_op_street,
                      d.eu_op_postal_code,
                      d.eu_op_city,
                      d.eu_op_country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <Row label={t('toyPublic.rows.email')} value={d.eu_op_email as string} />
                  <Row
                    label={t('toyPublic.rows.operatorIdentifier')}
                    value={
                      d.eu_op_operator_id && d.eu_op_operator_id_type
                        ? `${d.eu_op_operator_id as string} (${labelFor(TOY_OPERATOR_ID_TYPES, d.eu_op_operator_id_type, t)})`
                        : (d.eu_op_operator_id as string)
                    }
                  />
                </dl>
              </div>
            )}
          </>
        )}

        {/* Compliance */}
        <SectionTitle>{t('toyPublic.sections.compliance')}</SectionTitle>
        {(d.ce_declaration_ack || d.ce_marked) && (
          <p className="text-sm italic text-muted-foreground mb-3">
            {t(
              'toys.public.ceDeclarationStatement',
              'The manufacturer declares that this toy complies with the applicable EU safety requirements and bears or will bear the CE marking where required before being placed on the EU market.',
            )}
          </p>
        )}
        <dl>
          <Row
            label={t('toyPublic.rows.ceMarking')}
            value={
              d.ce_declaration_ack || d.ce_marked ? (
                <Badge variant="secondary">✓ {t('toyPublic.values.ceMarked')}</Badge>
              ) : (
                <span className="text-destructive">{t('toyPublic.values.notDeclared')}</span>
              )
            }
          />
          {d.eu_doc_available && (
            <Row
              label={t(
                'toys.public.docLabel',
                'EU Declaration of Conformity',
              )}
              value={
                <div className="space-y-0.5">
                  <div>
                    {t(
                      `toys.public.yesNoUnknown.${d.eu_doc_available as string}`,
                      String(d.eu_doc_available),
                    )}
                  </div>
                  {Boolean(d.eu_doc_reference) && (
                    <div className="text-xs text-muted-foreground">
                      {t('toys.public.docReference', 'Reference')}:{' '}
                      {d.eu_doc_reference as string}
                    </div>
                  )}
                </div>
              }
            />
          )}
          {d.safety_assessment_completed && (
            <Row
              label={t(
                'toys.public.safetyAssessmentLabel',
                'Safety assessment',
              )}
              value={t(
                `toys.public.yesNoUnknown.${d.safety_assessment_completed as string}`,
                String(d.safety_assessment_completed),
              )}
            />
          )}
          {d.technical_documentation_available && (
            <Row
              label={t(
                'toys.public.technicalDocsLabel',
                'Technical documentation',
              )}
              value={t(
                `toys.public.yesNoUnknown.${d.technical_documentation_available as string}`,
                String(d.technical_documentation_available),
              )}
            />
          )}
          <Row
            label={t('toyPublic.rows.applicableLegislation')}
            value={
              <ul className="list-disc ml-5 space-y-0.5">
                {labelsFor(TOY_LEGISLATION, d.applicable_legislation, t).map(
                  (l) => (
                    <li key={l}>{l}</li>
                  ),
                )}
              </ul>
            }
          />
          <Row
            label={t('toyPublic.rows.harmonisedStandards')}
            value={
              <ul className="list-disc ml-5 space-y-0.5">
                {labelsFor(TOY_STANDARDS, d.harmonised_standards, t).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            }
          />
          {Boolean(d.common_specifications) && (
            <Row
              label={t('toyPublic.rows.commonSpecifications')}
              value={
                <p className="whitespace-pre-wrap">
                  {tr('common_specifications')}
                </p>
              }
            />
          )}
          {Boolean(d.other_standards) && (
            <Row
              label={t('toyPublic.rows.otherStandards')}
              value={
                <p className="whitespace-pre-wrap">
                  {tr('other_standards')}
                </p>
              }
            />
          )}
          {d.notified_body_involved === 'yes' && (
            <Row
              label={t('toyPublic.rows.notifiedBody')}
              value={
                <div className="space-y-0.5">
                  {(d.notified_body_name as string) && (
                    <div>{d.notified_body_name as string}</div>
                  )}
                  {(d.notified_body_number as string) && (
                    <div className="text-xs text-muted-foreground">
                      {t('toyPublic.values.numberPrefix', { value: d.notified_body_number as string })}
                    </div>
                  )}
                  {(d.certificate_reference as string) && (
                    <div className="text-xs">
                      {t('toyPublic.values.certificatePrefix', { value: d.certificate_reference as string })}
                      {d.certificate_issue_date
                        ? t('toyPublic.values.issuedSuffix', { date: d.certificate_issue_date as string })
                        : ''}
                    </div>
                  )}
                  {(d.notified_body_certificate_url as string) && (
                    <div className="text-xs">
                      <a
                        href={d.notified_body_certificate_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center gap-1"
                      >
                        {t('toys.public.certificateDownload', 'Download conformity certificate')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              }
            />
          )}
          <Row
            label={t('toyPublic.rows.customsCode')}
            value={
              d.customs_code
                ? `${d.customs_code as string}${
                    d.cn_chapter
                      ? ` · ${labelFor(TOY_CN_CHAPTERS, d.cn_chapter, t)}`
                      : ''
                  }`
                : ''
            }
          />
        </dl>

        {/* Safety & chemical information */}
        <SectionTitle>{t('toyPublic.sections.safetyChemical')}</SectionTitle>
        <div className="space-y-3 text-sm">
          <p>
            {tr('allergen_declaration_text') ||
              t('toyPublic.values.noFragrancesDeclared')}
          </p>
          {fragrances.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2">{t('toyPublic.table.substance')}</th>
                    <th className="text-left p-2">{t('toyPublic.table.cas')}</th>
                    <th className="text-left p-2">{t('toyPublic.table.concentration')}</th>
                    <th className="text-left p-2">{t('toyPublic.table.component')}</th>
                  </tr>
                </thead>
                <tbody>
                  {fragrances.map((f) => (
                    <tr key={f.id} className="border-t">
                      <td className="p-2 font-medium">{f.name}</td>
                      <td className="p-2 text-muted-foreground">{f.cas}</td>
                      <td className="p-2">
                        {f.concentration_mg_kg !== undefined &&
                        f.concentration_mg_kg !== ''
                          ? `${f.concentration_mg_kg} mg/kg`
                          : '—'}
                      </td>
                      <td className="p-2">{f.component || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold mt-4 mb-1">
              {t('toyPublic.subsections.safetyIncidentReporting')}
            </h3>
            <ul className="space-y-1 text-sm">
              {labelsFor(TOY_SAFETY_CHANNELS, d.safety_channels, t).map((c) => (
                <li key={c}>· {c}</li>
              ))}
              {Boolean(d.safety_phone) && (
                <li>
                  {t('toyPublic.safety.telephone')}:{' '}
                  <a
                    href={`tel:${d.safety_phone as string}`}
                    className="text-primary underline"
                  >
                    {d.safety_phone as string}
                  </a>
                </li>
              )}
              {Boolean(d.safety_email) && (
                <li>
                  {t('toyPublic.safety.email')}:{' '}
                  <a
                    href={`mailto:${d.safety_email as string}`}
                    className="text-primary underline"
                  >
                    {d.safety_email as string}
                  </a>
                </li>
              )}
              {Boolean(d.safety_website) && (
                <li>
                  {t('toyPublic.safety.web')}:{' '}
                  <a
                    href={d.safety_website as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {d.safety_website as string}
                  </a>
                </li>
              )}
              <li>
                {t('toyPublic.safety.safetyGatePortal')}:{' '}
                <a
                  href="https://ec.europa.eu/safety-gate-alerts/screen/webReport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {t('toyPublic.safety.reportUnsafe')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DPP infrastructure */}
        <SectionTitle>{t('toyPublic.sections.dppInfrastructure')}</SectionTitle>
        <dl>
          <Row
            label={t('toyPublic.rows.dppServiceProvider')}
            value={config?.company_name || 'Open-Label.eu'}
          />
          <Row
            label={t('toyPublic.rows.backupCopyReference')}
            value={
              config?.site_url
                ? t('toyPublic.values.mirroredAt', { url: config.site_url })
                : t('toyPublic.values.mirroredOnOpenLabel')
            }
          />
          <Row label={t('toyPublic.rows.dppVersion')} value="1.0" />
          <Row
            label={t('toyPublic.rows.lastUpdated')}
            value={new Date(passport.updated_at).toLocaleDateString(displayLanguage)}
          />
          <Row
            label={t('toyPublic.rows.status')}
            value={<Badge variant="secondary">{t('toyPublic.values.published')}</Badge>}
          />
        </dl>

        <Separator className="my-8" />

        {/* Powered by — mandatory attribution */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            {t('toyPublic.poweredBy')}{' '}
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
