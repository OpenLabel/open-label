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

  it('getCompositionWarning flags percentages above 100', () => {
    const warning = textilesTemplate.getCompositionWarning({
      primary_fiber_percentage: 80,
      secondary_fiber_percentage: 30,
    });
    expect(warning?.fieldId).toBe('secondary_fiber_percentage');
    expect(warning?.message).toContain('110%');
  });

  it('getCompositionWarning flags an incomplete single-fibre declaration', () => {
    const warning = textilesTemplate.getCompositionWarning({
      primary_fiber_percentage: 60,
    });
    expect(warning?.fieldId).toBe('primary_fiber_percentage');
  });

  it('getCompositionWarning stays silent for valid or empty data', () => {
    expect(textilesTemplate.getCompositionWarning({})).toBeNull();
    expect(
      textilesTemplate.getCompositionWarning({ primary_fiber_percentage: 100 }),
    ).toBeNull();
    expect(
      textilesTemplate.getCompositionWarning({
        primary_fiber_percentage: 80,
        secondary_fiber_percentage: 20,
      }),
    ).toBeNull();
  });
});
