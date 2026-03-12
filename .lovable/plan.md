

## Add preview-only notice to BuildStatusBanner

### Change
Add a small reassuring note inside the banner's `CollapsibleContent` that tells the user this banner is only visible in preview mode and will not appear on the published website.

### Edit in `src/components/BuildStatusBanner.tsx`

Add a muted text line right after the error message paragraph (line 95), before the prompt box:

```tsx
<p className="text-sm text-muted-foreground italic">
  This banner is only visible in preview mode — it will not appear on your published website.
</p>
```

Single line addition, no logic changes needed.

