## Fix the 3 failing tests

**1. `src/components/TranslationButton.test.ts`** — update assertions for 25 languages incl. BCP-47:
- `toHaveLength(24)` → `toHaveLength(25)`
- Regex `/^[a-z]{2}$/` → `/^[a-z]{2}(-[A-Z]{2})?$/` (allow `zh-CN`)

**2. `src/components/wine/WinePublicPassport.render.test.tsx`** — the "falls back to passport name if no product_name" test contradicts the intentional design (per project memory: internal "DPP Name" must never be shown publicly; `WinePublicPassport.tsx:79` explicitly states "never fall back to passport.name").
- Replace that test with one that asserts the public name is **empty** when no `product_name` is set (regression guard preventing accidental leak of internal DPP name).

No production code changes. Re-run vitest to confirm 0 failures.