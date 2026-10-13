/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

/**
 * Reviewed allowlist of (locale, key) pairs whose translated value is
 * legitimately byte-identical to English.
 *
 * Rules:
 * - Exact locale + key pairs only. No prefix or value wildcards, so a new
 *   untranslated string elsewhere (even in the same subtree) is still caught.
 * - An entry only exempts the pair while the value still equals English; the
 *   audit consults this list only after detecting an identical value.
 * - Generated from the audit's real failures (marker temporarily cleared) on
 *   2026-10-01 and reviewed by category below.
 */

/**
 * Protected names: certification schemes, standards, methodologies and
 * identifier systems. These are registered or official names (GOTS, OEKO-TEX,
 * GRS, bluesign®, Fair Trade, ISO 14040/14044, ISO 14067, Higg MSI, GHG
 * Protocol, PEFCR, GTIN / EAN) that must not be translated.
 */
const PROTECTED_TERMS: Record<string, readonly string[]> = {
  'bg': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'cs': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'da': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.pefcr_apparel_footwear', // "PEFCR Apparel & Footwear"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'de': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'el': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'es': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'et': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'fi': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'fr': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'ga': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'hr': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'hu': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'it': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'lt': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'lv': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'mt': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'nl': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'pl': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'pt': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'ro': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'sk': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'sl': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'sv': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.grs', // "GRS (Global Recycled Standard)"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.ghg_protocol', // "GHG Protocol Product Standard"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
  ],
  'zh-CN': [
    'textiles.fields.gtin.label', // "GTIN / EAN"
    'textiles.options.certificationsHeld.oeko_tex', // "OEKO-TEX Standard 100"
    'textiles.options.certificationsHeld.bluesign', // "bluesign\u00ae"
    'textiles.options.certificationsHeld.fair_trade', // "Fair Trade"
    'textiles.options.footprintMethod.iso_14040_44', // "ISO 14040/14044 LCA"
    'textiles.options.footprintMethod.higg_msi', // "Higg MSI"
    'textiles.options.footprintMethod.iso_14067', // "ISO 14067"
  ],
};

/**
 * Technical notation: temperatures (30°C ...), URL / date format and example
 * scheme-code placeholders that are language-neutral.
 */
const TECHNICAL_NOTATION: Record<string, readonly string[]> = {
  'bg': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'cs': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'da': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'de': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'el': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'es': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'et': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'fi': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'fr': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'ga': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'hr': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'hu': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'it': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'lt': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'lv': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'mt': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'nl': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'pl': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'pt': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'ro': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'sk': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'sl': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'sv': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.disposition_date.placeholder', // "YYYY-MM-DD"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
  'zh-CN': [
    'textiles.fields.repair_booking_url.placeholder', // "https://\u2026"
    'textiles.fields.take_back_scheme_epr.placeholder', // "FR: Refashion \u2014 FR123456_01ABCD DE: \u2026"
    'textiles.fields.authentication_verification_url.placeholder', // "https://\u2026"
    'textiles.options.washingTemp.30', // "30\u00b0C"
    'textiles.options.washingTemp.40', // "40\u00b0C"
    'textiles.options.washingTemp.60', // "60\u00b0C"
    'textiles.options.washingTemp.95', // "95\u00b0C"
  ],
};

/**
 * Genuine cognates: the correct word in that language is spelled exactly as in
 * English (e.g. fr "Viscose", de "Modal", "Polyester", "Status", fr
 * "Certifications", pl "Importer"). Fibre names follow the per-language names
 * of Regulation (EU) No 1007/2011 Annex I.
 */
const COGNATES: Record<string, readonly string[]> = {
  'da': [
    'garmentPublic.rows.status', // "Status"
  ],
  'de': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.lyocell', // "Lyocell"
    'textiles.options.primaryFiber.cupro', // "Cupro"
    'textiles.options.primaryFiber.polyester', // "Polyester"
  ],
  'fr': [
    'textiles.sections.certifications.title', // "Certifications"
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.viscose', // "Viscose"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.lyocell', // "Lyocell"
    'textiles.options.primaryFiber.cupro', // "Cupro"
    'textiles.options.primaryFiber.polyester', // "Polyester"
    'textiles.options.primaryFiber.nylon', // "Polyamide"
    'textiles.options.dispositionReason.contamination', // "Contamination"
    'garmentPublic.sections.substances', // "Substances"
    'garmentPublic.composition', // "Composition"
  ],
  'hr': [
    'garmentPublic.rows.status', // "Status"
  ],
  'lt': [
    'textiles.options.primaryFiber.angora', // "Angora"
  ],
  'mt': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'garmentPublic.rows.status', // "Status"
  ],
  'nl': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.alpaca', // "Alpaca"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.viscose', // "Viscose"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.lyocell', // "Lyocell"
    'textiles.options.primaryFiber.cupro', // "Cupro"
    'textiles.options.primaryFiber.polyester', // "Polyester"
    'textiles.options.primaryFiber.nylon', // "Polyamide"
    'garmentPublic.rows.status', // "Status"
  ],
  'pl': [
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'garmentPublic.subsections.importer', // "Importer"
    'garmentPublic.rows.status', // "Status"
  ],
  'pt': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.alpaca', // "Alpaca"
    'textiles.options.primaryFiber.viscose', // "Viscose"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.cupro', // "Cupro"
  ],
  'ro': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.alpaca', // "Alpaca"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.cupro', // "Cupro"
  ],
  'sk': [
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.polyester', // "Polyester"
  ],
  'sl': [
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
  ],
  'sv': [
    'textiles.options.primaryFiber.mohair', // "Mohair"
    'textiles.options.primaryFiber.angora', // "Angora"
    'textiles.options.primaryFiber.modal', // "Modal"
    'textiles.options.primaryFiber.lyocell', // "Lyocell"
    'textiles.options.primaryFiber.polyester', // "Polyester"
  ],
};

/**
 * Detergents (2026-10-13): identifier system names (GTIN / EAN) that must not be translated.
 */
const DETERGENTS_PROTECTED_TERMS: Record<string, readonly string[]> = {
  'bg': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'cs': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'da': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'de': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'el': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'es': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'et': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'fi': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'fr': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'ga': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'hr': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'hu': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'it': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'lt': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'lv': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'mt': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'nl': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'pl': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'pt': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'ro': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'sk': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'sl': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'sv': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
  'zh-CN': [
    'detergents.fields.gtin.label', // "GTIN / EAN"
  ],
};

/**
 * Detergents (2026-10-13): technical notation kept verbatim: ISO date format YYYY-MM-DD, resin codes HDPE (02) / PET (01) / PP (05), the country-code EPR example "FR: ... / DE: ...", the GHS05 pictogram code with its official French name, and the French unit name "Millilitres".
 */
const DETERGENTS_TECHNICAL_NOTATION: Record<string, readonly string[]> = {
  'bg': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'cs': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'da': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'de': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'el': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'es': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'et': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'fi': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'fr': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.pictograms.ghs05', // "GHS05 Corrosion"
    'detergents.options.dosageUnit.ml', // "Millilitres"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'ga': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'hr': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'hu': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'it': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'lt': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'lv': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'mt': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'nl': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'pl': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'pt': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'ro': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'sk': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'sl': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'sv': [
    'detergents.fields.sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.fields.data_review_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.last_placed_on_market_date.placeholder', // "YYYY-MM-DD"
    'detergents.fields.annex_sds_revision_date.placeholder', // "YYYY-MM-DD"
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
  'zh-CN': [
    'detergents.fields.epr_registration.placeholder', // "FR: ...\nDE: ..."
    'detergents.options.packagingMaterial.hdpe', // "HDPE (02)"
    'detergents.options.packagingMaterial.pet', // "PET (01)"
    'detergents.options.packagingMaterial.pp', // "PP (05)"
  ],
};

/**
 * Detergents (2026-10-13): words spelled identically in the target language (Gel, Spray, Tablet, Paste, Metal, Perfumes, and French Danger, Phosphates, Phosphonates, Polycarboxylates, Enzymes, Applicable).
 */
const DETERGENTS_COGNATES: Record<string, readonly string[]> = {
  'cs': [
    'detergents.options.productForm.gel', // "Gel"
  ],
  'da': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.tablet', // "Tablet"
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.packagingMaterial.metal', // "Metal"
  ],
  'de': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.productForm.paste', // "Paste"
  ],
  'es': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.listedConstituent.perfumes', // "Perfumes"
    'detergents.options.packagingMaterial.metal', // "Metal"
  ],
  'fr': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.signalWord.danger', // "Danger"
    'detergents.options.constituentClass.phosphates', // "Phosphates"
    'detergents.options.constituentClass.phosphonates', // "Phosphonates"
    'detergents.options.constituentClass.polycarboxylates', // "Polycarboxylates"
    'detergents.options.listedConstituent.enzymes', // "Enzymes"
    'detergents.options.commodityCodeStatus.applicable', // "Applicable"
  ],
  'hr': [
    'detergents.options.productForm.gel', // "Gel"
  ],
  'hu': [
    'detergents.options.productForm.spray', // "Spray"
  ],
  'it': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.spray', // "Spray"
  ],
  'nl': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.tablet', // "Tablet"
    'detergents.options.productForm.spray', // "Spray"
  ],
  'pl': [
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.packagingMaterial.metal', // "Metal"
  ],
  'pt': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.listedConstituent.perfumes', // "Perfumes"
    'detergents.options.packagingMaterial.metal', // "Metal"
  ],
  'ro': [
    'detergents.options.productForm.gel', // "Gel"
    'detergents.options.productForm.spray', // "Spray"
    'detergents.options.packagingMaterial.metal', // "Metal"
  ],
  'sl': [
    'detergents.options.productForm.gel', // "Gel"
  ],
  'sv': [
    'detergents.options.productForm.gel', // "Gel"
  ],
};

/**
 * Detergents public page (2026-10-13): words spelled identically in the target
 * language (Status, Name, Product, Importer, DPP version).
 */
const DETERGENTS_PUBLIC_COGNATES: Record<string, readonly string[]> = {
  'da': [
    'detergentsPublic.rows.status', // "Status"
  ],
  'de': [
    'detergentsPublic.rows.name', // "Name"
  ],
  'hr': [
    'detergentsPublic.rows.status', // "Status"
  ],
  'mt': [
    'detergentsPublic.rows.status', // "Status"
  ],
  'nl': [
    'detergentsPublic.sections.product', // "Product"
    'detergentsPublic.rows.status', // "Status"
  ],
  'pl': [
    'detergentsPublic.subsections.importer', // "Importer"
    'detergentsPublic.rows.status', // "Status"
  ],
  'sl': [
    'detergentsPublic.rows.status', // "Status"
  ],
  'sv': [
    'detergentsPublic.rows.dppVersion', // "DPP version"
  ],
};

const ALLOWED = new Set<string>(
  [
    PROTECTED_TERMS,
    TECHNICAL_NOTATION,
    COGNATES,
    DETERGENTS_PROTECTED_TERMS,
    DETERGENTS_TECHNICAL_NOTATION,
    DETERGENTS_COGNATES,
    DETERGENTS_PUBLIC_COGNATES,
  ].flatMap((group) =>
    Object.entries(group).flatMap(([locale, keys]) => keys.map((k) => `${locale}::${k}`)),
  ),
);

/** True when this exact locale + key pair was reviewed as legitimately identical to English. */
export function isAllowlistedIdentical(locale: string, key: string): boolean {
  return ALLOWED.has(`${locale}::${key}`);
}

/** Number of reviewed pairs (asserted by tests so the list cannot silently grow). */
export const TRANSLATION_ALLOWLIST_SIZE = ALLOWED.size;
