

## Make BuildStatusBanner collapsible

Wrap the banner content in a `Collapsible` component (already available via `@radix-ui/react-collapsible`). The title bar with the warning icon stays always visible; the details (error message, prompt, copy button) are hidden by default and expand on click.

### Changes to `src/components/BuildStatusBanner.tsx`

1. Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible` and `ChevronDown` from lucide-react.

2. Wrap the `Alert` internals so:
   - The `AlertTitle` line becomes a `CollapsibleTrigger` with a chevron icon that rotates when open.
   - The `AlertDescription` (error message, prompt, copy button) goes inside `CollapsibleContent`.
   - Default state: `open={false}` (collapsed).

3. Add a state `const [open, setOpen] = useState(false)` and pass to `Collapsible`.

4. Add a rotation transition on the chevron: `className={cn("h-4 w-4 transition-transform", open && "rotate-180")}`.

Structure:
```
<Alert>
  <Collapsible open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger className="flex items-center gap-2 w-full cursor-pointer">
      <AlertTriangle /> ⚠️ Build Quality Check Failed <ChevronDown />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <AlertDescription>...existing content...</AlertDescription>
    </CollapsibleContent>
  </Collapsible>
</Alert>
```

