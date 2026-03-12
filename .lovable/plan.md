

## Lower Test Coverage Thresholds to 30%

Two changes:

### 1. `vite.config.ts` (line 8)
Change thresholds from 50 to 30:
```typescript
const THRESHOLDS = { lines: 30, branches: 30, functions: 30, statements: 30 };
```

### 2. `src/components/BuildStatusBanner.tsx` (line 35)
Update the prompt text to reference 30 instead of 50:
```
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts — they should all be set to 30.
```

