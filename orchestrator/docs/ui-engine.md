# UI Engine - Universal UX Auto-Scaffolder

**Phase Ω-III: Automatic UI Generation from Manifest**

## Overview

The UI Engine automatically generates complete, production-ready UI scaffolding for any universe based solely on its manifest JSON.

---

## Features

- **Manifest-Driven**: UI adapts automatically to manifest data
- **Complete Scaffolding**: 7+ page types + 4 common components
- **Type-Safe**: Fully typed TypeScript/React
- **Dark Mode**: Built-in dark/light mode support
- **Responsive**: Mobile-first responsive design
- **Next.js 14**: App Router compatible
- **Zero Hardcoding**: No universe-specific logic

---

## Generated Pages

### 1. Hub Page (`page.tsx`)
Main entry point with:
- Quick action cards (Dashboard, Add New, Tools, Workflows)
- Feature badges grid
- Available workflows display

### 2. Dashboard (`dashboard/page.tsx`)
Analytics and stats with:
- Statistics cards (Total Items, Total Value, Recent Activity)
- Recent items list
- Quick actions based on API endpoints

### 3. Detail Page (`[itemId]/page.tsx`)
Individual item view with:
- Overview and details sections
- Workflow action buttons
- Metadata sidebar

### 4. Tools Page (`tools/page.tsx`)
AI tools interface with:
- Tool cards for each workflow
- Credit costs display
- "Use Tool" actions

### 5. Workflows Page (`workflows/page.tsx`)
Workflow management with:
- Workflow list (sidebar)
- Workflow details panel
- Run workflow actions

### 6. Category Browser (`categories/page.tsx`)
Category navigation (if enabled) with:
- Category cards grid
- Item counts per category

### 7. Common Components
- `ItemCard.tsx` - Reusable item display
- `ItemList.tsx` - List view component
- `ItemTable.tsx` - Table view component
- `FilterBar.tsx` - Search and filter UI

---

## Usage

### Generate UI for Universe

```typescript
import { generateUniverseUI } from '@/orchestrator/ui-engine/uiFactory';
import { universeRegistry } from '@/orchestrator/universes/registry/universeRegistry';

// Load universe manifest
universeRegistry.loadAll();
const manifest = universeRegistry.getUniverse('wine_cellar');

// Generate UI
const result = await generateUniverseUI({
  universeId: 'wine_cellar',
  manifest: manifest!,
});

console.log(`Created ${result.filesCreated.length} files`);
```

### Integration with Universe Generator

```typescript
import { buildUniverse } from '@/orchestrator/universe-generator/generator';
import { generateUniverseUI } from '@/orchestrator/ui-engine/uiFactory';

// Generate universe + UI in one step
await buildUniverse('wine_cellar');
const manifest = universeRegistry.getUniverse('wine_cellar');
await generateUniverseUI({
  universeId: 'wine_cellar',
  manifest: manifest!
});
```

---

## Manifest Integration

### Features → UI Mapping

```json
{
  "features": ["ai_generation", "portfolio_tracking", "analytics"]
}
```

Generates:
- Feature badges on hub page
- Conditional category browser (if "categories" feature)
- Dashboard stats based on tracking features

### Workflows → UI Mapping

```json
{
  "workflows": ["wine_cellar_summary", "wine_cellar_insights"]
}
```

Generates:
- Workflow cards on hub page
- Tool cards on tools page
- Workflow list on workflows page
- Action buttons on detail page

### API → UI Mapping

```json
{
  "api": ["create", "update", "search", "analyze"]
}
```

Generates:
- Quick action buttons on dashboard
- Form actions on create/update pages

### Credits → UI Mapping

```json
{
  "credits": {
    "SUMMARY": 30,
    "INSIGHTS": 50
  }
}
```

Generates:
- Credit cost display on tool cards
- Pricing information in UI

---

## Customization

All generated files are templates that can be customized:

1. **Generated files** are starting points
2. **Modify directly** in output directory
3. **Add business logic** to placeholder sections
4. **Style with Tailwind** (already included)
5. **Integrate with APIs** (stubs provided)

---

## Dark Mode Support

All components include dark mode classes:

```tsx
className="bg-white dark:bg-gray-800"
className="text-gray-600 dark:text-gray-400"
```

---

## Responsive Design

All layouts include responsive breakpoints:

```tsx
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

---

## Example Output

For universe `wine_cellar`, generates:

```
app/(communities)/communities/[id]/wine_cellar/
├── page.tsx                    (Hub)
├── dashboard/
│   └── page.tsx               (Dashboard)
├── [itemId]/
│   └── page.tsx               (Detail)
├── tools/
│   └── page.tsx               (Tools)
├── workflows/
│   └── page.tsx               (Workflows)
├── categories/
│   └── page.tsx               (Categories)
└── components/
    ├── ItemCard.tsx
    ├── ItemList.tsx
    ├── ItemTable.tsx
    └── FilterBar.tsx
```

---

**Phase Ω-III Complete!** 🎉

Automatic UI generation for unlimited universes.
