

## Fix: QR Code URL Uses Old Domain

### Problem

The `site_config` table has `short_url` set to `https://dpp-check.com`. The QR code URL builder in `Dashboard.tsx` (line 106) uses this value as the base:

```typescript
const baseUrl = config?.short_url?.trim() || window.location.origin;
return `${baseUrl}/p/${slug}`;
```

This produces URLs like `https://dpp-check.com/p/abc123` instead of `https://open-label.eu/p/abc123`.

### Fix

Update the `short_url` value in the `site_config` database table from `https://dpp-check.com` to `https://open-label.eu`.

This is a single database update — no code changes needed:

```sql
UPDATE site_config SET value = 'https://open-label.eu' WHERE key = 'short_url';
```

Alternatively, you can change it yourself via **Settings → Setup** page in the app, where the "Short URL Base" field is editable.

