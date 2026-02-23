

## Fix Translation Dialog Scrolling

### Problem
The translation dialog uses Radix UI's `ScrollArea` component, which requires a fixed height on its viewport to enable scrolling. The current CSS (`flex-1 min-h-0 max-h-[50vh]`) doesn't reliably constrain the viewport height, so all 24 language rows render but you can only see the first ~6 and cannot scroll to the rest.

### Solution
Replace the `ScrollArea` wrapper with a plain `div` using `overflow-y-auto`, which handles overflow scrolling natively and reliably.

### Technical Details

**File: `src/components/TranslationButton.tsx`**

1. Remove the `ScrollArea` import (line 16):
   - Remove `import { ScrollArea } from '@/components/ui/scroll-area';`

2. Replace the `ScrollArea` wrapper (line 220) with a simple scrollable div:
   - **From**: `<ScrollArea className="flex-1 min-h-0 max-h-[50vh] -mx-6 px-6">`
   - **To**: `<div className="flex-1 min-h-0 max-h-[50vh] overflow-y-auto -mx-6 px-6">`
   - Close tag (line 243): change `</ScrollArea>` to `</div>`

That is the only change needed. No other files are affected.
