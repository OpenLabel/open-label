

## Update BuildStatusBanner instructions and prompt

### Changes to `src/components/BuildStatusBanner.tsx`

**1. Update the `buildPrompt` function** (lines 14-23) to emphasize fixing the root cause, not the tests:

```
The build quality check failed with this error: "${errorMessage}".
Fix this by following these rules:
1. Fix the actual error causing the failure — do NOT just fix or delete the tests.
2. If translations are missing, add them to ALL 24 locale files.
3. If coverage is below threshold, add more tests to increase coverage.
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts.
DO NOT modify the English locale audit match rules.
DO NOT skip or delete existing tests.
```

**2. Update the instruction text** (line 71) from:
> "Copy this prompt and send it to Lovable:"

To:
> "Copy this prompt, send it to Lovable, then re-publish the website:"

