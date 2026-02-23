
## Fix Demo Passport: Create Real Wine Entry and Link It

### Problem
The "View Demo Passport" button on the landing page currently links to `/auth` (the login page), not to an actual demo passport.

### Solution

#### 1. Create a realistic wine passport in the database
Insert a wine passport under your account (`hugo@cypheme.com`, user ID `8b204d52-ab25-449b-bfcd-c9ef19ea8eef`) with a fixed public slug (e.g., `demo000000000001`) so we can hardcode the link. The passport will have realistic data for a typical French wine:

- **Product Name**: Chateau Example 2022
- **Category**: Wine
- **Language**: French
- **Realistic category_data**: Bordeaux region, France, 13.5% alcohol, 750ml, standard ingredients (grapes, sulfites as allergen, tartaric acid), proper nutritional values, glass bottle recycling info

This will be done via a database migration so it's reproducible.

#### 2. Update the demo button link
Change the "View Demo Passport" button in `Index.tsx` from linking to `/auth` to linking to `/p/demo000000000001`.

#### 3. Update all locale files
No locale changes needed -- the button text ("View Demo Passport") stays the same, only the link target changes.

### Technical Details

**Database migration:**
```sql
INSERT INTO public.passports (
  user_id, name, category, language, public_slug,
  description, category_data
) VALUES (
  '8b204d52-ab25-449b-bfcd-c9ef19ea8eef',
  'Chateau Example 2022',
  'wine',
  'fr',
  'demo000000000001',
  'A demonstration Digital Product Passport for a typical French wine.',
  '{
    "product_name": "Chateau Example 2022",
    "producer_name": "Domaine Example",
    "country": "France",
    "region": "Bordeaux",
    "denomination": "Bordeaux AOC",
    "vintage": "2022",
    "grape_variety": "Merlot, Cabernet Sauvignon",
    "alcohol_percent": 13.5,
    "volume": 750,
    "volume_unit": "ml",
    "has_pdo": true,
    "residual_sugar": 2.5,
    "total_acidity": 5.2,
    "sugar_classification": "Sec",
    "ingredient_product_type": "wine",
    "ingredients": [
      {"id": "grapes", "name": "Grapes"},
      {"id": "sulfites", "name": "Sulfites", "isAllergen": true, "eNumber": "E 220"},
      {"id": "tartaric_acid", "name": "Tartaric acid", "eNumber": "E 334"}
    ],
    "energy_kcal": 82,
    "energy_kcal_manual": false,
    "energy_kj": 343,
    "carbohydrates": 2.5,
    "sugar": 0.5,
    "fat": 0,
    "saturated_fat": 0,
    "proteins": 0,
    "salt": 0,
    "show_exact_values": false,
    "show_alcohol_on_label": true,
    "show_residual_sugar_on_label": false,
    "show_total_acidity_on_label": false,
    "is_organic_eu": false,
    "packaging_materials": [
      {
        "id": "mat_demo_bottle",
        "typeId": "bottle",
        "typeName": "Bottle",
        "isCustomType": false,
        "compositionId": "gl_70",
        "compositionCode": "GL 70",
        "compositionName": "Colorless glass",
        "disposalMethodId": "glass_collection",
        "disposalMethodName": "Glass collection"
      },
      {
        "id": "mat_demo_cork",
        "typeId": "cork",
        "typeName": "Cork",
        "isCustomType": false,
        "compositionId": "cork_natural",
        "compositionCode": "CORK",
        "compositionName": "Natural cork",
        "disposalMethodId": "general_waste",
        "disposalMethodName": "General waste"
      }
    ]
  }'::jsonb
);
```

**Index.tsx change (line 96-98):**
Change from:
```tsx
<Link to="/auth">{t('landing.hero.demo')}</Link>
```
To:
```tsx
<Link to="/p/demo000000000001">{t('landing.hero.demo')}</Link>
```

This gives you a fully editable wine passport in your dashboard that doubles as the public demo. If you update the passport later, the demo link automatically shows the latest version.
