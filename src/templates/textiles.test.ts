import { describe, it, expect } from 'vitest';
import { TextilesTemplate, textilesTemplate } from './textiles';

describe('TextilesTemplate', () => {
  it('has correct properties', () => {
    expect(textilesTemplate.id).toBe('textiles');
    expect(textilesTemplate.name).toBe('Apparel');
    expect(textilesTemplate.icon).toBe('👕');
  });

  describe('primary_fiber options', () => {
    const options =
      textilesTemplate.sections
        .flatMap((s) => s.questions)
        .find((q) => q.id === 'primary_fiber')?.options ?? [];

    it('uses official EU fibre names without brand or US trade names', () => {
      expect(options.length).toBeGreaterThan(0);
      for (const o of options) {
        for (const brand of ['Rayon', 'Tencel', 'Spandex', 'Nylon']) {
          expect(o.label).not.toContain(brand);
        }
      }
    });

    it('does not offer leather (not a textile fibre)', () => {
      expect(options.map((o) => o.value)).not.toContain('leather');
    });

    it('lists modal and cashmere as distinct fibres', () => {
      const values = options.map((o) => o.value);
      expect(values).toContain('modal');
      expect(values).toContain('cashmere');
    });

    it('keeps legacy values stable while relabelling to EU names', () => {
      expect(options.find((o) => o.value === 'nylon')?.label).toBe('Polyamide');
      expect(options.find((o) => o.value === 'viscose')?.label).toBe('Viscose');
      expect(options.find((o) => o.value === 'lyocell')?.label).toBe('Lyocell');
      expect(options.find((o) => o.value === 'elastane')?.label).toBe('Elastane');
      expect(options.find((o) => o.value === 'linen')?.label).toBe('Linen (Flax)');
    });

    it('has unique option values', () => {
      const values = options.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
    });
  });

  it('is an instance of TextilesTemplate', () => {
    expect(textilesTemplate).toBeInstanceOf(TextilesTemplate);
  });

  it('has 11 sections covering the full garment passport', () => {
    expect(textilesTemplate.sections).toHaveLength(11);
    expect(textilesTemplate.sections.map((s) => s.id)).toEqual([
      'identity',
      'responsible_operators',
      'materials',
      'certifications',
      'supply_chain',
      'environment',
      'durability',
      'circularity',
      'disposition',
      'green_claims',
      'authentication',
    ]);
  });

  describe('responsible operators', () => {
    const allQuestions = textilesTemplate.sections.flatMap((s) => s.questions);
    const find = (id: string) => allQuestions.filter((q) => q.id === id);

    it('no longer has a passport expiry date', () => {
      expect(allQuestions.map((q) => q.id)).not.toContain('passport_valid_until');
    });

    it('keeps the EU responsible person ids exactly once', () => {
      expect(find('eu_operator_name')).toHaveLength(1);
      expect(find('eu_operator_address')).toHaveLength(1);
    });

    it('requires a manufacturer email and an EU responsible person email', () => {
      expect(find('manufacturer_email')[0]?.required).toBe(true);
      expect(find('eu_operator_email')[0]?.required).toBe(true);
    });

    it('shows importer fields only for a non-EU manufacturer and does not require them', () => {
      const importerIds = [
        'importer_legal_name',
        'importer_street',
        'importer_postal_code',
        'importer_city',
        'importer_country',
        'importer_email',
      ];
      for (const id of importerIds) {
        const q = find(id)[0];
        expect(q).toBeDefined();
        expect(q!.showWhen).toEqual({ field: 'manufacturer_non_eu', equals: 'yes' });
        expect(q!.required).toBeFalsy();
      }
      expect(find('manufacturer_non_eu')[0]?.required).toBe(true);
    });
  });

  describe('non-textile parts of animal origin', () => {
    const allQuestions = textilesTemplate.sections.flatMap((s) => s.questions);

    it('declares animal parts with conditional details', () => {
      expect(allQuestions.find((q) => q.id === 'contains_animal_parts')?.type).toBe('checkbox');
      expect(
        allQuestions.find((q) => q.id === 'animal_parts_details')?.showWhen,
      ).toEqual({ field: 'contains_animal_parts', equals: true });
    });
  });

  describe('destruction reason codes', () => {
    const question = textilesTemplate.sections
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'disposition_reason_code')!;
    const values = (question.options ?? []).map((o) => o.value);

    it('drops the codes the Commission did not publish', () => {
      expect(values).not.toContain('other');
      expect(values).not.toContain('returned_unsellable');
    });

    it('offers the published codes', () => {
      expect(values).toEqual(
        expect.arrayContaining([
          'health_safety',
          'counterfeit_ip',
          'damaged_beyond_repair',
          'donation_refused',
          'protected_logo',
          'unlawful_product',
        ]),
      );
    });

    it('warns only when no reason has been chosen', () => {
      expect(question.warnWhen?.equals).toEqual([undefined, '']);
    });
  });

  it('has no duplicate question IDs', () => {
    const ids = textilesTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number', 'multi_select', 'file'];
    for (const s of textilesTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of textilesTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select' || q.type === 'multi_select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('has an advanced-mode toggle gating detailed fields', () => {
    const identity = textilesTemplate.sections[0];
    expect(identity.questions[0].id).toBe('show_advanced_fields');
    const gated = textilesTemplate.sections.flatMap((s) =>
      s.questions.filter((q) => q.showWhen?.field === 'show_advanced_fields'),
    );
    expect(gated.length).toBeGreaterThan(10);
  });

  it('does not keep the old subjective durability score field', () => {
    const ids = textilesTemplate.sections.flatMap((s) => s.questions.map((q) => q.id));
    expect(ids).not.toContain('durability_score');
  });

  it('marks uploaded evidence files as internal only', () => {
    const files = textilesTemplate.sections.flatMap((s) =>
      s.questions.filter((q) => q.type === 'file'),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      expect(f.internal).toBe(true);
    }
  });

  it('getRequiredLogos requires a certificate reference for certification logos', () => {
    expect(textilesTemplate.getRequiredLogos!({})).toEqual([]);
    expect(
      textilesTemplate.getRequiredLogos!({ certifications_held: ['gots'] }),
    ).toEqual([]);
    expect(
      textilesTemplate.getRequiredLogos!({
        certifications_held: ['gots'],
        certificate_references: 'GOTS — CU 123456',
      }),
    ).toContain('gots');
  });

  it('getRequiredLogos returns all logos when all certifications are referenced', () => {
    const logos = textilesTemplate.getRequiredLogos!({
      certifications_held: ['gots', 'oeko_tex', 'grs', 'bluesign', 'fair_trade'],
      certificate_references: 'references on file',
      made_in_eu: true,
    });
    expect(logos).toEqual([
      'gots',
      'oeko-tex',
      'grs',
      'bluesign',
      'fair-trade',
      'made-in-eu',
    ]);
  });

  describe('getInlineWarnings', () => {
    const fieldIds = (data: Record<string, unknown>) =>
      textilesTemplate.getInlineWarnings(data).map((w) => w.fieldId);

    it('returns nothing for empty or clean data', () => {
      expect(textilesTemplate.getInlineWarnings({})).toEqual([]);
      expect(
        textilesTemplate.getInlineWarnings({
          primary_fiber: 'cotton',
          primary_fiber_percentage: 100,
        }),
      ).toEqual([]);
      expect(
        textilesTemplate.getInlineWarnings({
          primary_fiber: 'cotton',
          primary_fiber_percentage: 80,
          secondary_fiber_percentage: 20,
        }),
      ).toEqual([]);
    });

    it('flags percentages above 100', () => {
      const warnings = textilesTemplate.getInlineWarnings({
        primary_fiber_percentage: 80,
        secondary_fiber_percentage: 30,
      });
      const warning = warnings.find(
        (w) => w.fieldId === 'secondary_fiber_percentage',
      );
      expect(warning?.messageKey).toBe('textiles.warnings.compositionExceeds100');
      expect(warning?.params).toEqual({ primary: 80, secondary: 30, sum: 110 });
      expect(warning?.message).toContain('110%');
    });

    it('flags a primary percentage above 100 on its own without "undefined"', () => {
      const warnings = textilesTemplate.getInlineWarnings({
        primary_fiber_percentage: 120,
      });
      const warning = warnings.find(
        (w) => w.messageKey === 'textiles.warnings.primaryExceeds100',
      );
      expect(warning).toBeDefined();
      expect(warning!.fieldId).toBe('primary_fiber_percentage');
      expect(warning!.params).toEqual({ primary: 120 });
      for (const w of warnings) {
        expect(w.message).not.toContain('undefined');
        expect(JSON.stringify(w.params ?? {})).not.toContain('undefined');
      }
      expect(
        warnings.some(
          (w) => w.messageKey === 'textiles.warnings.compositionExceeds100',
        ),
      ).toBe(false);
    });

    it('flags an incomplete single-fibre declaration', () => {
      const warnings = textilesTemplate.getInlineWarnings({
        primary_fiber_percentage: 60,
      });
      expect(fieldIds({ primary_fiber_percentage: 60 })).toContain(
        'primary_fiber_percentage',
      );
      const warning = warnings.find(
        (w) => w.messageKey === 'textiles.warnings.incompleteSingleFibre',
      );
      expect(warning?.params).toEqual({ primary: 60 });
    });

    it('flags a garment that is more than 50% synthetic', () => {
      const warnings = textilesTemplate.getInlineWarnings({
        primary_fiber: 'polyester',
        primary_fiber_percentage: 60,
      });
      const warning = warnings.find((w) => w.fieldId === 'microplastic_shedding');
      expect(warning).toBeDefined();
      expect(warning!.messageKey).toBe('textiles.warnings.syntheticOver50');
      expect(warning!.params).toEqual({ percentage: 60 });
      expect(warning!.message).toContain('60%');
    });

    it('does not flag exactly 50% synthetic', () => {
      expect(
        fieldIds({
          primary_fiber: 'polyester',
          primary_fiber_percentage: 50,
          secondary_fiber: 'Cotton',
          secondary_fiber_percentage: 50,
        }),
      ).not.toContain('microplastic_shedding');
    });

    it('does not treat viscose as a synthetic', () => {
      expect(
        fieldIds({
          primary_fiber: 'viscose',
          primary_fiber_percentage: 60,
          secondary_fiber: 'Cotton',
          secondary_fiber_percentage: 40,
        }),
      ).not.toContain('microplastic_shedding');
    });

    it('counts a synthetic secondary fibre given as free text', () => {
      expect(
        fieldIds({
          primary_fiber: 'cotton',
          primary_fiber_percentage: 45,
          secondary_fiber: 'Polyester',
          secondary_fiber_percentage: 55,
        }),
      ).toContain('microplastic_shedding');
    });
  });

  describe('France-mandatory fields and PFAS', () => {
    const allQuestions = textilesTemplate.sections.flatMap((s) => s.questions);
    const find = (id: string) => allQuestions.find((q) => q.id === id);

    it('always shows the stage countries and the SVHC declaration', () => {
      for (const id of [
        'country_spinning_weaving',
        'country_dyeing_finishing',
        'svhc_declared',
      ]) {
        expect(find(id)).toBeDefined();
        expect(find(id)!.showWhen).toBeUndefined();
      }
    });

    it('declares PFAS with conditional details', () => {
      const pfas = find('pfas_present');
      expect(pfas?.type).toBe('select');
      expect((pfas?.options ?? []).map((o) => o.value)).toEqual([
        'yes',
        'no',
        'unknown',
      ]);
      expect(pfas?.warnWhen?.equals).toEqual(['yes', 'unknown']);
      expect(find('pfas_details')?.showWhen).toEqual({
        field: 'pfas_present',
        equals: 'yes',
      });
    });
  });
});
