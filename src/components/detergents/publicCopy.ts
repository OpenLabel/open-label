/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

/**
 * English text of the Detergents public passport page. The translation keys
 * are `detergentsPublic.<name>`; the component uses these strings as the
 * defaults and the locale seed script reads them, so the two cannot drift.
 */
export const DETERGENTS_PUBLIC_COPY = {
  headerBadge: 'Detergents: Digital Product Passport',
  notice:
    'This page gives product information published by the supplier. It is not a certification or an approval, and it does not replace the label on the packaging.',
  units: 'units',
  ecolabelBadge: 'EU Ecolabel',
  'sections.product': 'Product',
  'sections.hazard': 'Hazard and safety',
  'sections.use': 'Use and dosage',
  'sections.ingredients': 'Ingredients',
  'sections.environment': 'Environment and packaging',
  'sections.biocide': 'Biocidal product',
  'sections.responsible': 'Who is responsible',
  'sections.annexVi': 'Annex VI dataset',
  'sections.metadata': 'DPP infrastructure',
  'subsections.manufacturer': 'Manufacturer',
  'subsections.importer': 'Importer',
  'subsections.authorisedRepresentative': 'EU authorised representative',
  'rows.constituentClasses': 'Constituent classes above 0.2% by weight',
  'rows.ecolabel': 'EU Ecolabel',
  'rows.licenceNumber': 'Licence number',
  'rows.name': 'Name',
  'rows.address': 'Address',
  'rows.email': 'Email',
  'rows.phone': 'Telephone',
  'rows.dppServiceProvider': 'DPP service provider',
  'rows.dppVersion': 'DPP version',
  'rows.lastUpdated': 'Last updated',
  'rows.status': 'Status',
  'values.published': 'Published',
} as const;

export type DetergentsPublicCopyKey = keyof typeof DETERGENTS_PUBLIC_COPY;
