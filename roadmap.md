
## Demo passports (done)
- [x] Sample registry src/data/samples (wine, toys, textiles)
- [x] Extract GenericPublicPassport + PublicPassportView dispatcher
- [x] /demo and /demo/:category page, tracking-exempt
- [x] Wire entry points (landing, sitemap, llms.txt, TESTING.md)
- [x] samples.test.ts + samples.render.test.tsx self-maintaining tests
- [x] Toy sample: customs_code -> 95030041 (cn_chapter kept at '95', it is a
      required template question; removing it fails sample test (b))

## Apparel translations (done)
- [x] Translate textiles.* into all supported locales; debt marker empty and audit passing.


## Client QA follow-up
- [x] Translate scanner text and shared upload labels, correct warning wording
- [x] Gate Apparel public and preview fields with template conditions
- [x] Add regression coverage and run full suite: 1,889 passed, 0 failed, 0 skipped

## Car cleaning audience notices
- [x] Shorten public and supplier notices, translate all 25 locales, document service limits
- [x] Verify all locale audits, full suite (1,893 passed, 0 failed) and car cleaning demo on desktop/mobile; persisted status pass
