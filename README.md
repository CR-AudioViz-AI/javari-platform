# Javari Platform

**Unified capability-first platform consolidating 100+ applications**

> ⚠️ **PHASE 1 FOUNDATION - SCAFFOLDING ONLY**
> 
> This repository contains the foundation structure for the unified Javari AI platform.
> **No existing applications have been modified, migrated, or deleted.**
> All routes are placeholder stubs for future implementation.

---

## Overview

The Javari Platform is a strategic consolidation initiative to unify 175 GitHub repositories and 100 Vercel projects into a single, capability-first architecture. This reduces infrastructure overhead by 80-85% while improving user experience and development velocity.

### Current Status: Phase 1 Foundation

**What This Repository Contains:**
- ✅ Next.js 14 App Router scaffolding with TypeScript
- ✅ Route group structure for all major capability areas
- ✅ Placeholder stubs for authentication, orchestration, and asset management
- ✅ Basic UI layouts demonstrating future architecture
- ✅ Comprehensive documentation

**What This Repository Does NOT Contain:**
- ❌ No real authentication or user management
- ❌ No database connections or data persistence
- ❌ No migrations from existing applications
- ❌ No production-ready features
- ❌ No customer-facing functionality

---

## Architecture

### Customer-Facing Structure

The Javari Platform uses a hierarchical mental model that customers navigate naturally:

**Universe → Communities → Capabilities**

#### Universe
**Javari Universe** is the top-level realm where all capabilities exist. In the future, additional universes (Mars, Moon, custom white-label) can be added without restructuring.

#### Communities
**Communities** are the primary way customers navigate. Each Community groups related capabilities around a common theme:

- 🎨 **Identity Community** - Brand creation, logos, business cards
- 📊 **Business Community** - Planning, pitch decks, financials
- ✍️ **Content Community** - Presentations, resumes, eBooks, social media
- 📄 **PDF Community** - Document creation, editing, merging
- 🦸 **Collectors Community** - 70+ specialized collection management apps
- 🏥 **Verticals Community** - Industry-specific solutions
- ❤️ **Impact Community** - Social good and community service

#### Capabilities
**Capabilities** are what users want to accomplish:
- "Create a logo" (capability in Identity Community)
- "Build a business plan" (capability in Business Community)
- "Track my comic collection" (capability in Collectors Community)

**Customers never see:** Modules, services, route groups, or other implementation details.

---

### Technical Structure (Developer View)

Behind the scenes, the platform uses Next.js App Router with nested route groups:

### Route Groups

Route groups organize code by Community without affecting URLs:

```
app/
├── (core)/                           # Core platform (auth, dashboard)
│   └── layout.tsx
│
├── (communities)/                    # All customer-facing Communities
│   │
│   ├── (identity)/                   # Identity Community
│   │   ├── layout.tsx               # Purple theme, Community nav
│   │   ├── logo/                    # /logo (not /identity/logo)
│   │   ├── brand-kit/               # /brand-kit
│   │   └── cards/                   # /cards
│   │
│   ├── (business)/                   # Business Community
│   │   ├── layout.tsx               # Blue theme, Community nav
│   │   ├── planner/                 # /planner
│   │   ├── pitch/                   # /pitch
│   │   └── financials/              # /financials
│   │
│   ├── (content)/                    # Content Community
│   │   ├── layout.tsx               # Green theme, Community nav
│   │   ├── presentation/            # /presentation
│   │   ├── resume/                  # /resume
│   │   ├── ebook/                   # /ebook
│   │   ├── social/                  # /social
│   │   ├── email/                   # /email
│   │   └── cover-letter/            # /cover-letter
│   │
│   ├── (pdf)/                        # PDF Community
│   │   ├── layout.tsx               # Red theme, Community nav
│   │   ├── create/                  # /create
│   │   ├── edit/                    # /edit
│   │   ├── merge/                   # /merge
│   │   └── forms/                   # /forms
│   │
│   ├── (collectors)/                 # Collectors Community
│   │   ├── layout.tsx               # Orange theme, Community nav
│   │   └── [category]/              # /collectors/comic-crypt, etc.
│   │       └── page.tsx             # Dynamic route for all 70+ categories
│   │
│   ├── (verticals)/                  # Verticals Community
│   │   ├── layout.tsx               # Indigo theme, Community nav
│   │   ├── health/                  # /health
│   │   ├── travel/                  # /travel
│   │   ├── education/               # /education
│   │   ├── entertainment/           # /entertainment
│   │   └── family/                  # /family
│   │
│   └── (impact)/                     # Impact Community
│       ├── layout.tsx               # Teal theme, Community nav
│       ├── first-responders/        # /first-responders
│       ├── veterans/                # /veterans
│       ├── faith-communities/       # /faith-communities
│       └── animal-rescue/           # /animal-rescue
```

**Key Points:**
- `(communities)` groups all customer-facing areas
- Each Community has its own layout with theme and navigation
- Route groups don't appear in URLs
- Clean URLs: `/logo`, `/planner`, `/collectors/comics`

**Neighborhoods (Future):**
Within large Communities (like Collectors), Neighborhoods may provide optional sub-organization:
```
Collectors Community
├── Entertainment Neighborhood (comics, cards, action figures)
├── Luxury Neighborhood (watches, wine, art)
└── Hobbies Neighborhood (stamps, coins, models)
```

---

### How Customers Navigate

**User Journey:**
1. User enters Javari Universe
2. Sees Communities (Identity, Business, Content, etc.)
3. Selects a Community based on intent
4. Chooses a Capability (what they want to do)
5. System loads appropriate modules invisibly

**What Customers See:**
- Homepage: Community cards with icons
- Community page: List of capabilities
- Capability page: The actual tool/app

**What Customers DON'T See:**
- Route groups like `(communities)` or `(identity)`
- Modules or services
- Technical implementation details


### Key Architectural Patterns

1. **Capability-First UX**: Routes organized by what users want to accomplish
2. **Dynamic Routing**: Single route handles 70+ collector categories
3. **Shared Assets**: Unified asset vault for logos, brands, documents
4. **Factory Pipeline**: Orchestrator coordinates multi-step workflows

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

---

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/CR-AudioViz-AI/javari-platform.git
cd javari-platform

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

### Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

---

## Project Structure

```
javari-platform/
├── app/                 # Next.js App Router
│   ├── (core)/         # Core routes (auth, dashboard)
│   ├── (identity)/     # Identity suite routes
│   ├── (business)/     # Business tools routes
│   ├── (content)/      # Content creation routes
│   ├── (pdf)/          # PDF tools routes
│   ├── (collectors)/   # Collector apps (dynamic)
│   ├── (verticals)/    # Vertical apps routes
│   ├── (impact)/       # Impact apps routes
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
│
├── components/          # React components
│   ├── shared/         # Shared across all apps
│   ├── identity/       # Identity suite components
│   ├── business/       # Business tools components
│   ├── content/        # Content creation components
│   ├── pdf/            # PDF components
│   ├── collectors/     # Collector components
│   ├── verticals/      # Vertical components
│   └── impact/         # Impact components
│
├── lib/                 # Utility libraries
│   ├── auth/           # Auth placeholder
│   ├── orchestrator/   # Orchestrator skeleton
│   ├── assets/         # Asset vault stub
│   └── collectors/     # Collector configs
│
├── docs/                # Additional documentation
├── public/              # Static assets
├── README.md            # This file
├── ARCHITECTURE.md      # Architecture documentation
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.js       # Next.js config
└── tailwind.config.ts   # Tailwind config
```

---

## Phase 1 Constraints

### What Phase 1 IS

- ✅ **Safe Scaffolding**: Repository structure and routing foundation
- ✅ **Documentation**: Comprehensive architecture and planning docs
- ✅ **Stub Interfaces**: Empty placeholders for future systems
- ✅ **Build Verification**: Ensures the foundation compiles cleanly
- ✅ **Zero Risk**: No impact on existing applications or deployments

### What Phase 1 IS NOT

- ❌ **No Migrations**: Existing apps remain untouched
- ❌ **No Deletions**: No repos or deployments removed
- ❌ **No Traffic**: No customer-facing changes
- ❌ **No Data**: No database or authentication
- ❌ **No Features**: No production-ready functionality

### Safety Guardrails

1. All existing repositories continue operating normally
2. All existing Vercel deployments remain active
3. No customer traffic is affected
4. No data migrations occur
5. No authentication is implemented
6. No external integrations are active

---

## Roadmap

### ✅ Phase 1: Foundation (Current)
- Create repository structure
- Scaffold route groups
- Document architecture
- Verify build process

### 🔜 Phase 2: Content Tools Migration (Weeks 3-4)
- Migrate presentation maker
- Migrate resume builder
- Migrate ebook creator
- Migrate social posts
- Migrate email templates

### 🔜 Phase 3: Collectors Consolidation (Weeks 5-8)
- Create collector template system
- Migrate pilot collectors (5 apps)
- Migrate remaining collectors in batches
- Implement dynamic routing

### 🔜 Phase 4: Vertical Integration (Weeks 9-12)
- Assess vertical app requirements
- Migrate suitable verticals to platform
- Maintain complex verticals separate

### 🔜 Phase 5: Legacy Cleanup (Weeks 13-14)
- Archive inactive repos
- Final documentation updates
- Performance optimization

**Timeline:** 12-14 weeks total for full consolidation

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture design
- **[Consolidation Report](https://github.com/CR-AudioViz-AI/crav-docs/blob/main/docs/system/consolidation/LAYER_0.7.1_REPO_APP_CONSOLIDATION_REPORT.md)** - Full consolidation analysis

---

## Contributing

This repository is in foundation phase. Contributions are currently limited to:
- Documentation improvements
- Architecture feedback
- Build process enhancements

Production feature development will begin in Phase 2+.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18+
- **Build Tool**: Next.js SWC compiler

**Future Additions (Phase 2+):**
- Database: Supabase PostgreSQL
- Auth: OAuth (Google, Microsoft, Apple)
- Payments: Stripe
- AI: OpenAI, Anthropic, Google Gemini
- Hosting: Vercel
- Monitoring: Autonomous bots

---

## License

Proprietary - CR AudioViz AI, LLC

---

## Contact

**Organization:** CR AudioViz AI, LLC  
**CEO & Co-Founder:** Roy Henderson  
**CMO & Co-Founder:** Cindy Henderson  
**Mission:** "Your Story. Our Design"

For questions about this consolidation initiative, please refer to the comprehensive consolidation report in crav-docs.

---

**Last Updated:** 2026-01-13  
**Version:** 0.1.0 (Phase 1 Foundation)  
**Status:** Scaffolding Complete ✅
