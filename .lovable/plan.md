

## Update Source File Headers to New OLPL Template

Replace the old 10-line `//`-comment AGPLv3 header with the new `/* */` block-comment OLPL header in all 70 project-authored source files.

### Old header (lines 1-10):
```
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

### New header:
```
/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */
```

### Scope
All 70 files across `src/` and `supabase/functions/` that currently have the old header. Excluded: auto-generated files (`client.ts`, `types.ts`), UI library components, config files, test files, and `.json`/`.css` files (same exclusions as before).

### Approach
- Replace lines 1-10 in each file with the new block comment
- No other changes to file content

### Note on Terms page
`src/pages/Terms.tsx` also references "GNU Affero General Public License version 3" in its rendered content — this should also be updated to reference the "Open-Label Public License (OLPL) v1.0" to stay consistent.

