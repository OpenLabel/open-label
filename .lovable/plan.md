

## Rename `short_url` → `site_url` Across Codebase and Database

The `short_url` field was originally for an optional short domain for QR codes, but it's now the main published website URL. We'll rename it to `site_url` and update the form labels/descriptions accordingly.

### Database Migration

Rename the existing `short_url` key in `site_config` to `site_url`:

```sql
UPDATE site_config SET key = 'site_url' WHERE key = 'short_url';
```

Also update the RLS policy that whitelists readable keys to include `site_url` instead of `short_url`.

### Code Changes

**`src/hooks/useSiteConfig.tsx`** — Rename `short_url` to `site_url` in the `SiteConfig` interface, default config, and the config mapping logic.

**`src/pages/Setup.tsx`** — Rename state variable `shortUrl` → `siteUrl`. Update the form section:
- Section title: "Website URL" instead of "QR Code Optimization"
- Label: "Published Website URL *" (make it required)
- Icon: `Globe` instead of `QrCode`
- Badge: "Required" instead of "Optional"
- Placeholder: `https://open-label.eu`
- Description: "The URL where this app is published. Used for QR codes and build status checks."
- Add validation requiring this field
- Move section up near the other required fields (provider info section)

**`src/pages/Dashboard.tsx`** — Update `config?.short_url` → `config?.site_url` in `getPublicUrl`.

**`src/components/BuildStatusBanner.tsx`** — Update `config?.short_url` → `config?.site_url`.

**Tests** (4 files) — Update all mock config objects replacing `short_url` with `site_url`:
- `src/hooks/useSiteConfig.test.tsx`
- `src/App.test.tsx`
- `src/pages/Index.test.tsx`
- `src/pages/Dashboard.test.tsx`

