
## Demo passports (done)
- [x] Sample registry src/data/samples (wine, toys, textiles)
- [x] Extract GenericPublicPassport + PublicPassportView dispatcher
- [x] /demo and /demo/:category page, tracking-exempt
- [x] Wire entry points (landing, sitemap, llms.txt, TESTING.md)
- [x] samples.test.ts + samples.render.test.tsx self-maintaining tests
- [x] Toy sample: customs_code -> 95030041 (cn_chapter kept at '95', it is a
      required template question; removing it fails sample test (b))

## Apparel translations (blocked)
- [ ] Translate textiles.* into nl, pl, pt, ro, sk, sl, sv, zh-CN
      Blocked: AI translation credits exhausted. Debt marker
      PENDING_TRANSLATION_PREFIXES = ['textiles.'] stays until then.
