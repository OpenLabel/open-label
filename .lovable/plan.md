
## Simplify Landing Page: Reorder Timeline and Clean Up References

### What changes

#### 1. Reorder timeline cards in `Index.tsx` (lines 355-400)

Current order: Battery (Feb 2027) -> Active Now -> 2027-2030 Rollout

New order: **Active Now** -> **Battery (Coming Soon)** -> **2027-2030 Rollout**

- Move the green "Active Now" card to first position
- Keep the battery card as its own card below, but restyle it with an amber/warning border and a "Coming Soon" badge
- Keep the rollout card at the bottom

#### 2. Update `en.json` timeline content

- **`active.description`**: Remove Construction Products and Toys. Change to: "Wine & Spirits (EU 2021/2117) already requires digital declarations including ingredient lists and nutritional information."
- **`feb2027.title`**: Change to "Batteries — Coming Soon"
- **`feb2027.badge`**: Change to "February 2027"
- **`rollout.description`**: Add construction products and toys here. Change to: "Textiles, electronics, furniture, iron/steel, aluminum, construction products, toys, cosmetics, tires, and detergents will require DPPs as delegated acts are published." (removes "Priority group templates ready now")
- **`categories.subtitle`**: Simplify to remove "Priority groups" distinction

#### 3. Update AI tags in `en.json` and `Index.tsx`

- Replace `batterySpecs` -> "Product Labels", `textileComposition` -> "Ingredient Lists"
- Remove `safetyDatasheets` badge from Index.tsx (line 280)

#### 4. Restyle battery card in `Index.tsx`

Change border from `border-l-primary` to `border-l-amber-500`, icon background from `bg-primary/10` to `bg-amber-500/10`, icon color from `text-primary` to `text-amber-500`.

#### 5. Update all 23 other locale files

Mirror the key value changes across bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sv JSON files with English placeholder text.

### Technical details

**Index.tsx timeline section (lines 355-400) new order:**

```text
<!-- 1. Active Now (green, first) -->
<Card className="border-l-4 border-l-green-500">
  ... CheckCircle2 icon ...
  {t('landing.timeline.active.title')} + badge "In Effect"
</Card>

<!-- 2. Battery (amber, own card, below active) -->
<Card className="border-l-4 border-l-amber-500">
  ... Clock icon with amber styling ...
  {t('landing.timeline.feb2027.title')} + badge
</Card>

<!-- 3. Rollout (muted, last) -->
<Card className="border-l-4 border-l-muted">
  ... Users icon ...
  {t('landing.timeline.rollout.title')}
</Card>
```

**en.json changes:**
- `landing.timeline.active.description` = "Wine & Spirits (EU 2021/2117) already requires digital declarations including ingredient lists and nutritional information."
- `landing.timeline.feb2027.title` = "Batteries — Coming Soon"
- `landing.timeline.feb2027.badge` = "February 2027"
- `landing.timeline.rollout.description` = "Textiles, electronics, furniture, iron/steel, aluminum, construction products, toys, cosmetics, tires, and detergents will require DPPs as delegated acts are published."
- `landing.ai.tags.batterySpecs` = "Product Labels"
- `landing.ai.tags.textileComposition` = "Ingredient Lists"
- Remove `landing.ai.tags.safetyDatasheets`
