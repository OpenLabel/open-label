

## Add Drag & Drop to AI Autofill Upload Dialog

### What changes

Replace the two-button grid (Take Photo / Upload File) with a drag-and-drop zone that also supports click-to-browse. When a file is dragged over the zone, it highlights visually.

### Implementation

**File: `src/components/wine/WineAIAutofill.tsx`**

1. Add drag state: `const [isDragging, setIsDragging] = useState(false);`

2. Add drag event handlers:
   - `onDragOver` / `onDragEnter`: prevent default, set `isDragging = true`
   - `onDragLeave`: set `isDragging = false`
   - `onDrop`: prevent default, extract `e.dataTransfer.files[0]`, set preview + call `processImage(file)`

3. Replace the two-button grid (lines 227-246) with a single drop zone `div` that:
   - Has the drag event handlers
   - Clicks to trigger `fileInputRef`
   - Shows a dashed border (highlighted on drag-over via `isDragging` state)
   - Displays Camera + Upload icons with text like "Drag & drop or click to upload"
   - Keeps the same `accept` types validation before processing

### Files changed

| File | Change |
|------|--------|
| `src/components/wine/WineAIAutofill.tsx` | Add drag state + handlers; replace button grid with drop zone |

No new dependencies or translations needed — reuses existing `t('ai.takePhoto')` / `t('ai.uploadFile')` keys or combines them.

