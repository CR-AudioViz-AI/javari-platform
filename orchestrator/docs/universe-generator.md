# Universe Auto-Generation Framework (Phase Ω-II)

**Instant Universe Creation via CLI and Batch Processing**

## Overview

Phase Ω-II enables creation of unlimited universes from a single command or batch list.

---

## CLI Usage

### Generate Single Universe

```bash
npx javari make-universe wine_cellar
```

**This creates**:
- ✅ Universe manifest (`wine_cellar.json`)
- ✅ 3 default workflows (summary, insights, analysis)
- ✅ 4 API route stubs (create, update, search, analyze)
- ✅ UI entry point with dashboard layout
- ✅ Asset directory structure
- ✅ Feature flag documentation

---

## Batch Generation

### Generate Multiple Universes

```typescript
import { generateUniverses } from '@/orchestrator/universe-generator/pipeline';

await generateUniverses([
  "wine_cellar",
  "crypto_portfolio",
  "nft_gallery",
  "classic_cars",
  "rare_books"
]);
```

**Output**: 5 complete universes with all scaffolding

---

## Auto-Generated Components

For each universe, the generator creates:

### 1. Manifest (`orchestrator/universes/manifests/{id}.json`)
```json
{
  "id": "wine_cellar",
  "name": "Wine Cellar Universe",
  "description": "Auto-generated Wine Cellar universe",
  "version": "1.0.0",
  "features": ["ai_generation", "portfolio_tracking", "analytics"],
  "workflows": ["wine_cellar_summary", "wine_cellar_insights", "wine_cellar_analysis"],
  "api": ["create", "update", "search", "analyze"],
  "ui": ["dashboard", "list", "detail"],
  "credits": {
    "SUMMARY": 30,
    "INSIGHTS": 50,
    "ANALYSIS": 75
  }
}
```

### 2. Workflows (`orchestrator/workflows/{id}/`)
- `{id}_summary.workflow.ts`
- `{id}_insights.workflow.ts`
- `{id}_analysis.workflow.ts`

Each with complete WorkflowDefinition structure.

### 3. API Routes (`app/api/{id}/`)
- `create/route.ts`
- `update/route.ts`
- `search/route.ts`
- `analyze/route.ts`

### 4. UI Entry Point (`app/(communities)/communities/[id]/{id}/page.tsx`)
Complete React component with dashboard layout.

### 5. Asset Directories
Paths defined for:
- `/mnt/user-data/universes/{id}/images`
- `/mnt/user-data/universes/{id}/documents`
- `/mnt/user-data/universes/{id}/data`

---

## Customization Workflow

After generation:

1. **Review Manifest**: Edit features, workflows, credits
2. **Customize Workflows**: Implement AI logic in workflow files
3. **Build API Logic**: Add business logic to route handlers
4. **Design UI**: Enhance the auto-generated page
5. **Enable Feature Flag**: Set `NEXT_PUBLIC_{ID}_ENABLED=true`

---

## Validation

All generated manifests are validated with Zod:

```typescript
import { validateUniverseManifest } from '@/orchestrator/universe-generator/validate';

const result = validateUniverseManifest(manifest);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

---

## Examples

### Wine Cellar Universe
```bash
npx javari make-universe wine_cellar
```

Creates complete wine collection management universe.

### Crypto Portfolio Universe
```bash
npx javari make-universe crypto_portfolio
```

Creates crypto tracking and analysis universe.

### NFT Gallery Universe
```bash
npx javari make-universe nft_gallery
```

Creates NFT collection and valuation universe.

---

## Technical Details

**Template Engine**: Generates TypeScript/React code from patterns
**Validation**: Zod schema enforcement
**File System**: Automatic directory creation
**Safety**: Error handling and rollback support

---

**Phase Ω-II Complete!** 🎉

Create unlimited universes instantly with single command or batch processing.
