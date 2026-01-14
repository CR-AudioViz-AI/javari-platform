# Proof Engine - Universe Verification System

**Phase Ω-IV: Automated Universe Verification**

## Overview

The Proof Engine automatically verifies all universes nightly, checking manifest validity, workflow existence, API routes, UI pages, assets, and feature flags.

---

## Features

- **Automated Verification**: Nightly GitHub Actions workflow
- **Comprehensive Checks**: 6 validation categories
- **Performance Metrics**: Load time and workflow execution tracking
- **Visual Dashboard**: Real-time verification status
- **Error Reporting**: Detailed errors and warnings
- **Historical Tracking**: Results saved to Git

---

## Verification Categories

### 1. Manifest Validation
Checks:
- ID present and valid
- Name and description
- Version string
- Workflows array
- API array
- Credits object

### 2. Workflow Validation
Checks:
- Workflow files exist in `orchestrator/workflows/{universe}/`
- All manifested workflows have corresponding .ts files

### 3. API Validation
Checks:
- API route files exist in `app/api/{universe}/{endpoint}/`
- All manifested endpoints have route.ts files

### 4. UI Validation
Checks:
- Main pages exist (hub, dashboard, detail, tools, workflows)
- UI files in correct location

### 5. Assets Validation
Checks:
- Asset directory paths defined
- Storage structure valid

### 6. Feature Flags Validation
Checks:
- Features array populated
- Feature flags defined in manifest

---

## Usage

### Run Manual Verification

```bash
npm run proof
```

### Verify Single Universe

```typescript
import { verifyUniverse } from '@/orchestrator/proof/universeVerifier';
import { universeRegistry } from '@/orchestrator/universes/registry/universeRegistry';

const manifest = universeRegistry.getUniverse('wine_cellar');
const result = await verifyUniverse('wine_cellar', manifest!);

console.log('Valid:', result.manifestValid && result.workflowsValid);
```

### Run Full Proof

```typescript
import { runFullProof } from '@/orchestrator/proof/proofRunner';

const report = await runFullProof();
console.log(`${report.passedUniverses}/${report.totalUniverses} passed`);
```

---

## Verification Results

### Result Structure

```typescript
interface UniverseVerificationResult {
  universeId: string;
  universeName: string;
  manifestValid: boolean;
  workflowsValid: boolean;
  apiValid: boolean;
  uiValid: boolean;
  assetsValid: boolean;
  featureFlagsValid: boolean;
  loadTimeMs: number;
  errors: string[];
  warnings: string[];
  details: {
    manifestChecks: Record<string, boolean>;
    workflowChecks: Record<string, boolean>;
    apiChecks: Record<string, boolean>;
    uiChecks: Record<string, boolean>;
  };
}
```

---

## Proof Dashboard

Access at: `/verification`

Features:
- Summary statistics
- Validation breakdown
- Universe details
- Error/warning display
- Performance metrics

---

## Nightly Automation

GitHub Actions workflow runs daily at 4 AM UTC:

1. Checkout code
2. Install dependencies
3. Run proof verification
4. Upload results artifact
5. Commit results to repository
6. Generate summary report

---

## Report Format

**proof-results.json**:

```json
{
  "timestamp": "2026-01-13T19:00:00.000Z",
  "totalUniverses": 3,
  "passedUniverses": 3,
  "failedUniverses": 0,
  "results": [...],
  "summary": {
    "manifestValidation": 3,
    "workflowValidation": 3,
    "apiValidation": 3,
    "uiValidation": 3,
    "assetsValidation": 3,
    "featureFlagsValidation": 3
  }
}
```

---

**Phase Ω-IV Complete!** 🎉

Automated universe verification with nightly proof runs.
