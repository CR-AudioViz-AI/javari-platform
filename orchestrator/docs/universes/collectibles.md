# Collectibles Universe

**Phase III: Multi-category collectibles platform with dynamic plugins**

## Architecture Overview

Complete collectibles management system with:
- Dynamic category plugin architecture
- AI identification, valuation, grading, authenticity
- 11+ supported categories (extensible)
- Portfolio tracking & analytics
- Spirits database integration
- Community sharing

---

## Category Plugin System

### Registry
**File**: `orchestrator/collectibles/categoryRegistry.ts`

Dynamically loads all category configs from JSON files.

### Category Config Structure
```json
{
  "id": "category_id",
  "name": "Display Name",
  "attributes": [...],
  "aiHints": {
    "identificationPrompt": "...",
    "gradingRules": "...",
    "valuationRules": "..."
  },
  "supportedTools": ["identification", "valuation", "grading"]
}
```

### Supported Categories (11+)
1. Spirits & Whiskey
2. Comic Books
3. Vinyl Records
4. Trading Cards
5. Stamps
6. Sneakers
7. Luxury Watches
8. Collectible Toys
9. Retro Video Games
10. Fine Art
11. Shot Glasses (example custom category)

**Extensible**: Add new categories by creating JSON config

---

## AI Workflows

### 1. Identification (30 credits)
- Image-based identification
- Category-specific prompts
- Attribute extraction
- Provider: Claude Sonnet

### 2. Valuation (75 credits)
- Market research (Perplexity)
- Price estimation (Claude)
- Value range + confidence
- Source attribution

### 3. Grading (40 credits)
- Condition assessment
- Defect identification
- Industry-standard grading
- Provider: Claude Sonnet

### 4. Authenticity (60 credits)
- Red flag detection
- Green flag identification
- Risk scoring (0-1)
- Recommendation

---

## Credit Pricing

| Feature | Credits | USD |
|---------|---------|-----|
| Identification | 30 | $0.30 |
| Valuation | 75 | $0.75 |
| Grading | 40 | $0.40 |
| Authenticity | 60 | $0.60 |
| Forecast | 50 | $0.50 |
| Spirit Enrich | 25 | $0.25 |
| Portfolio Report | 100 | $1.00 |

**Full Analysis**: 205 credits ($2.05)

---

## Database Schema

### Tables (11)
1. **collectibles** - Core inventory
2. **collectible_images** - Image gallery
3. **collectible_attributes** - Category-specific data (JSONB)
4. **valuations** - AI valuations with sources
5. **valuation_sources** - Market data
6. **authenticity_checks** - Fraud detection
7. **sales_history** - Buy/sell tracking
8. **user_collections** - Named portfolios
9. **watchlists** - Want lists
10. **spirits_products** - Spirits database
11. **spirits_metadata** - Extended spirits data

---

## Asset Vault

```
/mnt/user-data/collectibles/{collectibleId}/
├── images/
│   ├── front.jpg
│   ├── back.jpg
│   └── detail.jpg
└── documents/
    ├── certificate.pdf
    └── provenance.pdf
```

---

## API Routes

- POST /api/collectibles/create
- POST /api/collectibles/identify
- POST /api/collectibles/value
- POST /api/collectibles/grade
- POST /api/collectibles/authenticity
- GET /api/collectibles/categories

---

## Feature Flags

```env
NEXT_PUBLIC_COLLECTIBLES_UNIVERSE_ENABLED=true
NEXT_PUBLIC_COLLECTIBLES_AI_IDENTIFICATION=true
NEXT_PUBLIC_COLLECTIBLES_AI_VALUATION=true
NEXT_PUBLIC_COLLECTIBLES_AI_GRADING=true
NEXT_PUBLIC_COLLECTIBLES_AI_AUTHENTICITY=true
NEXT_PUBLIC_COLLECTIBLES_DYNAMIC_CATEGORIES_ENABLED=true
```

---

## Adding New Categories

1. Create JSON config in `orchestrator/collectibles/categories/`
2. Define attributes and AI hints
3. Registry auto-loads on startup
4. UI renders dynamically
5. AI workflows adapt automatically

**No code changes required!**

---

**Phase III Complete!** 🎉
