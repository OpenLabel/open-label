

## Improve the BuildStatusBanner Prompt

**Problem**: The current prompt is vague ("Check why the build fail") and doesn't include the actual error details, making it easy for the AI to misinterpret or take wrong actions.

**Changes to `src/components/BuildStatusBanner.tsx`**:

1. **Include build error details in the prompt** — Embed `buildStatus.message` into the copied text so the AI gets the exact failure reason without the user needing to describe it.

2. **Make the prompt more structured and failproof** — Rewrite with clear numbered rules:
   - State the exact error from build status
   - Explicit "DO" and "DO NOT" instructions
   - Cover all failure scenarios (missing tests, missing translations, coverage below threshold)

3. **Fix duplicate guard** — Remove the duplicated `if (!isDevOrPreview) return null;` on line 18.

4. **Improve copy UX** — Make the prompt text selectable in a `<pre>` or `<code>` block so users can also manually select it, and add a toast confirmation on copy.

**New prompt template**:
```
The build quality check failed with this error: "{buildStatus.message}". 
Fix this by following these rules:
1. If tests are failing, fix the failing tests or add missing ones.
2. If translations are missing, add them to ALL 24 locale files.
3. If coverage is below threshold, add more tests to increase coverage.
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts.
DO NOT modify the English locale audit match rules.
DO NOT skip or delete existing tests.
```

This makes the prompt self-contained — the AI gets the exact error message and clear, unambiguous instructions regardless of the failure type.

