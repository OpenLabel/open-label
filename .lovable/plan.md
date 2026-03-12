

## Make ".eu" More Visible and Blue

The `.eu` suffix is currently styled as `text-muted-foreground font-normal`, making it gray and subtle. Change it to `text-primary font-bold` across all 7 files so it appears blue and prominent, preventing users from mistakenly typing `.com`.

### Files to Edit (7 files, ~10 occurrences)

Every instance of `<span className="text-muted-foreground font-normal">.eu</span>` or similar will be changed to `<span className="text-primary font-bold">.eu</span>`:

1. **`src/pages/Index.tsx`** — Header (line 42) and footer (line 467)
2. **`src/pages/Dashboard.tsx`** — Header (line 134)
3. **`src/pages/Auth.tsx`** — Header (line 85)
4. **`src/pages/ResetPassword.tsx`** — Header (line 70)
5. **`src/pages/PublicPassport.tsx`** — Powered-by footer (line 208)
6. **`src/components/wine/WinePublicPassport.tsx`** — Powered-by footer (line 551)
7. **`src/components/PassportPreview.tsx`** — Preview powered-by (line 225)

No test changes needed — tests don't assert on `.eu` styling classes.

