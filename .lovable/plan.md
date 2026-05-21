## Goal
When creating a new passport, prefill the manufacturer-identity fields from the user's most recently created/updated passport, so repeat users don't retype brand and company info every time.

## Fields to prefill
Scoped to the Toys template (these keys are toys-specific):
- `brand_name`
- Manufacturer block: `manufacturer_legal_name`, `manufacturer_street`, `manufacturer_postal_code`, `manufacturer_city`, `manufacturer_country`, `manufacturer_email`, `manufacturer_website`, `manufacturer_operator_id`, `manufacturer_operator_id_type`, `manufacturer_non_eu`
- Authorised representative: `has_auth_rep`, `auth_rep_legal_name`, `auth_rep_street`, `auth_rep_postal_code`, `auth_rep_city`, `auth_rep_country`, `auth_rep_email`, `auth_rep_operator_id`, `auth_rep_operator_id_type`
- EU responsible economic operator: `eu_op_legal_name`, `eu_op_role`, `eu_op_street`, `eu_op_postal_code`, `eu_op_city`, `eu_op_country`, `eu_op_email`, `eu_op_operator_id`, `eu_op_operator_id_type`

Product-specific fields (model name, SKU, image, description, CE acknowledgment, safety assessment answers, instructions/warnings, fragrances, etc.) are NOT prefilled — they must be re-entered per product.

## Behavior
- Only applies to **new** passports (`id === 'new'`), never overwrites when editing.
- Fetch the latest passport owned by the current user, ordered by `updated_at DESC LIMIT 1`, matching the currently selected `category` (default `wine`; when user switches to `toys`, refetch for toys).
- If no prior passport for that category exists, fall back to the most recent passport of any category and copy only the overlapping identity keys.
- Prefill happens once per category change; if the user has already typed into any of those fields, keep their input (only fill keys that are currently empty/undefined).

## Technical sketch
- Add a new hook `useLatestPassportDefaults(category)` in `src/hooks/usePassports.tsx` that uses React Query to select the latest passport for the current user filtered by category, returning a memoized identity-only subset.
- In `src/pages/PassportForm.tsx`, when `!isEditing` and `user` is loaded, merge the returned defaults into `formData.category_data` (only for the listed keys, only when current value is empty). Re-run when `formData.category` changes.
- Update `savedFormDataRef.current` after applying defaults so the unsaved-changes guard doesn't fire immediately.
- Add a unit test covering: prefilled on new, not prefilled on edit, doesn't overwrite typed values, scoped to identity keys only.

## Out of scope
- Wine-specific producer prefill (the wine template uses different keys; can be a follow-up).
- A user-facing "clear defaults" UI.
- Persisting a separate "company profile" record (would be cleaner long-term but is a larger change).
