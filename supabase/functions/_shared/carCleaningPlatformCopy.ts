export const CAR_CLEANING_NOTICE_COPY = {
  noticeTitle: 'Chemical safety and DPP preparation',
  noticeBody: 'Regulation (EU) 2026/405 applies from 23 September 2029; until then Regulation (EC) No 648/2004, CLP, REACH and biocide rules apply unchanged, and the physical label remains mandatory. This record prepares the future passport. It is not a certification, an approval or a complete regulatory DPP, and entries are not verified by Open Label.',
  publicNotice: 'This page gives product information published by the supplier. It is not the EU digital product passport required from 2029 under Regulation (EU) 2026/405 and does not replace the label on the packaging.',
} as const;

/** Preserve existing structured export metadata independently of UI notice keys. */
export const CAR_CLEANING_REGULATORY_LIMITATIONS = 'Future DPP limits: this service does not provide the EU registry connection, verified persistent identifiers, independent backup, guaranteed regulatory retention, verified authority credentials or independent business-continuity guarantees. Technical specifications and access rights depend on implementing measures. Supplier entries are not independently verified. ESPR requirements apply only where an applicable product measure requires them.';

export const CAR_CLEANING_CARRIER_COPY = {
  title: 'Product data carrier',
  scan: 'Scan for more product information',
  download: 'Download carrier (SVG)',
  structuredData: 'Open structured product data (JSON)',
  invalidUrl: 'Save this passport and configure a public HTTPS site URL before creating its carrier.',
  physicalLabel: 'This carrier does not replace the physical label. The supplier must verify the required label information and the final carrier placement on packaging, bulk documents or the refill station, as applicable, and visibility before purchase, including online.',
  verification: 'Test the final printed carrier on the actual material and at its final size with several devices. Keep the white border clear, check contrast and durability, and verify that both the public page and structured data resolve without registration. Downloading this file does not confirm these checks or registration in an EU registry.',
} as const;

export const CAR_CLEANING_HISTORY_COPY = {
  title: 'Passport version history', latest: 'Latest version', version: 'Version', recorded: 'Recorded at',
  retainedUntil: 'Stored retention floor', identifier: 'Platform record identifier',
  identifierHelp: 'This platform identifier preserves the record link. It is not a verified regulatory product identifier or registry registration.',
  retentionHelp: 'The archive prevents ordinary edits or deletion of saved versions and never shortens its retention floor. Actual service availability, external documents and independent backup require an operational agreement.',
  withdrawn: 'The owner has withdrawn this dashboard record. Its public information and history remain available for retention.',
  withdrawalNotice: 'Removing this car cleaning record withdraws it from your dashboard. Its public passport and saved versions remain accessible for retention. Do not use this action to erase confidential or incorrect information.',
  more: 'Earlier versions', restore: 'Retained car cleaning passports',
};
