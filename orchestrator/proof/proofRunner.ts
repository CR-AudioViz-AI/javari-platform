/**
 * Phase Ω-IV: Runs verification on ALL universes
 */

import { universeRegistry } from '../universes/registry/universeRegistry';
import { verifyUniverse } from './universeVerifier';
import fs from 'fs';
import path from 'path';

export interface ProofReport {
  timestamp: string;
  totalUniverses: number;
  passedUniverses: number;
  failedUniverses: number;
  results: any[];
  summary: {
    manifestValidation: number;
    workflowValidation: number;
    apiValidation: number;
    uiValidation: number;
    assetsValidation: number;
    featureFlagsValidation: number;
  };
}

export async function runFullProof(): Promise<ProofReport> {
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-IV: Universe Proof Runner');
  console.log('══════════════════════════════════════\n');

  universeRegistry.loadAll();
  const universes = universeRegistry.getAllUniverses();

  console.log(`Found ${universes.length} universes to verify\n`);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  const summary = {
    manifestValidation: 0,
    workflowValidation: 0,
    apiValidation: 0,
    uiValidation: 0,
    assetsValidation: 0,
    featureFlagsValidation: 0,
  };

  for (const universe of universes) {
    console.log(`Verifying: ${universe.name}...`);
    
    try {
      const result = await verifyUniverse(universe.id, universe);
      results.push(result);

      const passed = 
        result.manifestValid &&
        result.workflowsValid &&
        result.apiValid &&
        result.uiValid &&
        result.assetsValid &&
        result.featureFlagsValid;

      if (passed) {
        passedCount++;
        console.log(`  ✓ PASSED (${result.loadTimeMs.toFixed(1)}ms)`);
      } else {
        failedCount++;
        console.log(`  ✗ FAILED`);
        if (result.errors.length > 0) {
          result.errors.forEach(err => console.log(`    - ${err}`));
        }
      }

      // Update summary
      if (result.manifestValid) summary.manifestValidation++;
      if (result.workflowsValid) summary.workflowValidation++;
      if (result.apiValid) summary.apiValidation++;
      if (result.uiValid) summary.uiValidation++;
      if (result.assetsValid) summary.assetsValidation++;
      if (result.featureFlagsValid) summary.featureFlagsValidation++;

    } catch (error) {
      failedCount++;
      console.log(`  ✗ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const report: ProofReport = {
    timestamp: new Date().toISOString(),
    totalUniverses: universes.length,
    passedUniverses: passedCount,
    failedUniverses: failedCount,
    results,
    summary,
  };

  // Write report to file
  const outputPath = 'proof-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log('\n══════════════════════════════════════');
  console.log('   Proof Complete');
  console.log('══════════════════════════════════════');
  console.log(`Total Universes: ${universes.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`\nReport saved to: ${outputPath}\n`);

  return report;
}
