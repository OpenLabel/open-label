

## Plan: Add Tests to Reach 50% Coverage

### Current State
- **Coverage**: 29.69% (2998/10097 statements)
- **Target**: 50% (need ~2051 more statements covered)
- **Threshold**: Keep at 30% (do NOT change)

### Strategy
Create render tests for the largest untested components/pages. Each render test covers nearly 100% of a component's lines just by importing and rendering it. We mock external dependencies (supabase, react-router-dom, auth hooks, i18n) to make components renderable in isolation.

### New Test Files (ordered by coverage impact)

| # | Test File | Component Lines | Priority |
|---|-----------|----------------|----------|
| 1 | `src/pages/Index.test.tsx` | ~491 | Highest |
| 2 | `src/pages/PassportForm.test.tsx` | ~514 | Highest |
| 3 | `src/components/QRCodeDialog.test.tsx` | ~399 | High |
| 4 | `src/templates/tires.coverage.test.ts` | ~283 | High |
| 5 | `src/pages/Setup.test.tsx` | ~259 | High |
| 6 | `src/components/PassportPreview.test.tsx` | ~244 | High |
| 7 | `src/components/SortablePassportCard.test.tsx` | ~229 | Medium |
| 8 | `src/pages/PublicPassport.test.tsx` | ~225 | Medium |
| 9 | `src/pages/Terms.test.tsx` | ~210 | Medium |
| 10 | `src/pages/Dashboard.test.tsx` | ~202 | Medium |
| 11 | `src/components/CategoryQuestions.test.tsx` | ~149 | Medium |
| 12 | `src/pages/Auth.test.tsx` | ~155 | Medium |
| 13 | `src/components/CounterfeitProtection.test.tsx` | ~138 | Medium |
| 14 | `src/pages/LegalMentions.test.tsx` | ~137 | Medium |
| 15 | `src/hooks/useAutoTranslate.test.ts` | ~131 | Medium |
| 16 | `src/hooks/useReferral.test.ts` | ~23 | Low |
| 17 | `src/pages/ResetPassword.test.tsx` | ~105 | Low |
| 18 | `src/pages/PrivacyPolicy.test.tsx` | ~112 | Low |
| 19 | `src/components/ImageUpload.test.tsx` | ~129 | Low |
| 20 | `src/components/DPPLanguagePicker.test.tsx` | ~103 | Low |
| 21 | `src/components/LanguageSwitcher.test.tsx` | ~32 | Low |
| 22 | `src/components/NavLink.test.tsx` | ~28 | Low |

**Estimated total new coverage**: ~4100+ lines, bringing total to ~7000/10097 ≈ 69%, well above 50%.

### Mocking Approach (shared across all test files)

```typescript
// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })), getSession: vi.fn(() => Promise.resolve({ data: { session: null } })), ... },
    from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), ... })),
    storage: { from: vi.fn(() => ({ upload: vi.fn(), getPublicUrl: vi.fn() })) },
    functions: { invoke: vi.fn() },
  }
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() }),
  AuthProvider: ({ children }) => children,
}));

// Mock useSiteConfig
vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { company_name: 'Test Co', setup_complete: true, ai_enabled: true, ... }, loading: false, isSetupRequired: false }),
  SiteConfigProvider: ({ children }) => children,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ children }) => children,
}));
```

### Test Pattern (per component)

Each test file will:
1. Set up mocks for dependencies
2. Render the component with minimal props
3. Assert it renders without crashing
4. Test 1-2 key interactions or conditional renders (e.g., category switch, empty vs populated state)

### Files Modified
- None (threshold stays at 30%)

### Files Created
- 22 new test files as listed above

