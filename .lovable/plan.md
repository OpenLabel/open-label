

## Plan: Green Loading State + Success Banner with Auto-Dismiss

### Changes to `src/components/BuildStatusBanner.tsx`

**1. Add a `dismissed` state** to track when the success banner should disappear after a few seconds.

**2. Change the early return logic (line 80):**
- Instead of immediately returning `null` on `pass`, show a green success banner and set a timeout to auto-dismiss after 4 seconds.

**3. Loading state (green):**
- Use green styling (`border-green-500 bg-green-500/10 text-green-700`) instead of `variant="destructive"`.
- Keep the spinner icon but with green color.

**4. Success state (green, auto-dismiss):**
- Show `✅ All checks passed!` with green styling.
- After 4 seconds, set `dismissed=true` → return `null`.

**5. Fail state:** stays red/destructive as-is.

**Implementation approach:**
- Add `const [dismissed, setDismissed] = useState(false);`
- Add a `useEffect` that watches `resolved?.status === 'pass'` and sets a 4s timeout to dismiss.
- Derive `variant` from status: loading/pass → green classes, fail/unknown → destructive.
- If `dismissed` → return `null`.
- If `!isPreview` → return `null`.

### Test file update: `src/components/BuildStatusBanner.test.tsx`
- Update the "returns null when status is pass" test to first check the success message appears, then verify it disappears after the timeout (use `vi.useFakeTimers`).
- Add a test for green styling during loading state.

