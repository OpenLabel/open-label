

## Add Source Header to All Project Source Files

### Scope

Add the following license header comment to all `.ts` and `.tsx` source files in the project:

```typescript
// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.
```

### Files affected

**192 files** in `src/` (excluding `src/integrations/supabase/` which is auto-generated) plus **10 files** in `supabase/functions/`. Each file gets the header prepended before existing content.

### Exclusions

- `src/integrations/supabase/client.ts` -- auto-generated, must not edit
- `src/integrations/supabase/types.ts` -- auto-generated, must not edit
- `src/vite-env.d.ts` -- Vite declaration file
- UI component files in `src/components/ui/` -- these are shadcn/ui generated components; including them is optional

### Approach

For Deno edge functions (`supabase/functions/`), the same header applies since they are TypeScript.

### Questions to clarify

I want to confirm scope before proceeding with ~190 file edits:

- Should the header go on **all source files** including tests, shadcn UI components, and config files (`vite.config.ts`, `tailwind.config.ts`, etc.)?
- Or only on **project-authored files** (pages, components, hooks, templates, data, lib, edge functions) excluding UI library components and test files?

