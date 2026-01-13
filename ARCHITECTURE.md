# Javari Platform Architecture

**Capability-First Design for Consolidated Application Platform**

---

## Design Philosophy

### Core Principles

1. **Capability-First UX**: Users navigate by what they want to accomplish, not by technical structure
2. **Factory Pipeline Pattern**: Complex workflows orchestrated through modular components
3. **Shared Assets**: Single source of truth for brands, logos, documents
4. **Dynamic Routing**: One codebase handles dozens of similar applications
5. **Progressive Enhancement**: Start simple, add complexity only where needed

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Javari Platform                         │
│                  (Next.js App Router)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Identity │  │ Business │  │ Content  │  │   PDF    │  │
│  │  Suite   │  │  Tools   │  │  Studio  │  │  Suite   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Collectors│  │Verticals │  │  Impact  │                │
│  │ Platform │  │   Apps   │  │   Apps   │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   Shared Services                           │
│  ┌──────────┐  ┌─────────────┐  ┌────────────┐           │
│  │   Auth   │  │ Orchestrator│  │   Asset    │           │
│  │  System  │  │   Engine    │  │   Vault    │           │
│  └──────────┘  └─────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure                            │
│  Database │ File Storage │ AI APIs │ Payment │ Analytics   │
└─────────────────────────────────────────────────────────────┘
```

---

## Route Architecture

### Route Groups Pattern

Next.js route groups organize the codebase without affecting URLs:

```typescript
app/
├── (core)/              // Core platform pages
│   ├── layout.tsx       // Core platform chrome
│   ├── page.tsx         // Homepage
│   └── dashboard/       // User dashboard
│
├── (identity)/          // Identity Suite branding
│   ├── layout.tsx       // Purple theme, Identity nav
│   ├── logo/            // /logo (not /identity/logo)
│   ├── brand-kit/       // /brand-kit
│   └── cards/           // /cards
│
├── (business)/          // Business Tools branding
│   ├── layout.tsx       // Blue theme, Business nav
│   ├── planner/         // /planner
│   ├── pitch/           // /pitch
│   └── financials/      // /financials
│
└── (collectors)/        // Collectors branding
    ├── layout.tsx       // Orange theme, Collectors nav
    └── [category]/      // /collectors/comic-crypt, etc.
        ├── page.tsx
        └── [itemId]/
```

**Benefits:**
- Clean URLs (no nested groups in path)
- Shared layouts per suite
- Independent styling per capability area
- Easy to maintain and extend

---

## Capability-First UX

### User Mental Model

Users think in terms of **capabilities**, not technical structure:

**Traditional Approach (Technical):**
```
/apps/logo-creator
/apps/business-planner  
/apps/comic-collector
```

**Capability-First Approach:**
```
/logo              → "I want to create a logo"
/planner           → "I need a business plan"
/collectors/comics → "I collect comics"
```

### Navigation Philosophy

1. **Homepage**: Show capabilities as cards, not technical hierarchy
2. **Suites**: Group related capabilities (Identity, Business, Content)
3. **Direct Access**: Users bookmark specific tools, not categories
4. **Search**: Universal search across all capabilities

---

## Factory Pipeline Orchestration

### Concept

Many user workflows span multiple capabilities:

**Example: New Business Owner**
1. Create logo (Identity Suite)
2. Generate business plan (Business Tools)
3. Build pitch deck (Content Studio)
4. Export to PDF (PDF Suite)
5. Create business cards (Identity Suite)

### Orchestrator Pattern

```typescript
// Orchestrated multi-step workflow
const workflow = await Orchestrator.createWorkflow({
  name: 'New Business Setup',
  steps: [
    { module: 'identity', action: 'generate-logo', input: {...} },
    { module: 'business', action: 'create-plan', input: {...} },
    { module: 'content', action: 'build-deck', input: {...} },
    { module: 'pdf', action: 'export', input: {...} },
  ],
});

await workflow.execute();
```

### Benefits

- **User Efficiency**: Multi-step workflows automated
- **Data Consistency**: Assets shared across steps
- **Smart Defaults**: Earlier steps inform later ones
- **Progress Tracking**: Users see workflow status

---

## Shared Asset Vault

### Purpose

Eliminate duplication and ensure consistency across capabilities.

### Asset Types

```typescript
interface Asset {
  // Logos from Identity Suite
  logo: {
    vector: string;      // SVG
    raster: string;      // PNG
    variants: string[];  // Light/dark versions
  };

  // Brand assets
  brand: {
    colors: string[];    // Hex codes
    fonts: string[];     // Font names
    guidelines: string;  // PDF URL
  };

  // Documents
  documents: {
    businessPlan: string;
    pitchDeck: string;
    financials: string;
  };

  // Media
  media: {
    images: string[];
    videos: string[];
  };
}
```

### Access Pattern

```typescript
// In Business Planner
import { assetVault } from '@/lib/assets';

// Retrieve logo created in Identity Suite
const logo = await assetVault.get('logo-primary');

// Use in business plan
const plan = await generatePlan({
  companyLogo: logo.url,
  brandColors: logo.brandColors,
});
```

### Benefits

- **Consistency**: Same logo across all documents
- **Efficiency**: Create once, use everywhere
- **Version Control**: Update logo, all docs update
- **Organization**: Central management

---

## Dynamic Routing for Collectors

### Challenge

70+ collector apps with identical structure but different:
- Branding (name, icon, colors)
- Custom fields (comics vs. cards vs. wine)
- Valuation sources (eBay, Comic Book Realm, Vivino)
- Features (barcode scanning, set completion)

### Solution: Configuration-Driven Dynamic Routes

```typescript
// Single route handles all collectors
// app/(collectors)/[category]/page.tsx

export default function CollectorPage({ params }) {
  const config = collectorConfigs[params.category];
  
  return (
    <CollectorTemplate 
      category={params.category}
      config={config}
    />
  );
}

// lib/collectors/configs.ts
export const collectorConfigs = {
  'comic-crypt': {
    displayName: 'Comic Vault',
    icon: '🦸',
    primaryColor: '#DC2626',
    fields: ['title', 'issue', 'publisher', 'year', 'grade'],
    valuationSource: 'comicbookrealm',
    features: ['barcode-scan', 'price-tracking'],
  },
  
  'card-vault': { /* ... */ },
  'vinyl-vault': { /* ... */ },
  // ... 67 more configs
};
```

### Benefits

- **Maintainability**: Update template once, affects all collectors
- **Scalability**: Add new collector = add config object
- **Consistency**: All collectors have same UX patterns
- **Code Reuse**: 70+ apps from 1 codebase

---

## Module Plugin System

### Design

Capabilities can be added as "modules" without core platform changes.

```typescript
// Future: Module registration
interface Module {
  id: string;
  name: string;
  routes: RouteConfig[];
  components: ComponentManifest;
  capabilities: string[];
}

// Register module
Platform.registerModule({
  id: 'crypto-tracker',
  name: 'Crypto Portfolio Tracker',
  routes: [
    { path: '/crypto', component: CryptoHome },
    { path: '/crypto/portfolio', component: Portfolio },
  ],
  capabilities: ['asset-tracking', 'price-alerts'],
});
```

### Benefits

- **Extensibility**: Add capabilities without platform changes
- **Isolation**: Modules don't interfere with each other
- **Testing**: Test modules independently
- **Marketplace**: Future: Third-party modules

---

## Authentication Strategy

### Requirements

1. **Single Sign-On**: One account for all capabilities
2. **OAuth**: Google, Microsoft, Apple
3. **Role-Based Access**: Free, Pro, Enterprise
4. **Subscription Checks**: Determine available capabilities

### Planned Implementation

```typescript
// lib/auth/index.ts (Phase 2+)

interface User {
  id: string;
  email: string;
  subscription: {
    tier: 'free' | 'pro' | 'enterprise';
    apps: string[];  // Subscribed capabilities
  };
}

// Capability access check
function hasAccess(user: User, capability: string): boolean {
  if (user.subscription.tier === 'enterprise') {
    return true;  // All access
  }
  
  return user.subscription.apps.includes(capability);
}
```

---

## Data Architecture

### Database Schema (Planned)

```sql
-- Users and authentication
users
  - id (uuid)
  - email
  - created_at
  
subscriptions
  - user_id
  - tier
  - apps (array)
  - billing_cycle

-- Shared assets
assets
  - id (uuid)
  - user_id
  - type (logo|document|media)
  - url
  - metadata (jsonb)

-- Collector items (example)
collector_items
  - id (uuid)
  - user_id
  - category
  - fields (jsonb)
  - valuation
  - created_at
```

### Data Sharing Principles

1. **User Isolation**: Users only see their data
2. **Cross-App Sharing**: Assets available to all user's apps
3. **Subscription Gating**: Check access before queries
4. **Performance**: Indexed by user_id, category

---

## Styling and Theming

### Per-Suite Branding

Each capability suite has its own visual identity:

```typescript
// Identity Suite: Purple
const identityTheme = {
  primary: '#8B5CF6',    // Purple
  accent: '#EC4899',     // Pink
  background: '#F3F4F6',
};

// Business Tools: Blue
const businessTheme = {
  primary: '#2563EB',    // Blue
  accent: '#0891B2',     // Cyan
  background: '#EFF6FF',
};

// Collectors: Orange
const collectorsTheme = {
  primary: '#F97316',    // Orange
  accent: '#FBBF24',     // Amber
  background: '#FFF7ED',
};
```

### Implementation

```typescript
// app/(identity)/layout.tsx
export default function IdentityLayout({ children }) {
  return (
    <ThemeProvider theme={identityTheme}>
      <NavBar suite="identity" />
      {children}
    </ThemeProvider>
  );
}
```

---

## Performance Optimization

### Code Splitting

Route groups enable automatic code splitting:

```typescript
// User on /logo only loads Identity Suite code
// Collectors code not loaded until /collectors/* accessed
```

### Lazy Loading

```typescript
// Heavy components loaded on demand
const PDFEditor = lazy(() => import('@/components/pdf/Editor'));
const LogoGenerator = lazy(() => import('@/components/identity/LogoGen'));
```

### Bundle Size Management

- Shared components in `/components/shared`
- Suite-specific code in suite directories
- Dynamic imports for heavy libraries

---

## Security Considerations

### Phase 1 (Current)

- No authentication (stubs only)
- No data persistence
- No external integrations
- Build-time security only (TypeScript, ESLint)

### Phase 2+ (Planned)

1. **Authentication**
   - OAuth 2.0 only (no passwords)
   - JWT session tokens
   - Secure cookie handling

2. **Authorization**
   - Row-level security (Supabase RLS)
   - Subscription checks at API layer
   - Rate limiting

3. **Data Protection**
   - Encryption at rest
   - HTTPS only
   - CORS policies
   - Input sanitization

4. **Compliance**
   - GDPR data export
   - Data deletion requests
   - Audit logging

---

## Deployment Strategy

### Phase 1

- Single Vercel project (preview only)
- No production traffic
- Build verification only

### Phase 2+

```
Deployment Pipeline:
1. GitHub push → main branch
2. Vercel build triggered
3. Type checking
4. Linting
5. Build Next.js
6. Deploy to preview URL
7. Run integration tests
8. Promote to production (manual)
```

### Monitoring

- Build success/failure tracking
- Performance monitoring (Web Vitals)
- Error tracking (Sentry, planned)
- User analytics (planned)

---

## Migration Strategy

### Guiding Principles

1. **No Disruption**: Existing apps remain operational during migration
2. **Parallel Systems**: New and old run side-by-side
3. **Gradual Rollout**: Migrate capabilities one at a time
4. **Rollback Ready**: Ability to revert any migration
5. **Data Integrity**: Zero data loss during migrations

### Migration Phases

See main README.md for detailed phase breakdown.

---

## Testing Strategy

### Phase 1

- Type checking: `tsc --noEmit`
- Build verification: `npm run build`
- No runtime tests (no features yet)

### Phase 2+ (Planned)

```typescript
// Unit tests
describe('Asset Vault', () => {
  it('stores and retrieves assets', async () => {
    const asset = await assetVault.store({...});
    expect(asset.id).toBeDefined();
  });
});

// Integration tests
describe('Business Plan Generator', () => {
  it('creates plan with logo from vault', async () => {
    const logo = await createLogo(...);
    const plan = await generatePlan({ logo });
    expect(plan).toContain(logo.url);
  });
});

// E2E tests
describe('New Business Workflow', () => {
  it('completes full onboarding', async () => {
    await page.goto('/logo');
    await createLogo();
    await page.goto('/planner');
    await createBusinessPlan();
    // ... etc
  });
});
```

---

## Success Metrics

### Technical Metrics

- **Repository Count**: 175 → 20-30 (85% reduction)
- **Vercel Projects**: 100 → 15-20 (80% reduction)
- **Build Time**: <90 seconds per deployment
- **Bundle Size**: <500KB initial load
- **Type Coverage**: 100% (strict TypeScript)

### User Metrics

- **Time to First Capability**: <30 seconds
- **Capability Discovery**: >70% find tools via homepage
- **Cross-App Usage**: >40% use 3+ capabilities
- **Workflow Completion**: >60% complete multi-step flows

### Business Metrics

- **Cost Reduction**: 60-80% infrastructure costs
- **Development Velocity**: 2x faster feature delivery
- **Code Reuse**: 70%+ shared components
- **Maintenance Overhead**: 50% reduction

---

## Future Enhancements

### Short-Term (Phases 2-3)

- Real authentication
- Database integration
- Content tool migrations
- Collector consolidation

### Medium-Term (Phases 4-5)

- Vertical app integration
- Advanced orchestration workflows
- Real-time collaboration
- Mobile apps (iOS/Android)

### Long-Term (6+ months)

- AI-powered suggestions across capabilities
- Third-party module marketplace
- White-label enterprise deployments
- International expansion

---

## Conclusion

The Javari Platform architecture prioritizes:

1. **User Experience**: Capability-first navigation
2. **Developer Experience**: Maintainable, scalable codebase
3. **Business Value**: Reduced costs, faster delivery
4. **Safety**: Gradual migration, zero disruption

This foundation (Phase 1) establishes the structure for achieving these goals while maintaining complete safety through scaffolding-only approach.

---

**Last Updated:** 2026-01-13  
**Version:** 0.1.0 (Phase 1 Foundation)  
**Status:** Architecture Documented ✅
