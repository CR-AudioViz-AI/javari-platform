# Integrity Engine - Universe Specification & Validation

**Phase Ω-V: Specification-Driven Universe Management**

## Overview

The Integrity Engine defines formal specifications for universes, validates them against these specs, and builds dependency graphs to ensure system-wide consistency.

---

## Features

- **Formal Specifications**: Zod schemas for universes, workflows, and APIs
- **Dependency Management**: Directed graph with topological sorting
- **Validation System**: Comprehensive validation with errors and warnings
- **Compatibility Checking**: Version and dependency compatibility
- **Integrity Reports**: Automated system-wide validation

---

## Specification Schema

### Universe Specification

```typescript
{
  id: string;              // lowercase_with_underscores
  name: string;
  version: string;         // Semver format
  description: string;     // Min 10 chars
  
  workflows: string[];     // Min 1 required
  apis: string[];          // Min 1 required
  ui: string[];            // Min 1 required
  storage: string[];
  features: string[];
  
  metrics: {
    load_factor: number;             // 0-1
    response_expectation_ms: number; // 1-10000
    ai_cost_per_action: number;      // >= 0
    max_concurrent_users: number;    // >= 1
  };
  
  dependencies: string[];
  integrations: string[];
  credits: Record<string, number>;
  tags: string[];
  status: 'active' | 'beta' | 'deprecated';
}
```

---

## Dependency Graph

### Building the Graph

```typescript
import { UniverseGraph } from '@/orchestrator/integrity/graph/universeGraph';

const graph = new UniverseGraph();

graph.addUniverse('base_universe', []);
graph.addUniverse('child_universe', ['base_universe']);
graph.addUniverse('dependent_universe', ['child_universe']);

// Resolve load order (dependencies first)
const loadOrder = graph.resolveOrder();
// Result: ['base_universe', 'child_universe', 'dependent_universe']
```

### Circular Dependency Detection

```typescript
const hasCircular = graph.hasCircularDependencies();

if (hasCircular) {
  console.error('Circular dependencies detected!');
}
```

### Graph Statistics

```typescript
const stats = graph.getStats();
// {
//   totalNodes: 10,
//   totalEdges: 15,
//   orphanNodes: 2,
//   maxDepth: 3
// }
```

---

## Validation

### Validate Universe Spec

```typescript
import { validateUniverseSpec } from '@/orchestrator/integrity/validators/universeValidator';

const result = validateUniverseSpec(universeData);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

### Validate Compatibility

```typescript
import { validateCompatibility } from '@/orchestrator/integrity/validators/universeValidator';

const result = validateCompatibility(universe, dependency);

if (!result.valid) {
  console.error('Incompatible dependency:', result.errors);
}
```

---

## Integrity Checking

### Run Full Check

```bash
npm run integrity
```

### Programmatic Usage

```typescript
import { runIntegrityCheck } from '@/orchestrator/integrity/integrityChecker';

const report = await runIntegrityCheck();

console.log(`Valid: ${report.validUniverses}/${report.totalUniverses}`);
console.log(`Load Order: ${report.loadOrder.join(' → ')}`);
```

---

## Integrity Report

### Report Structure

```json
{
  "timestamp": "2026-01-13T20:00:00.000Z",
  "totalUniverses": 3,
  "validUniverses": 3,
  "invalidUniverses": 0,
  "circularDependencies": false,
  "loadOrder": ["real_estate", "collections", "collectibles"],
  "validationResults": {
    "real_estate": {
      "valid": true,
      "errors": [],
      "warnings": []
    }
  },
  "graphStats": {
    "totalNodes": 3,
    "totalEdges": 0,
    "orphanNodes": 3,
    "maxDepth": 0
  }
}
```

---

## Validation Warnings

The system generates warnings for:

- Empty workflow/API/UI arrays
- High load factors (>0.8)
- Slow response expectations (>5s)
- High AI costs (>$1.00)
- Brief descriptions (<50 chars)
- Version mismatches
- Deprecated dependencies

---

**Phase Ω-V Complete!** 🎉

Formal specification and integrity validation for all universes.
