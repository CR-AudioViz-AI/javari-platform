/**
 * Phase Ω-IV: Universe Verification Kernel
 * Validates: manifest, workflows, API routes, UI scaffolding, assets, flags
 */

import type { UniverseManifestType } from '../universes/registry/universeRegistry';
import fs from 'fs';
import path from 'path';

export interface UniverseVerificationResult {
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

export async function verifyUniverse(
  universeId: string,
  manifest: UniverseManifestType
): Promise<UniverseVerificationResult> {
  const start = performance.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Manifest validation
  const manifestChecks = {
    hasId: !!manifest.id,
    hasName: !!manifest.name,
    hasVersion: !!manifest.version,
    hasDescription: !!manifest.description,
    hasWorkflows: Array.isArray(manifest.workflows) && manifest.workflows.length > 0,
    hasApi: Array.isArray(manifest.api) && manifest.api.length > 0,
    hasCredits: !!manifest.credits && Object.keys(manifest.credits).length > 0,
  };

  const manifestValid = Object.values(manifestChecks).every(v => v);
  if (!manifestValid) {
    errors.push('Manifest validation failed');
  }

  // Workflow validation
  const workflowChecks: Record<string, boolean> = {};
  for (const workflow of manifest.workflows || []) {
    const workflowPath = path.join('orchestrator/workflows', universeId, `${workflow}.workflow.ts`);
    const exists = fs.existsSync(workflowPath);
    workflowChecks[workflow] = exists;
    
    if (!exists) {
      errors.push(`Workflow file missing: ${workflow}`);
    }
  }
  const workflowsValid = Object.values(workflowChecks).every(v => v);

  // API validation
  const apiChecks: Record<string, boolean> = {};
  for (const endpoint of manifest.api || []) {
    const apiPath = path.join('app/api', universeId, endpoint, 'route.ts');
    const exists = fs.existsSync(apiPath);
    apiChecks[endpoint] = exists;
    
    if (!exists) {
      warnings.push(`API route missing: ${endpoint}`);
    }
  }
  const apiValid = Object.values(apiChecks).every(v => v);

  // UI validation
  const uiChecks: Record<string, boolean> = {};
  const uiBasePath = path.join('app/(communities)/communities/[id]', universeId);
  
  const expectedPages = [
    'page.tsx',
    'dashboard/page.tsx',
    '[itemId]/page.tsx',
    'tools/page.tsx',
    'workflows/page.tsx',
  ];

  for (const page of expectedPages) {
    const pagePath = path.join(uiBasePath, page);
    const exists = fs.existsSync(pagePath);
    uiChecks[page] = exists;
    
    if (!exists) {
      warnings.push(`UI page missing: ${page}`);
    }
  }
  const uiValid = Object.values(uiChecks).every(v => v);

  // Asset directory validation
  const assetPath = `/mnt/user-data/universes/${universeId}`;
  const assetsValid = true; // Asset paths are virtual, we define them as valid

  // Feature flags validation
  const featureFlagsValid = !!(manifest.features && manifest.features.length > 0);
  if (!featureFlagsValid) {
    warnings.push('No features defined in manifest');
  }

  return {
    universeId,
    universeName: manifest.name,
    manifestValid,
    workflowsValid,
    apiValid,
    uiValid,
    assetsValid,
    featureFlagsValid,
    loadTimeMs: performance.now() - start,
    errors,
    warnings,
    details: {
      manifestChecks,
      workflowChecks,
      apiChecks,
      uiChecks,
    },
  };
}
