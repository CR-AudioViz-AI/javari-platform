# Collections Universe (Debt Operations)

**Phase II: Complete debt collection management platform**

## Overview

Complete FDCPA-compliant debt collection management system with AI-powered segmentation, outreach automation, client reporting, and performance dashboards.

## Data Model

### Tables (6)
- **accounts** - Debtor accounts under collection
- **account_notes** - Case notes and communications
- **account_actions** - Action history
- **client_profiles** - Collection agency clients
- **placements** - Account placement batches
- **account_segments** - Segmentation data

## Segmentation Logic

**Scoring Algorithm** (0-100):
- Balance (0-30 points)
- Age (0-25 points) - newer = higher priority
- Responsiveness (0-25 points)
- Risk (0-20 points) - state-based

**Segments**:
- Critical (75-100)
- High (50-74)
- Medium (25-49)
- Low (0-24)

## Outreach Rules (FDCPA)

**Required Elements**:
- Mini-Miranda statement
- Dispute rights (30-day notice)
- No threats or harassment
- No legal overreach

**Forbidden Content**:
- Threats of arrest/jail
- Credit reporting threats
- Employment contact threats
- Shame/embarrassment tactics

## Credit Pricing

| Feature | Credits | USD |
|---------|---------|-----|
| Account Intelligence | 60 | $0.60 |
| Segmentation | 50 | $0.50 |
| First Notice | 25 | $0.25 |
| Follow-Up | 30 | $0.30 |
| Settlement Offer | 50 | $0.50 |
| Client Report | 90 | $0.90 |
| Supervisor Digest | 40 | $0.40 |
| Payment Plan | 50 | $0.50 |

## API Routes

- POST /api/collections/accounts/create
- POST /api/collections/accounts/segment
- POST /api/collections/outreach/generate
- POST /api/collections/reports/client
- GET /api/collections/dashboard/supervisor

## Rollback

Disable via `COLLECTIONS_UNIVERSE_ENABLED=false`
- Hides UI
- Blocks API calls
- Preserves database

---

**Compliance Note**: All outreach must be reviewed by legal counsel before deployment.
