## Add "Toys" category to the DPP maker (simplified)

You're right — most of what I proposed can be collapsed. Here's the leaner version.

### Field types: only ONE new type

Keep the existing 5 (`text`, `textarea`, `select`, `checkbox`, `number`) and add **just one** new type:

- **`multi_select`** — needed for: Applicable EU legislation, Harmonised standards, Safety reporting channel types, Allergenic fragrance picker. No clean way to fake this with existing types without a bad UX.

Everything else maps to existing types:

| Spec asks for | We use |
|---|---|
| email | `text` + `placeholder="name@company.com"` + helper text |
| URL | `text` + `placeholder="https://..."` |
| phone | `text` + `placeholder="+33 ..."` |
| date | `text` + `placeholder="YYYY-MM-DD"` |
| yes/no | `select` with two options `yes` / `no` |
| yes/no/unknown | `select` with three options |
| structured address | 4 separate `text` questions (street, city, postal, country) inside one section |
| repeatable text (other standards) | one `textarea`, "one entry per line" |
| file upload (certificates, supplier decl., test reports) | dropped for v1 — booleans via `checkbox` instead, with helper text "file upload coming soon" |

### Two small additions to `TemplateQuestion`

Both purely additive, both default to "no behavior change":

- `showWhen?: { field: string; equals: string | string[] }` — conditional reveal. Used by gated sections (auth rep, EU operator, notified body) and gated fields (phone shown only when "telephone" is picked in safety channels). Without it we'd need 5+ duplicated yes_no branches in code.
- `badge?: 'required' | 'where_applicable' | 'tbd'` — small label next to the field name. The spec explicitly asks for these badges. Cheap to add.

That's the entire engine change: 1 new type + 2 optional fields.

### Customs code helper

Auto-fill `customs_code` from chosen CN chapter (`9880` + chapter + `00`) using a small `useEffect` in `CategoryQuestions` when `category === 'toys'`. No new type needed; it's just a controlled `text` field the parent updates.

### Allergenic fragrance picker

Still needs a custom component because each picked fragrance has 5 sub-fields. Render it inline in `CategoryQuestions` when it sees `question.id === 'allergenic_fragrances'` and `category === 'toys'`. The picker itself is a searchable dialog (mirroring `IngredientPickerDialog`), data in `src/data/toyFragrances.ts` seeded from spec lines 390–460. No new generic type — just a special-cased component.

### Reordered toys form (more natural flow for the user)

1. **Compliance disclaimer banner** (TBD warning + per-SKU note).
2. **Product identity** — name (top-level passport field), brand, model, SKU, toy category (with "Other" free-text), age group (with "Other" free-text), unique identifier + identifier type, description (top-level field), image (top-level upload). Putting identity first matches what the user sees on the product.
3. **Manufacturer** — legal name, structured address (4 fields), email, website, operator id + type.
4. **EU operator information** (collapsible-feel via `showWhen`):
   - yes/no "Manufacturer based outside EU?" → reveals EU responsible operator block.
   - yes/no "Has authorised representative?" → reveals auth-rep block.
5. **Compliance** — CE marking checkbox, applicable legislation (multi-select, EU 2025/2509 pre-selected), harmonised standards (multi-select), common specs textarea (only if "common spec" picked, via `showWhen`), other standards textarea.
6. **Conformity assessment** — yes/no "Notified body involved?" → reveals body name/number/cert ref/cert date.
7. **Customs** — CN chapter select + auto-generated customs code (editable).
8. **Allergenic fragrances** — yes/no/unknown → reveals fragrance picker + auto-generated declaration textarea.
9. **Safety incident reporting** — multi-select channels → reveals phone/email/url + fixed EU Safety Gate link (display-only).

### Inline warnings (rendered by `CategoryQuestions`)

- Age ≤ 36 months → mouth-contact / stricter fragrance warning.
- "Unknown" fragrance answer → "DPP may be incomplete" warning.
- Electronic / radio / AI / battery / drone / cosmetic toy chosen → soft hint to also tick the matching legislation.

### Public toy passport view

New `src/components/toys/ToyPublicPassport.tsx` mirroring `WinePublicPassport`, sections per spec §14. Wired into `PublicPassport.tsx` and `PassportPreview.tsx` via a `category === 'toys'` branch. DPP infrastructure section pulls site_config via `useSiteConfig`.

### Files touched

```text
src/templates/base.ts                          (+ multi_select, + showWhen, + badge)
src/templates/index.ts                         (Toys in categoryList)
src/templates/toys.ts                          (full rewrite, ordered as above)
src/templates/toys.test.ts                     (rewrite)
src/data/toyFragrances.ts                      (new — seeded list)
src/data/toyFragrances.test.ts                 (new)
src/components/CategoryQuestions.tsx           (+ multi_select rendering, + showWhen, + badges,
                                                + toys disclaimer banner, + warning hooks,
                                                + customs auto-fill, + fragrance picker mount)
src/components/CategoryQuestions.test.tsx      (extend)
src/components/toys/FragrancePicker.tsx        (new — searchable dialog)
src/components/toys/FragrancePicker.test.tsx   (new)
src/components/toys/ToyPublicPassport.tsx      (new)
src/components/toys/ToyPublicPassport.render.test.tsx (new)
src/pages/PublicPassport.tsx                   (toys branch)
src/components/PassportPreview.tsx             (toys branch)
src/i18n/locales/*.json  (×24)                 (disclaimer, badges, warnings)
```

### Out of scope for v1

- File uploads (certificates, supplier declarations, test reports, conformity cert PDF).
- AI autofill for toys.
- Progress bar / animated collapsibles (sections render expanded; `showWhen` handles conditional reveal).
- Customs code edge cases beyond `9880` + chapter + `00`.

### Memory updates after build

- Add `mem://features/toys-passport-schema`.
- Update `mem://architecture/category-template-system` (Wine + Toys + Other active).
- Update `mem://style/landing-page-categories` (Toys now active).
