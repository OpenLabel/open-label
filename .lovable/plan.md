## Remove internal DPP Name from public views

The internal "DPP Name" field must never leak to end users. Currently both public views fall back to `passport.name` when Product Name is empty.

### Changes

1. **`src/components/wine/WinePublicPassport.tsx`** (line ~80)
   - Change `const productName = (categoryData.product_name as string) || passport.name;`
   - To: use translated product name → product_name → empty string (no fallback to `passport.name`).

2. **`src/pages/PublicPassport.tsx`** (line ~115)
   - Remove `|| passport.name` from the title resolution chain.
   - Result: if no Product Name is set, the title area renders blank (or we hide the element entirely).

3. **Document title (`<title>` / SEO)** — apply the same rule so the browser tab and meta tags don't leak the internal name either.

### Out of scope (per your choice)

- No publish-time validation requiring Product Name.
- No "Untitled Product" placeholder.
- Dashboard, admin, and editor continue to show DPP Name as today.

### Tests

Update / add tests asserting that when `category_data.product_name` is empty, the public passport does NOT render `passport.name`.
