

## Fix: Only show BuildStatusBanner in Lovable preview, never on published site

### Problem
The `BuildStatusBanner` is a developer tool that should only appear in the Lovable preview environment. It currently renders on the published site too, which is unacceptable.

### Solution
Add an environment check at the top of the component. Lovable preview URLs contain `lovableproject.com` or `id-preview--` patterns, but the simplest reliable check is `window.location.hostname`. However, the most robust approach is to check for the Lovable preview indicator:

- In Vite dev mode: `import.meta.env.DEV` is `true`
- In Lovable preview: the hostname contains `lovable` (e.g. `id-preview--xxx.lovable.app`)
- On the published site: the hostname is the custom domain (e.g. `open-label.eu` or `digital-product-passports-com.lovable.app`)

The banner should show when:
- `import.meta.env.DEV` is true (local dev), OR
- The hostname includes `id-preview--` (Lovable preview)

### Changes to `src/components/BuildStatusBanner.tsx`

Add an early return at the top of the component:

```tsx
export function BuildStatusBanner() {
  const isPreview = import.meta.env.DEV || window.location.hostname.includes('id-preview--');
  if (!isPreview) return null;
  // ... rest unchanged
}
```

Single line addition — the banner will never render on the published site.

