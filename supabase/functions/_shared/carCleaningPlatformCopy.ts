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
