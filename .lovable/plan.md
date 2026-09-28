# Move Apparel Product Name into Product identity

## Scope

Change only the Apparel form layout and its related tests. Wine remains unchanged, while Toys and Car Cleaning keep their standalone Product Name card and page-level translation behavior.

## Implementation

1. Update the shared passport form so the standalone Product Name card is hidden for `textiles` as well as Wine, without moving or changing Product Description.
2. Disable only Apparel's page-level product-name auto-translation hook, leaving Toys and Car Cleaning enabled.
3. Add `product_name` as the first Apparel identity question, before `show_advanced_fields`, using:
   - shared keys `passport.productName`, `passport.productNamePlaceholder`, and `passport.productNameHelp`
   - existing English fallback wording from the standalone card
   - required and translatable field behavior
4. Leave the Apparel public passport component unchanged.

## Tests and verification

- Assert the Apparel template field is first, required, translatable, and uses only the three shared translation keys.
- Add form coverage proving Apparel hides the standalone card while Toys and Car Cleaning still show it.
- Prove the page-level product-name translation hook remains enabled for Toys and Car Cleaning but not Apparel.
- Run the complete test suite, including unchanged Apparel public passport privacy and heading tests.
- Check the final build status and report any failure as a critical security error without lowering thresholds.

## Expected result

The Apparel form order becomes Basic Information, Product Image, Product Description, Product identity starting with Product Name, then all existing Apparel sections. Description appearing before Product Name is accepted. Empty Product Name will now appear in Apparel's missing mandatory fields warning by design. Zero new i18n keys will be added.
